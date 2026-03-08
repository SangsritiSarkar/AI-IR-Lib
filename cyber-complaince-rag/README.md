# CyberCompliance Intelligence
### RAG-powered Cybersecurity Framework Advisor
**Stack:** Python · FastAPI · ChromaDB · Azure OpenAI · React · Vite

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│   Config → Upload Excel → Query → View Results → Export Excel  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST
┌──────────────────────────▼──────────────────────────────────────┐
│                     FastAPI Backend                             │
│   /configure   /upload/frameworks   /upload/themes             │
│   /query       /export              /health                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼───────┐  ┌──────▼──────────┐
│  Excel Parser│  │  RAG Engine    │  │  Excel Exporter │
│  (pandas)    │  │  (rag_engine)  │  │  (openpyxl)     │
└──────────────┘  └────────┬───────┘  └─────────────────┘
                           │
              ┌────────────┼────────────┐
              │                         │
   ┌──────────▼──────────┐  ┌──────────▼──────────────┐
   │     ChromaDB         │  │     Azure OpenAI         │
   │  (Persistent Vector  │  │  text-embedding-ada-002  │
   │   Store on disk)     │  │  GPT-4o (chat + rank)    │
   │                      │  └─────────────────────────┘
   │  Collections:        │
   │  - framework_reqs    │
   │  - themes            │
   └──────────────────────┘
```

## RAG Pipeline (Step by Step)

### Indexing Phase (one-time)
1. **Parse** multi-sheet Excel workbook (each sheet = one framework)
2. **Normalize** column names (handles spelling variants automatically)
3. **Build document text** per record:
   `"Framework: NIST CSF 2.0 | Topic: Govern | Theme: ISMS | Req: ..."`
4. **Embed** all texts via `text-embedding-ada-002` (batched, 100/call)
5. **Upsert** into ChromaDB with cosine similarity index (persistent on disk)

### Query Phase
1. **Embed** user's natural-language query
2. **Retrieve** top-K most similar records from ChromaDB (`n_results=80`)
3. **Pass** retrieved records + theme hierarchy to GPT-4o
4. **GPT ranks** records (0–10 relevance score) and writes executive analysis
5. **Return** structured JSON: ranked results, frameworks, themes, analysis
6. **Export** to formatted Excel workbook (Summary + per-framework sheets + Theme Mapping)

---

## Project Structure

```
cyber-rag/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── rag_engine.py        # ChromaDB indexing + RAG query pipeline
│   ├── excel_exporter.py    # Formatted Excel output (openpyxl)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Complete React UI (single file)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── chromadb/            # Persistent ChromaDB storage
│   ├── uploads/             # Uploaded Excel files
│   └── exports/             # Generated output Excel files
├── start.sh                 # One-command startup
└── README.md
```

---

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- Azure OpenAI resource with:
  - Chat deployment (e.g. `gpt-4o`)
  - Embedding deployment (`text-embedding-ada-002`)

### Quick Start

```bash
# Clone / unzip the project, then:
chmod +x start.sh
./start.sh
```

This installs all dependencies and starts both servers.

- **Frontend:** http://localhost:3000
- **API docs:** http://localhost:8000/docs

### Manual Start

```bash
# Backend
cd backend
pip install -r requirements.txt
mkdir -p ../data/chromadb ../data/uploads ../data/exports
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Usage Workflow

### Step 1 — Configure
Enter your Azure OpenAI credentials:
- Endpoint URL
- API Key
- Chat deployment name (e.g. `gpt-4o`)
- Embedding deployment (default: `text-embedding-ada-002`)
- API version (default: `2024-02-01`)

### Step 2 — Upload Data
1. **Frameworks Workbook** — your multi-sheet Excel. Each sheet should have columns:
   - `Source Name` / `Framework`
   - `Topic`
   - `Sub Topic`
   - `Section Number`
   - `Requirements`
   - `Theme` / `Granular Theme`

2. **Theme Hierarchy Workbook** (optional but recommended):
   - `Main Theme`
   - `Sub Theme`
   - `Granular Theme`

> Column names are matched case-insensitively with common spelling variations handled automatically.

### Step 3 — Query
Type natural language queries like:
- *"My client is in the gaming industry with EU users"*
- *"Healthcare SaaS startup handling patient data in the US"*
- *"Fintech startup processing credit card payments globally"*

### Step 4 — Review & Export
- Filter results by framework
- Review AI analysis and relevance scores (1–10)
- Export to formatted Excel workbook (3 sheets: Summary, per-framework, Theme Mapping)

---

## Excel Input Format

### Frameworks Workbook
| Source Name | Topic  | Sub Topic            | Section Number | Requirements                          | Theme                    |
|-------------|--------|----------------------|----------------|---------------------------------------|--------------------------|
| NIST CSF 2.0| Govern | Organizational Context| GV.OC-01      | The organizational mission is...      | IT Governance Framework  |
| PCI DSS v4  | ...    | ...                  | ...            | ...                                   | ...                      |

Each sheet = one framework/regulation. The app handles:
- PCI DSS v4.01
- COBIT 2019
- ISO 27001
- NIST CSF 2.0
- NIS 2
- TISAX
- NIST SP 800-171 R3
- FDA 21 CFR Part 11
- Any other framework you add

### Theme Workbook
| Main Theme      | Sub Theme               | Granular Theme             |
|-----------------|-------------------------|----------------------------|
| IT Strategy     | Strategy & Planning     | Management Reporting       |
| IT Strategy     | Strategy & Planning     | IT Strategy                |
| Information Security | Identity & Access  | User Access Provisioning   |

---

## API Reference

| Method | Endpoint             | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | `/health`            | System status + record counts        |
| POST   | `/configure`         | Set Azure OpenAI credentials         |
| POST   | `/upload/frameworks` | Upload & index frameworks workbook   |
| POST   | `/upload/themes`     | Upload & index theme hierarchy       |
| POST   | `/query`             | RAG query — returns ranked results   |
| POST   | `/export`            | Download results as Excel            |
| GET    | `/frameworks`        | List indexed frameworks              |

Full interactive docs at http://localhost:8000/docs

---

## ChromaDB Details

- **Storage:** Persistent on disk (`data/chromadb/`) — survives restarts
- **Collections:** `framework_requirements` + `themes`
- **Distance metric:** Cosine similarity
- **Embedding model:** `text-embedding-ada-002` (1536 dimensions)
- **Deduplication:** MD5 hash of document text — re-uploads are idempotent

---

## Scaling Considerations

| Scale          | Recommended Change                                      |
|----------------|--------------------------------------------------------|
| < 50k records  | ChromaDB local (current setup) ✅                       |
| 50k–500k       | ChromaDB with Docker + persistent volume               |
| 500k+          | Migrate to Azure AI Search (managed vector DB)         |
| Multi-user     | Add auth middleware + per-user ChromaDB namespacing    |
| Production     | Add Redis caching for embeddings + query results       |
