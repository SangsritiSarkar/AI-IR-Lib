"""
RAG Engine: ChromaDB + Local Embeddings (sentence-transformers) + Azure OpenAI GPT
- Embeddings run FREE and LOCALLY using sentence-transformers (no Azure embedding needed)
- Only Azure GPT is used for analysis and ranking
- Everything else stays the same
"""

import json
import asyncio
import logging
import hashlib
from typing import Optional

import pandas as pd
import chromadb
from chromadb.config import Settings
from openai import AzureOpenAI
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Local embedding model — downloads once (~90MB), then cached forever
# "all-MiniLM-L6-v2" is fast, small, and works great for this use case
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Column name aliases — maps common variations to canonical names
# Add as many variants as you like here
COLUMN_ALIASES = {
    "source_name":    ["sourcename", "source name", "source", "framework name", "frameworkname"],
    "topic":          ["topic"],
    "sub_topic":      ["subtopic", "sub topic", "sub-topic", "subtopicname", "subtopic"],
    "section_number": ["sectionnumber", "section number", "section", "control id", "controlid", "id", "sectionnumber"],
    "requirements":   ["requirements", "requirement", "description", "control description", "control", "controldescription"],
    "theme":          ["theme", "granulartheme", "granular theme", "control theme", "controltopic"],
}

# These are known "title-only" row patterns — rows where the first non-empty
# cell looks like a heading/title rather than actual data.
# If a sheet's first row contains one of these words spanning merged cells,
# pandas will pick it up as the header row — we detect and skip it.
TITLE_ROW_KEYWORDS = [
    "control objectives", "national institute", "payment card",
    "information security", "cybersecurity framework", "iso/iec",
    "nist", "pci", "cobit", "tisax", "nis 2", "mlps", "fda",
    "framework", "regulation", "standard",
]


def _find_real_header_row(filepath: str, sheet_name: str) -> int:
    """
    Scan the first 5 rows to find the row that contains actual column headers
    like 'Source Name', 'Topic', 'Requirement', etc.
    Returns the 0-based row index to use as pandas header.
    """
    # Read raw without any header assumption
    raw = pd.read_excel(filepath, sheet_name=sheet_name, header=None, dtype=str, nrows=6)

    header_keywords = {"source", "topic", "requirement", "section", "theme", "control", "sub"}

    for i, row in raw.iterrows():
        row_values = [str(v).lower().strip() for v in row if str(v).strip() not in ("", "nan")]
        # Check if this row looks like a header (contains multiple known column words)
        matches = sum(1 for v in row_values if any(kw in v for kw in header_keywords))
        if matches >= 2:
            return i  # This row index is the real header

    return 0  # fallback: first row


def _normalize_row(row: dict) -> dict:
    """Map raw column names to canonical field names."""
    normed = {k.lower().replace(" ", "").replace("-", "").replace("_", ""): v for k, v in row.items()}
    result = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            key = alias.replace(" ", "").replace("-", "").replace("_", "")
            if key in normed and str(normed[key]).strip():
                result[canonical] = str(normed[key]).strip()
                break
        if canonical not in result:
            result[canonical] = ""
    return result


def _build_document_text(record: dict, framework: str) -> str:
    """Build rich text for embedding — more context = better search results."""
    parts = [
        f"Framework: {framework}",
        f"Topic: {record.get('topic', '')}",
        f"Sub-Topic: {record.get('sub_topic', '')}",
        f"Section: {record.get('section_number', '')}",
        f"Theme: {record.get('theme', '')}",
        f"Requirement: {record.get('requirements', '')}",
    ]
    return " | ".join(p for p in parts if p.split(": ", 1)[1])


