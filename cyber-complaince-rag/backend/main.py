"""
CyberCompliance Intelligence - FastAPI Backend
RAG pipeline using ChromaDB + Azure OpenAI
"""

import os
import json
import uuid
import logging
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from rag_engine import RAGEngine
from excel_exporter import export_results_to_excel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CyberCompliance Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG engine instance
rag_engine: Optional[RAGEngine] = None

UPLOAD_DIR = Path("data/uploads")
EXPORT_DIR = Path("data/exports")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


# ─── Request / Response Models ────────────────────────────────────────────────

class AzureConfig(BaseModel):
    api_key: str
    endpoint: str
    deployment_name: str
    api_version: str = "2024-02-01"
    embedding_deployment: str = "text-embedding-ada-002"


class QueryRequest(BaseModel):
    query: str
    top_k: int = 50
    framework_filter: Optional[str] = None


class InitRequest(BaseModel):
    azure_config: AzureConfig


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "indexed": rag_engine is not None and rag_engine.is_ready(),
        "framework_count": rag_engine.get_framework_count() if rag_engine else 0,
        "record_count": rag_engine.get_record_count() if rag_engine else 0,
    }


@app.post("/configure")
async def configure(config: AzureConfig):
    """Set Azure OpenAI credentials and initialize RAG engine."""
    global rag_engine
    try:
        rag_engine = RAGEngine(azure_config=config.dict())
        return {"status": "configured", "message": "Azure OpenAI configured successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/upload/frameworks")
async def upload_frameworks(file: UploadFile = File(...)):
    """Upload the multi-sheet framework Excel workbook and index into ChromaDB."""
    if rag_engine is None:
        raise HTTPException(status_code=400, detail="Configure Azure OpenAI credentials first.")
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx/.xls files accepted.")

    path = UPLOAD_DIR / f"frameworks_{uuid.uuid4().hex[:8]}_{file.filename}"
    content = await file.read()
    path.write_bytes(content)

    try:
        result = await rag_engine.index_frameworks(str(path))
        return {
            "status": "indexed",
            "filename": file.filename,
            "records_indexed": result["total"],
            "frameworks": result["frameworks"],
        }
    except Exception as e:
        logger.exception("Failed to index frameworks")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload/themes")
async def upload_themes(file: UploadFile = File(...)):
    """Upload the theme hierarchy Excel workbook."""
    if rag_engine is None:
        raise HTTPException(status_code=400, detail="Configure Azure OpenAI credentials first.")

    path = UPLOAD_DIR / f"themes_{uuid.uuid4().hex[:8]}_{file.filename}"
    content = await file.read()
    path.write_bytes(content)

    try:
        result = await rag_engine.index_themes(str(path))
        return {
            "status": "indexed",
            "filename": file.filename,
            "themes_indexed": result["total"],
        }
    except Exception as e:
        logger.exception("Failed to index themes")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def query_frameworks(req: QueryRequest):
    """
    RAG query: embed user query, retrieve relevant framework records,
    use GPT to rank/analyze, return structured results.
    """
    if rag_engine is None or not rag_engine.is_ready():
        raise HTTPException(status_code=400, detail="Upload framework data first.")

    try:
        result = await rag_engine.query(
            query=req.query,
            top_k=req.top_k,
            framework_filter=req.framework_filter,
        )
        return result
    except Exception as e:
        logger.exception("Query failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export")
async def export_results(data: dict):
    """Export query results to a formatted Excel workbook."""
    try:
        export_id = uuid.uuid4().hex[:8]
        output_path = EXPORT_DIR / f"compliance_results_{export_id}.xlsx"
        export_results_to_excel(
            results=data.get("results", []),
            query=data.get("query", ""),
            analysis=data.get("analysis", ""),
            output_path=str(output_path),
        )
        return FileResponse(
            path=str(output_path),
            filename=f"CyberCompliance_Results_{export_id}.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except Exception as e:
        logger.exception("Export failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/frameworks")
def list_frameworks():
    """List all indexed frameworks."""
    if rag_engine is None:
        return {"frameworks": []}
    return {"frameworks": rag_engine.list_frameworks()}


# Serve React frontend in production
frontend_dist = Path("../frontend/dist")
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index = frontend_dist / "index.html"
        return FileResponse(str(index))
