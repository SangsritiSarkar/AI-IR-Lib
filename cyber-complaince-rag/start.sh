#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  CyberCompliance Intelligence — Start Script
# ─────────────────────────────────────────────────────────────
set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   CyberCompliance Intelligence — RAG Platform        ║"
echo "║   ChromaDB + Azure OpenAI + FastAPI + React          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Backend setup ──────────────────────────────────────────
echo "▶ Installing Python dependencies..."
cd backend
pip install -r requirements.txt --break-system-packages -q
mkdir -p ../data/chromadb ../data/uploads ../data/exports

echo "▶ Starting FastAPI backend on http://localhost:8000 ..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# ── 2. Frontend setup ─────────────────────────────────────────
cd ../frontend
echo "▶ Installing Node dependencies..."
npm install --silent

echo "▶ Starting React dev server on http://localhost:3000 ..."
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

# ── 3. Open browser ───────────────────────────────────────────
sleep 3
echo ""
echo "✅ App running!"
echo "   Frontend:  http://localhost:3000"
echo "   API docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