class RAGEngine:
    def __init__(self, azure_config: dict):
        self.azure_config = azure_config

        # ── Azure OpenAI (GPT only — NOT for embeddings) ──────────────────
        self.client = AzureOpenAI(
            api_key=azure_config["api_key"],
            azure_endpoint=azure_config["endpoint"],
            api_version=azure_config["api_version"],
        )
        self.chat_deployment = azure_config["deployment_name"]

        # ── Local embedding model (free, runs in Codespace) ───────────────
        # Downloads ~90MB on first run, then cached at ~/.cache/torch/
        logger.info("Loading local embedding model (first run downloads ~90MB)...")
        self.embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info("Embedding model loaded ✓")

        # ── ChromaDB (persistent on disk) ─────────────────────────────────
        self.chroma = chromadb.PersistentClient(
            path="data/chromadb",
            settings=Settings(anonymized_telemetry=False),
        )
        self.fw_collection = self.chroma.get_or_create_collection(
            name="framework_requirements",
            metadata={"hnsw:space": "cosine"},
        )
        self.theme_collection = self.chroma.get_or_create_collection(
            name="themes",
            metadata={"hnsw:space": "cosine"},
        )

        # Cache
        self._framework_names: list[str] = []
        self._frameworks_ready: bool = False
        self._total_records: int = self.fw_collection.count()

        if self._total_records > 0:
            self._frameworks_ready = True
            self._refresh_framework_names()

        logger.info(f"RAGEngine ready. Records in ChromaDB: {self._total_records}")

    # ─── Status ─────────────────────────────────────────────────────────────

    def is_ready(self) -> bool:
        return self._frameworks_ready

    def get_record_count(self) -> int:
        return self.fw_collection.count()

    def get_framework_count(self) -> int:
        return len(self._framework_names)

    def list_frameworks(self) -> list[str]:
        return self._framework_names

    def _refresh_framework_names(self):
        try:
            results = self.fw_collection.get(include=["metadatas"], limit=10000)
            names = {m.get("framework", "") for m in results["metadatas"] if m.get("framework")}
            self._framework_names = sorted(names)
        except Exception:
            self._framework_names = []

    # ─── Local Embedding helpers ─────────────────────────────────────────────

    def _embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Embed a list of texts locally using sentence-transformers.
        Returns list of float vectors. Runs on CPU in Codespace — fast enough.
        """
        embeddings = self.embed_model.encode(
            texts,
            batch_size=64,          # process 64 at a time
            show_progress_bar=True, # shows progress in terminal
            convert_to_numpy=True,
        )
        return embeddings.tolist()

    def _embed_query(self, query: str) -> list[float]:
        """Embed a single query string."""
        return self.embed_model.encode([query], convert_to_numpy=True)[0].tolist()

    # ─── Indexing ────────────────────────────────────────────────────────────

    async def index_frameworks(self, filepath: str) -> dict:
        """Parse Excel workbook → embed all rows locally → store in ChromaDB."""

        # Get all sheet names first
        import openpyxl
        sheet_names = pd.ExcelFile(filepath).sheet_names
        all_records = []

        for sheet_name in sheet_names:
            # Detect the real header row (handles title rows like "COBIT 2019" at top)
            header_row = _find_real_header_row(filepath, sheet_name)
            logger.info(f"Sheet '{sheet_name}': using row {header_row} as header")

            df = pd.read_excel(
                filepath,
                sheet_name=sheet_name,
                header=header_row,
                dtype=str,
            ).fillna("")

            # Drop completely empty rows and rows where all values are whitespace
            df = df.dropna(how="all")
            df = df[df.apply(lambda r: any(str(v).strip() for v in r), axis=1)]

            for _, row in df.iterrows():
                record = _normalize_row(row.to_dict())
                req = record.get("requirements", "").strip()
                if not req or len(req) < 10:
                    continue
                framework = record.get("source_name") or sheet_name
                record["framework"] = framework
                all_records.append((sheet_name, record))

            logger.info(f"Sheet '{sheet_name}': found {sum(1 for s, r in all_records if s == sheet_name)} valid records")

        if not all_records:
            raise ValueError(
                "No requirement records found. "
                "Make sure your Excel columns include: Source Name, Topic, Sub Topic, "
                "Section Number, Requirement (or Requirements), Theme."
            )

        logger.info(f"Parsed {len(all_records)} records from {len(sheet_names)} sheets. Embedding locally...")

        texts = [_build_document_text(r, fw) for fw, r in all_records]

        # Run embedding in thread so it doesn't block the server
        embeddings = await asyncio.to_thread(self._embed_texts, texts)

        # Upsert into ChromaDB in batches of 500
        ids, docs, metas, embeds = [], [], [], []
        seen_ids = {}  # track duplicates and make them unique

        for idx, ((fw, record), text, embedding) in enumerate(zip(all_records, texts, embeddings)):
            # Include sheet name + row index in hash so identical requirements
            # across different frameworks get unique IDs
            raw_id = hashlib.md5(f"{fw}|{idx}|{text}".encode()).hexdigest()

            # Extra safety: if somehow still duplicate, append index
            if raw_id in seen_ids:
                raw_id = f"{raw_id}_{idx}"
            seen_ids[raw_id] = True

            ids.append(raw_id)
            docs.append(text)
            metas.append({
                "framework": record["framework"],
                "sheet": fw,
                "topic": record["topic"],
                "sub_topic": record["sub_topic"],
                "section_number": record["section_number"],
                "requirements": record["requirements"][:1000],
                "theme": record["theme"],
            })
            embeds.append(embedding)

            if len(ids) >= 500:
                self.fw_collection.upsert(
                    ids=ids, documents=docs, metadatas=metas, embeddings=embeds
                )
                ids, docs, metas, embeds = [], [], [], []

        if ids:
            self.fw_collection.upsert(
                ids=ids, documents=docs, metadatas=metas, embeddings=embeds
            )

        self._frameworks_ready = True
        self._total_records = self.fw_collection.count()
        self._refresh_framework_names()

        return {"total": len(all_records), "frameworks": self._framework_names}

    async def index_themes(self, filepath: str) -> dict:
        """
        Parse theme hierarchy Excel.
        Handles TWO layouts automatically:

        Layout A — Vertical (3 columns):
            Main Theme | Sub Theme | Granular Theme
            IT Strategy | Strategy & Planning | Management Reporting

        Layout B — Horizontal matrix (your actual file):
            Row 4:  01. IT Strategy  |  02. Information Security  | ...   ← main themes
            Row 5:  1.1 Strategy...  |  2.1 Identity & Access...  | ...   ← sub themes
            Row 6:  1.1.1 Mgmt Rep.  |  2.1.1 User Access Prov.  | ...   ← granular themes
            ...more granular rows...
        """
        # Read raw without header so we can inspect the structure
        raw_sheets = pd.read_excel(filepath, sheet_name=None, header=None, dtype=str)
        theme_records = []

        for sheet_name, raw in raw_sheets.items():
            raw = raw.fillna("")

            # ── Try Layout A first: look for column headers ────────────────
            # Check if any row contains "main" and "sub" and "granular"
            layout_a_row = None
            for i, row in raw.iterrows():
                vals = [str(v).lower().strip() for v in row]
                if any("main" in v for v in vals) and any("sub" in v for v in vals):
                    layout_a_row = i
                    break

            if layout_a_row is not None:
                # Re-read with proper header
                df = pd.read_excel(filepath, sheet_name=sheet_name,
                                   header=layout_a_row, dtype=str).fillna("")
                for _, row in df.iterrows():
                    norm = {k.lower().replace(" ", "").replace("-", ""): str(v).strip()
                            for k, v in row.items()}
                    main     = norm.get("maintheme") or norm.get("main") or ""
                    sub      = norm.get("subtheme") or norm.get("sub") or ""
                    granular = norm.get("granulartheme") or norm.get("granular") or ""
                    if granular or main:
                        theme_records.append({
                            "main_theme": main,
                            "sub_theme": sub,
                            "granular_theme": granular,
                            "text": f"Main: {main} | Sub: {sub} | Granular: {granular}",
                        })
                logger.info(f"Theme sheet '{sheet_name}': Layout A, {len(theme_records)} records")
                continue

            # ── Layout B: horizontal matrix ────────────────────────────────
            # Structure (from your screenshot):
            #   Row 4 (idx ~3): numbered main themes  "01. IT Strategy", "02. Information Security"...
            #   Row 5 (idx ~4): sub themes            "1.1 Strategy & Planning", "2.1 Identity..."
            #   Row 6+ (idx 5+): granular themes      "1.1.1 Management Reporting", ...
            #
            # Strategy: find the row where cells look like "01. Something" = main theme row
            # Then for each column, walk down to collect sub + granular themes

            main_theme_row = None
            for i, row in raw.iterrows():
                vals = [str(v).strip() for v in row if str(v).strip()]
                # Main theme row has cells like "01. IT Strategy", "02. Information Security"
                numbered = sum(1 for v in vals if v[:2].replace(".", "").strip().isdigit()
                               or (len(v) > 3 and v[0].isdigit() and v[1].isdigit() and v[2] in (".", " ")))
                if numbered >= 2:
                    main_theme_row = i
                    break

            if main_theme_row is None:
                # Fallback: just use all non-empty cell values as granular themes
                logger.warning(f"Theme sheet '{sheet_name}': could not detect layout, using all cells as granular themes")
                for _, row in raw.iterrows():
                    for val in row:
                        v = str(val).strip()
                        if v and v.lower() not in ("nan", "") and len(v) > 3:
                            theme_records.append({
                                "main_theme": "",
                                "sub_theme": "",
                                "granular_theme": v,
                                "text": f"Granular: {v}",
                            })
                continue

            logger.info(f"Theme sheet '{sheet_name}': Layout B (horizontal matrix), main theme row = {main_theme_row}")

            # Build column → main theme mapping
            main_row_data = raw.iloc[main_theme_row]
            sub_theme_row = main_theme_row + 1

            # For each column, find its main theme by looking left until we find a non-empty main theme cell
            col_to_main: dict[int, str] = {}
            current_main = ""
            for col_idx, val in enumerate(main_row_data):
                v = str(val).strip()
                if v and v.lower() != "nan":
                    current_main = v
                col_to_main[col_idx] = current_main

            # Sub theme row (one row below main themes)
            sub_row_data = raw.iloc[sub_theme_row] if sub_theme_row < len(raw) else None

            col_to_sub: dict[int, str] = {}
            if sub_row_data is not None:
                current_sub = ""
                for col_idx, val in enumerate(sub_row_data):
                    v = str(val).strip()
                    if v and v.lower() != "nan":
                        current_sub = v
                    col_to_sub[col_idx] = current_sub

            # All rows below sub theme row = granular themes
            granular_start = sub_theme_row + 1
            for row_idx in range(granular_start, len(raw)):
                row = raw.iloc[row_idx]
                for col_idx, val in enumerate(row):
                    granular = str(val).strip()
                    if not granular or granular.lower() == "nan" or len(granular) < 3:
                        continue
                    main = col_to_main.get(col_idx, "")
                    sub  = col_to_sub.get(col_idx, "")

                    # Skip if this looks like another sub-theme header (has sub-numbering like "2.5")
                    # rather than a granular entry
                    theme_records.append({
                        "main_theme": main,
                        "sub_theme": sub,
                        "granular_theme": granular,
                        "text": f"Main: {main} | Sub: {sub} | Granular: {granular}",
                    })

            logger.info(f"Theme sheet '{sheet_name}': extracted {len(theme_records)} theme records")

        if not theme_records:
            raise ValueError(
                "No theme records found. "
                "Expected either a 3-column layout (Main Theme, Sub Theme, Granular Theme) "
                "or the horizontal matrix layout shown in your screenshot."
            )

        texts = [t["text"] for t in theme_records]
        embeddings = await asyncio.to_thread(self._embed_texts, texts)

        ids, docs, metas, embeds = [], [], [], []
        for idx, (record, text, embedding) in enumerate(zip(theme_records, texts, embeddings)):
            # Use index in hash to guarantee uniqueness even for identical theme text
            doc_id = hashlib.md5(f"{idx}|{text}".encode()).hexdigest()
            ids.append(doc_id)
            docs.append(text)
            metas.append({k: v for k, v in record.items() if k != "text"})
            embeds.append(embedding)

        self.theme_collection.upsert(ids=ids, documents=docs, metadatas=metas, embeddings=embeds)
        return {"total": len(theme_records)}

    # ─── Query ───────────────────────────────────────────────────────────────

    def _build_theme_lookup(self) -> dict[str, dict]:
        """
        Build a lookup dict: granular_theme (lowercased) → {main_theme, sub_theme, granular_theme}
        from everything stored in the theme collection.
        Used to enrich framework results that have empty or partial theme info.
        """
        lookup = {}
        try:
            if self.theme_collection.count() == 0:
                return lookup
            all_themes = self.theme_collection.get(include=["metadatas"], limit=10000)
            for meta in all_themes["metadatas"]:
                granular = str(meta.get("granular_theme", "")).strip()
                if granular:
                    lookup[granular.lower()] = {
                        "main_theme": meta.get("main_theme", ""),
                        "sub_theme":  meta.get("sub_theme", ""),
                        "granular_theme": granular,
                    }
        except Exception as e:
            logger.warning(f"Could not build theme lookup: {e}")
        return lookup

    async def query(self, query: str, top_k: int = 50, framework_filter: Optional[str] = None) -> dict:
        """Full RAG pipeline: embed query → ChromaDB search → GPT ranking → return results."""

        query_embedding = await asyncio.to_thread(self._embed_query, query)

        where_filter = {"framework": {"$eq": framework_filter}} if framework_filter else None

        chroma_results = self.fw_collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, self.fw_collection.count()),
            where=where_filter,
            include=["metadatas", "distances"],
        )

        if not chroma_results["metadatas"] or not chroma_results["metadatas"][0]:
            return {"results": [], "analysis": "No matching records found.", "frameworks": [], "themes": []}

        retrieved = chroma_results["metadatas"][0]
        distances = chroma_results["distances"][0]

        # Retrieve relevant themes for GPT context
        relevant_themes = []
        if self.theme_collection.count() > 0:
            theme_results = self.theme_collection.query(
                query_embeddings=[query_embedding],
                n_results=10,
                include=["metadatas"],
            )
            if theme_results["metadatas"]:
                relevant_themes = theme_results["metadatas"][0]

        # Build theme lookup for enriching results
        theme_lookup = self._build_theme_lookup()

        # GPT analysis and ranking
        analysis, ranked_results = await self._gpt_analyze(
            query, retrieved, distances, relevant_themes, theme_lookup
        )

        frameworks_found = sorted(set(r["framework"] for r in ranked_results))
        main_themes_found = sorted(set(r["main_theme"] for r in ranked_results if r.get("main_theme")))

        return {
            "query": query,
            "results": ranked_results,
            "analysis": analysis,
            "frameworks": frameworks_found,
            "themes": main_themes_found,
            "total": len(ranked_results),
        }

    async def _gpt_analyze(self, query, retrieved, distances, relevant_themes, theme_lookup: dict) -> tuple[str, list[dict]]:
        """Send retrieved records to Azure GPT for relevance scoring and analysis."""

        records_context = []
        for i, (meta, dist) in enumerate(zip(retrieved[:60], distances[:60])):
            records_context.append(
                f"[{i}] FW:{meta.get('framework','')} | "
                f"Topic:{meta.get('topic','')} | "
                f"Theme:{meta.get('theme','')} | "
                f"Req:{meta.get('requirements','')[:200]}"
            )

        theme_context = "\n".join(
            f"  - {t.get('main_theme','')} > {t.get('sub_theme','')} > {t.get('granular_theme','')}"
            for t in relevant_themes[:15]
        ) or "Not available."

        system_prompt = """You are a senior cybersecurity compliance consultant.
