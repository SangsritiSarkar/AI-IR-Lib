"""
RAG Engine: ChromaDB + Azure OpenAI Embeddings
- Parses multi-sheet framework Excel workbooks
- Generates embeddings via Azure OpenAI text-embedding-ada-002
- Stores in persistent ChromaDB collections
- Retrieves semantically relevant records for queries
- Uses GPT to rank, analyze and generate compliance recommendations
"""

import json
import asyncio
import logging
import hashlib
from typing import Optional
from pathlib import Path

import pandas as pd
import chromadb
from chromadb.config import Settings
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

# Column name aliases — maps common variations to canonical names
COLUMN_ALIASES = {
    "source_name":   ["sourcename", "source name", "source", "framework name"],
    "topic":         ["topic"],
    "sub_topic":     ["subtopic", "sub topic", "sub-topic", "subtopicname"],
    "section_number":["sectionnumber", "section number", "section", "control id", "controlid", "id"],
    "requirements":  ["requirements", "requirement", "description", "control description", "control"],
    "theme":         ["theme", "granulartheme", "granular theme", "control theme"],
}


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
    """
    Build the text that will be embedded.
    Richer text = better semantic retrieval.
    """
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
        self._frameworks_ready = False
        self._themes_ready = False

        # Azure OpenAI client
        self.client = AzureOpenAI(
            api_key=azure_config["api_key"],
            azure_endpoint=azure_config["endpoint"],
            api_version=azure_config["api_version"],
        )
        self.chat_deployment = azure_config["deployment_name"]
        self.embed_deployment = azure_config.get("embedding_deployment", "text-embedding-ada-002")

        # Persistent ChromaDB (data survives restarts)
        self.chroma = chromadb.PersistentClient(
            path="data/chromadb",
            settings=Settings(anonymized_telemetry=False),
        )

        # Two collections: one for framework requirements, one for themes
        self.fw_collection = self.chroma.get_or_create_collection(
            name="framework_requirements",
            metadata={"hnsw:space": "cosine"},
        )
        self.theme_collection = self.chroma.get_or_create_collection(
            name="themes",
            metadata={"hnsw:space": "cosine"},
        )

        # In-memory caches
        self._framework_names: list[str] = []
        self._total_records: int = self.fw_collection.count()

        if self._total_records > 0:
            self._frameworks_ready = True
            self._refresh_framework_names()

        logger.info(f"RAGEngine initialized. Existing records: {self._total_records}")

    # ─── Public status ──────────────────────────────────────────────────────

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

    # ─── Embedding helpers ──────────────────────────────────────────────────

    def _embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Batch embed texts using Azure OpenAI. Chunks to 100 items per call."""
        all_embeddings = []
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i: i + batch_size]
            response = self.client.embeddings.create(
                input=batch,
                model=self.embed_deployment,
            )
            all_embeddings.extend([item.embedding for item in response.data])
        return all_embeddings

    def _embed_query(self, query: str) -> list[float]:
        response = self.client.embeddings.create(
            input=[query],
            model=self.embed_deployment,
        )
        return response.data[0].embedding

    # ─── Indexing ───────────────────────────────────────────────────────────

    async def index_frameworks(self, filepath: str) -> dict:
        """Parse Excel workbook and upsert all records into ChromaDB."""
        wb = pd.read_excel(filepath, sheet_name=None, dtype=str)
        all_records = []

        for sheet_name, df in wb.items():
            df = df.fillna("")
            for _, row in df.iterrows():
                record = _normalize_row(row.to_dict())
                req = record.get("requirements", "").strip()
                if not req or len(req) < 10:
                    continue

                # Use sheet name as framework if source_name is empty
                framework = record.get("source_name") or sheet_name
                record["framework"] = framework
                all_records.append((sheet_name, record))

        if not all_records:
            raise ValueError("No requirement records found. Check column names in your Excel file.")

        logger.info(f"Parsed {len(all_records)} records from {len(wb)} sheets. Embedding...")

        # Build document texts for embedding
        texts = [_build_document_text(r, fw) for fw, r in all_records]

        # Embed in async thread to not block event loop
        embeddings = await asyncio.to_thread(self._embed_texts, texts)

        # Upsert to ChromaDB
        ids, docs, metas, embeds = [], [], [], []
        for (fw, record), text, embedding in zip(all_records, texts, embeddings):
            doc_id = hashlib.md5(text.encode()).hexdigest()
            ids.append(doc_id)
            docs.append(text)
            metas.append({
                "framework": record["framework"],
                "sheet": fw,
                "topic": record["topic"],
                "sub_topic": record["sub_topic"],
                "section_number": record["section_number"],
                "requirements": record["requirements"][:1000],  # ChromaDB metadata limit
                "theme": record["theme"],
            })
            embeds.append(embedding)

            # Upsert in batches of 500
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

        return {
            "total": len(all_records),
            "frameworks": self._framework_names,
        }

    async def index_themes(self, filepath: str) -> dict:
        """Parse theme hierarchy Excel and store in themes collection."""
        wb = pd.read_excel(filepath, sheet_name=None, dtype=str)
        theme_records = []

        for _, df in wb.items():
            df = df.fillna("")
            for _, row in df.iterrows():
                norm = {k.lower().replace(" ", "").replace("-", ""): str(v).strip()
                        for k, v in row.items()}
                main = norm.get("maintheme") or norm.get("main") or ""
                sub = norm.get("subtheme") or norm.get("sub") or ""
                granular = norm.get("granulartheme") or norm.get("granular") or ""
                if main or granular:
                    theme_records.append({
                        "main_theme": main,
                        "sub_theme": sub,
                        "granular_theme": granular,
                        "text": f"Main: {main} | Sub: {sub} | Granular: {granular}",
                    })

        if not theme_records:
            raise ValueError("No theme records found. Check column names.")

        texts = [t["text"] for t in theme_records]
        embeddings = await asyncio.to_thread(self._embed_texts, texts)

        ids, docs, metas, embeds = [], [], [], []
        for record, text, embedding in zip(theme_records, texts, embeddings):
            doc_id = hashlib.md5(text.encode()).hexdigest()
            ids.append(doc_id)
            docs.append(text)
            metas.append({k: v for k, v in record.items() if k != "text"})
            embeds.append(embedding)

        self.theme_collection.upsert(ids=ids, documents=docs, metadatas=metas, embeddings=embeds)

        return {"total": len(theme_records)}

    # ─── Query / Retrieval ──────────────────────────────────────────────────

    async def query(self, query: str, top_k: int = 50, framework_filter: Optional[str] = None) -> dict:
        """
        Full RAG pipeline:
        1. Embed query
        2. Retrieve top-K semantically similar requirements from ChromaDB
        3. If themes loaded, retrieve relevant themes too
        4. Pass retrieved context to GPT for analysis + ranking
        5. Return structured results
        """

        # Step 1: Embed query
        query_embedding = await asyncio.to_thread(self._embed_query, query)

        # Step 2: Retrieve from ChromaDB
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

        # Step 3: Retrieve relevant themes
        relevant_themes = []
        if self.theme_collection.count() > 0:
            theme_results = self.theme_collection.query(
                query_embeddings=[query_embedding],
                n_results=10,
                include=["metadatas"],
            )
            if theme_results["metadatas"]:
                relevant_themes = theme_results["metadatas"][0]

        # Step 4: GPT analysis
        analysis, ranked_results = await self._gpt_analyze(query, retrieved, distances, relevant_themes)

        # Step 5: Structure final response
        frameworks_found = sorted(set(r["framework"] for r in ranked_results))
        themes_found = sorted(set(r["theme"] for r in ranked_results if r.get("theme")))

        return {
            "query": query,
            "results": ranked_results,
            "analysis": analysis,
            "frameworks": frameworks_found,
            "themes": themes_found,
            "total": len(ranked_results),
        }

    async def _gpt_analyze(
        self,
        query: str,
        retrieved: list[dict],
        distances: list[float],
        relevant_themes: list[dict],
    ) -> tuple[str, list[dict]]:
        """
        Use GPT to:
        1. Score relevance of each retrieved record (0-10)
        2. Generate an executive compliance analysis
        """

        # Build compact context for GPT (truncate to fit context window)
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
  "industry_risks": ["data breaches", "payment fraud", "DDoS attacks"]
}

relevant_indices: indices of records that apply to the query (be inclusive, include all relevant)
relevance_scores: 1-10 score for each relevant index
analysis: write for a CISO audience, mention specific regulation names"""

        user_msg = f"""Client/Industry Context: {query}

Relevant Themes Available:
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

        analysis = gpt_result.get("analysis", "Analysis not available.")
        relevant_indices = set(gpt_result.get("relevant_indices", range(len(retrieved))))
        relevance_scores = gpt_result.get("relevance_scores", {})

        # Build ranked results
        ranked = []
        for i, meta in enumerate(retrieved):
            if i in relevant_indices:
                score = relevance_scores.get(str(i), 5)
                ranked.append({
                    "rank": 0,  # will set after sort
                    "framework": meta.get("framework", ""),
                    "topic": meta.get("topic", ""),
                    "sub_topic": meta.get("sub_topic", ""),
                    "section_number": meta.get("section_number", ""),
                    "requirements": meta.get("requirements", ""),
                    "theme": meta.get("theme", ""),
                    "relevance_score": int(score) if str(score).isdigit() else 5,
                    "similarity": round(1 - distances[i], 3),
                })

        # Sort by relevance score desc, then similarity
        ranked.sort(key=lambda x: (x["relevance_score"], x["similarity"]), reverse=True)
        for i, r in enumerate(ranked):
            r["rank"] = i + 1

        return analysis, ranked