Analyze the user's industry/use case and the retrieved compliance records.
Return ONLY valid JSON — no markdown, no explanation outside the JSON.

JSON structure:
{
  "relevant_indices": [0, 3, 7, ...],
  "relevance_scores": {"0": 9, "3": 8, "7": 7, ...},
  "analysis": "3-4 sentence executive summary of applicable frameworks and priorities",
  "key_frameworks": ["PCI DSS v4.01", "NIST CSF 2.0"],
  "top_themes": ["Information Security", "IT Governance"],
  "priority_level": "High",
  "industry_risks": ["data breaches", "payment fraud"]
}

relevant_indices: indices of ALL records that apply to this query
relevance_scores: 1-10 score per relevant index
analysis: write for a CISO audience, mention specific regulation names"""

        user_msg = f"""Client/Industry Context: {query}

Relevant Themes:
{theme_context}

Retrieved Compliance Records:
{chr(10).join(records_context)}

Identify which records are relevant and provide your analysis."""

        response = await asyncio.to_thread(
            lambda: self.client.chat.completions.create(
                model=self.chat_deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.1,
                max_tokens=2000,
            )
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        try:
            gpt_result = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("GPT returned invalid JSON, using all retrieved records")
            gpt_result = {
                "relevant_indices": list(range(len(retrieved))),
                "relevance_scores": {},
                "analysis": raw[:500],
            }

        analysis      = gpt_result.get("analysis", "Analysis not available.")
        relevant_indices = set(gpt_result.get("relevant_indices", range(len(retrieved))))
        relevance_scores = gpt_result.get("relevance_scores", {})

        ranked = []
        for i, meta in enumerate(retrieved):
            if i not in relevant_indices:
                continue

            score = relevance_scores.get(str(i), 5)

            # ── Enrich with Main / Sub theme from theme_lookup ─────────────
            # The framework Excel stores only "granular theme" in the theme column.
            # We look that up in the theme collection to get main + sub theme.
            granular = meta.get("theme", "").strip()
            theme_info = theme_lookup.get(granular.lower(), {})

            main_theme    = theme_info.get("main_theme", "")
            sub_theme     = theme_info.get("sub_theme", "")
            granular_theme = theme_info.get("granular_theme", "") or granular

            # Fallback: if theme_lookup is empty (themes not uploaded),
            # use whatever is in the framework record itself
            if not main_theme and not sub_theme:
                main_theme    = meta.get("topic", "")
                sub_theme     = meta.get("sub_topic", "")
                granular_theme = granular or meta.get("theme", "")

            ranked.append({
                "rank":            0,          # set after sort
                "main_theme":      main_theme,
                "sub_theme":       sub_theme,
                "granular_theme":  granular_theme,
                "section_number":  meta.get("section_number", ""),
                "requirements":    meta.get("requirements", ""),
                "framework":       meta.get("framework", ""),
                # keep these for filtering / export
                "topic":           meta.get("topic", ""),
                "sub_topic":       meta.get("sub_topic", ""),
                "relevance_score": int(score) if str(score).isdigit() else 5,
                "similarity":      round(1 - distances[i], 3),
            })

        ranked.sort(key=lambda x: (x["relevance_score"], x["similarity"]), reverse=True)
        for i, r in enumerate(ranked):
            r["rank"] = i + 1

        return analysis, ranked
