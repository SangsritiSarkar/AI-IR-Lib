import { useState, useRef, useCallback, useEffect } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0c0f;
    --bg2: #111318;
    --bg3: #181c23;
    --border: #232830;
    --border2: #2e3540;
    --accent: #00e5ff;
    --accent2: #00b4cc;
    --warn: #ff6b35;
    --success: #39d353;
    --muted: #4a5568;
    --text: #e2e8f0;
    --text2: #8899aa;
    --text3: #5a6a7a;
    --mono: 'IBM Plex Mono', monospace;
    --sans: 'IBM Plex Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  .app {
    min-height: 100vh;
    background: var(--bg);
    padding: 0;
  }

  /* Header */
  .header {
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg2);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-logo {
    width: 32px; height: 32px;
    background: var(--accent);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    flex-shrink: 0;
  }
  .header-title {
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .header-sub {
    font-size: 11px;
    color: var(--text3);
    font-family: var(--mono);
    margin-left: auto;
  }

  /* Steps nav */
  .steps-nav {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
    padding: 0 32px;
    overflow-x: auto;
  }
  .step-tab {
    padding: 12px 20px;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    color: var(--text3);
    cursor: default;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .step-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  .step-tab.done { color: var(--success); cursor: pointer; }
  .step-tab.done:hover { color: var(--accent); }
  .step-num {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 1px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
  }
  .step-num.done-icon {
    background: var(--success);
    border-color: var(--success);
    color: var(--bg);
  }

  /* Main content */
  .main { padding: 32px; max-width: 1200px; margin: 0 auto; }

  /* Cards */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .card-title {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-title::before {
    content: '';
    display: block;
    width: 3px; height: 14px;
    background: var(--accent);
    border-radius: 2px;
  }

  /* Inputs */
  .input {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 3px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--accent); }
  .input::placeholder { color: var(--text3); }

  textarea.input { resize: vertical; min-height: 100px; line-height: 1.6; }

  .label {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text2);
    margin-bottom: 6px;
    display: block;
    letter-spacing: 0.05em;
  }

  .field { margin-bottom: 16px; }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--bg);
  }
  .btn-primary:hover:not(:disabled) { background: #33eaff; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-outline {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
  }
  .btn-outline:hover:not(:disabled) { background: rgba(0,229,255,0.08); }
  .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-danger {
    background: transparent;
    color: var(--warn);
    border: 1px solid var(--warn);
    padding: 6px 12px;
    font-size: 10px;
  }
  .btn-danger:hover { background: rgba(255,107,53,0.1); }

  /* File upload */
  .upload-zone {
    border: 2px dashed var(--border2);
    border-radius: 4px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg3);
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent);
    background: rgba(0,229,255,0.04);
  }
  .upload-icon { font-size: 32px; margin-bottom: 12px; }
  .upload-text {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text2);
    letter-spacing: 0.05em;
  }
  .upload-hint {
    font-size: 11px;
    color: var(--text3);
    margin-top: 6px;
    font-family: var(--mono);
  }

  /* File list */
  .file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 3px;
  }
  .file-icon {
    width: 28px; height: 28px;
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .file-icon.pdf { background: rgba(255,107,53,0.15); color: var(--warn); border: 1px solid rgba(255,107,53,0.3); }
  .file-icon.docx { background: rgba(0,229,255,0.1); color: var(--accent); border: 1px solid rgba(0,229,255,0.2); }
  .file-icon.xlsx { background: rgba(57,211,83,0.1); color: var(--success); border: 1px solid rgba(57,211,83,0.2); }
  .file-name { font-family: var(--mono); font-size: 12px; color: var(--text); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-size { font-family: var(--mono); font-size: 10px; color: var(--text3); flex-shrink: 0; }

  /* Progress / logs */
  .log-box {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 16px;
    height: 220px;
    overflow-y: auto;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.8;
  }
  .log-line { display: flex; gap: 12px; }
  .log-time { color: var(--text3); flex-shrink: 0; }
  .log-msg.info { color: var(--text2); }
  .log-msg.success { color: var(--success); }
  .log-msg.warn { color: var(--warn); }
  .log-msg.accent { color: var(--accent); }

  .progress-bar-wrap {
    background: var(--bg3);
    border-radius: 2px;
    height: 4px;
    margin: 12px 0;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.4s ease;
  }
  .progress-label {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text2);
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
  }

  /* Results */
  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: gap;
    gap: 12px;
  }
  .stat-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat-box {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 12px 20px;
    text-align: center;
  }
  .stat-val {
    font-family: var(--mono);
    font-size: 24px;
    font-weight: 600;
    color: var(--accent);
  }
  .stat-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
  }

  .theme-section { margin-bottom: 24px; }
  .theme-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 3px 3px 0 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  .theme-header:hover { background: rgba(0,229,255,0.04); }
  .theme-name {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex: 1;
  }
  .theme-count {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text3);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 2px 10px;
  }
  .theme-chevron {
    color: var(--text3);
    font-size: 12px;
    transition: transform 0.2s;
  }
  .theme-chevron.open { transform: rotate(180deg); }

  .req-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--border);
    border-top: none;
  }
  .req-table th {
    background: var(--bg2);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 600;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 8px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .req-table td {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    vertical-align: top;
    line-height: 1.5;
  }
  .req-table tr:last-child td { border-bottom: none; }
  .req-table tr:hover td { background: rgba(0,229,255,0.02); }
  .framework-tag {
    display: inline-block;
    font-family: var(--mono);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 2px;
    background: rgba(0,229,255,0.1);
    color: var(--accent);
    border: 1px solid rgba(0,229,255,0.2);
    white-space: nowrap;
  }
  .confidence-bar {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .conf-track {
    flex: 1;
    height: 3px;
    background: var(--border2);
    border-radius: 2px;
    overflow: hidden;
  }
  .conf-fill {
    height: 100%;
    border-radius: 2px;
  }
  .conf-val { font-family: var(--mono); font-size: 10px; color: var(--text3); width: 30px; text-align: right; }

  /* Alert / info box */
  .info-box {
    background: rgba(0,229,255,0.06);
    border: 1px solid rgba(0,229,255,0.2);
    border-radius: 3px;
    padding: 12px 16px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text2);
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .warn-box {
    background: rgba(255,107,53,0.08);
    border: 1px solid rgba(255,107,53,0.25);
    border-radius: 3px;
    padding: 12px 16px;
    font-family: var(--mono);
    font-size: 11px;
    color: #ff9a72;
    line-height: 1.7;
    margin-bottom: 16px;
  }

  .row { display: flex; gap: 16px; flex-wrap: wrap; }
  .col { flex: 1; min-width: 240px; }

  .section-title {
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }
  .section-sub {
    font-size: 13px;
    color: var(--text2);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  /* spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,229,255,0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  .gap-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }

  .theme-pill {
    padding: 4px 12px;
    border-radius: 2px;
    font-family: var(--mono);
    font-size: 10px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    color: var(--text2);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .theme-pill .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text3);
    font-family: var(--mono);
    font-size: 12px;
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .filter-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filter-btn {
    padding: 5px 14px;
    border-radius: 2px;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text2);
    transition: all 0.15s;
  }
  .filter-btn.active, .filter-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(0,229,255,0.06);
  }

  .export-row { display: flex; gap: 10px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunkText(text, chunkSize = 3000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileExt(name) {
  return name.split(".").pop().toLowerCase();
}

async function parsePDF(file, onPageProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        // PDF.js attaches to window.pdfjsLib when loaded via CDN script tag
        const pdfjsLib = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
        if (!pdfjsLib) throw new Error("PDF.js not loaded — please refresh and try again");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          if (onPageProgress) onPageProgress(i, pdf.numPages);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Reconstruct text with proper line breaks using transform Y positions
          let lastY = null;
          let pageText = "";
          for (const item of content.items) {
            if (!item.str) continue;
            const y = item.transform ? item.transform[5] : null;
            if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
              pageText += "\n";
            } else if (pageText.length > 0 && !pageText.endsWith(" ")) {
              pageText += " ";
            }
            pageText += item.str;
            lastY = y;
          }
          fullText += `\n--- Page ${i} ---\n` + pageText + "\n";
        }
        if (!fullText.trim()) throw new Error("No text extracted — PDF may be scanned/image-based (OCR not supported)");
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

async function parseDOCX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const mammoth = window.mammoth;
        if (!mammoth) throw new Error("mammoth not loaded");
        const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
        resolve(result.value);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) throw new Error("SheetJS not loaded");
        const wb = XLSX.read(e.target.result, { type: "array" });
        let text = "";
        wb.SheetNames.forEach((name) => {
          const ws = wb.Sheets[name];
          text += `[Sheet: ${name}]\n` + XLSX.utils.sheet_to_csv(ws) + "\n\n";
        });
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Azure OpenAI API calls ───────────────────────────────────────────────────

async function callAzure(endpoint, apiKey, apiVersion, messages, maxTokens = 2000, retries = 3) {
  // If endpoint points to localhost proxy, use proxy mode:
  // - POST directly to the endpoint URL
  // - Include api_version in body (proxy handles the real Azure URL)
  // - No api-key header needed (proxy holds credentials)
  // Otherwise use direct Azure mode (requires CORS to be enabled on Azure side).
  const isProxy = endpoint.includes("localhost") || endpoint.includes("127.0.0.1") || endpoint.includes("ngrok");
  const url = isProxy
    ? endpoint.replace(/\/$/, "")
    : `${endpoint.replace(/\/$/, "")}/chat/completions?api-version=${apiVersion}`;

  const headers = { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" };
  if (!isProxy) headers["api-key"] = apiKey;

  const bodyObj = { messages, max_tokens: maxTokens, temperature: 0 };
  if (isProxy) bodyObj.api_version = apiVersion;

  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyObj),
      });
      if (response.status === 429 || response.status === 503) {
        const waitMs = attempt * 2000;
        await new Promise((r) => setTimeout(r, waitMs));
        lastError = new Error(`Rate limited (${response.status}), retrying...`);
        continue;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Azure API error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Azure OpenAI");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastError || new Error("All retry attempts failed");
}

async function extractRequirementsFromChunk(apiKey, endpoint, apiVersion, chunk, frameworkName, chunkIndex) {
  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a cybersecurity compliance analyst. Extract all requirements, controls, obligations, and mandates from the provided text.
Return ONLY a valid JSON array. No markdown, no code fences, no explanation, no text before or after the array.
Each object must have exactly these fields:
{ "id": "REQ-${chunkIndex}-1", "requirement": "requirement text here", "category": "category hint" }
If no requirements exist in this text, return exactly: []`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}\n\nText:\n${chunk}\n\nReturn JSON array only.`,
    },
  ], 2000);

  // Attempt 1: direct parse
  try {
    const trimmed = raw.trim();
    return { reqs: JSON.parse(trimmed), rawResponse: raw, parseError: null };
  } catch {}

  // Attempt 2: extract JSON array from within the response (handles extra text wrapping)
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return { reqs: JSON.parse(match[0]), rawResponse: raw, parseError: null };
  } catch {}

  // Attempt 3: strip markdown code fences
  try {
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return { reqs: JSON.parse(clean), rawResponse: raw, parseError: null };
  } catch {}

  // All attempts failed — return raw so caller can log it
  return { reqs: [], rawResponse: raw, parseError: "JSON parse failed" };
}

async function mapRequirementsToThemes(apiKey, endpoint, apiVersion, requirements, themes, themeTree, frameworkName) {
  // Build a context string showing the hierarchy so the model understands relationships
  const hierarchyContext = themeTree.length > 0
    ? themeTree.map((m) =>
        `${m.main}\n` + m.subs.map((s) =>
          `  ${s.sub}\n` + s.granular.map((g) => `    ${g}`).join("\n")
        ).join("\n")
      ).join("\n")
    : themes.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a cybersecurity compliance analyst. Map each requirement to the most specific (granular) theme from the provided hierarchy.
Return ONLY a valid JSON array (no markdown, no explanation). Each item must have:
- "id": same id as input
- "requirement": same text as input
- "granularTheme": the most specific matching theme (Level 3, e.g. "2.1.1. User Access Provisioning")
- "subTheme": the parent sub-theme (Level 2, e.g. "2.1. Identity & Access Management")
- "mainTheme": the top-level category (Level 1, e.g. "02. Information Security")
- "confidence": number 0-100 representing mapping confidence
- "framework": the framework name
IMPORTANT: "granularTheme" MUST be an exact value from the granular themes list provided. Do NOT invent or paraphrase theme names.`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}

Theme hierarchy (map to the most granular level):
${hierarchyContext}

Granular themes (exact values to use for granularTheme field):
${themes.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Requirements to map:
${JSON.stringify(requirements, null, 2)}

Map each requirement to the best granular theme. Return JSON array only, no other text.`,
    },
  ], 4000);

  // Robust JSON extraction
  const tryParse = (s) => {
    try { return JSON.parse(s.trim()); } catch { return null; }
  };
  return tryParse(raw)
    || tryParse((raw.match(/\[[\s\S]*\]/) || [])[0])
    || tryParse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim())
    || [];
}

// ─── Script loader ────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

function LogBox({ logs }) {
  const ref = useRef(null);
  const prevLen = useRef(0);
  if (ref.current && logs.length !== prevLen.current) {
    prevLen.current = logs.length;
    setTimeout(() => {
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, 50);
  }
  return (
    <div className="log-box" ref={ref}>
      {logs.map((l, i) => (
        <div key={i} className="log-line">
          <span className="log-time">{l.time}</span>
          <span className={`log-msg ${l.type || "info"}`}>{l.msg}</span>
        </div>
      ))}
      {logs.length === 0 && (
        <span style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 11 }}>
          Awaiting process start...
        </span>
      )}
    </div>
  );
}

function GranularSection({ granular, items }) {
  const [open, setOpen] = useState(false);
  const frameworks = [...new Set(items.map((i) => i.framework))];
  return (
    <div style={{ marginBottom: 1 }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px 8px 32px", background: "var(--bg)", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,229,255,0.02)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg)"}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", flex: 1 }}>{granular}</span>
        {frameworks.map((f) => <span key={f} className="framework-tag" style={{ fontSize: 9 }}>{f}</span>)}
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "1px 8px" }}>
          {items.length}
        </span>
        <span style={{ color: "var(--text3)", fontSize: 10, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>{"▼"}</span>
      </div>
      {open && (
        <table className="req-table" style={{ marginLeft: 0 }}>
          <thead>
            <tr>
              <th style={{ width: 90, paddingLeft: 32 }}>ID</th>
              <th>Requirement</th>
              <th style={{ width: 130 }}>Framework</th>
              <th style={{ width: 100 }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const conf = item.confidence || 75;
              const confColor = conf >= 80 ? "var(--success)" : conf >= 60 ? "var(--accent)" : "var(--warn)";
              return (
                <tr key={idx}>
                  <td style={{ paddingLeft: 32 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{item.id}</span>
                  </td>
                  <td>{item.requirement}</td>
                  <td><span className="framework-tag">{item.framework}</span></td>
                  <td>
                    <div className="confidence-bar">
                      <div className="conf-track">
                        <div className="conf-fill" style={{ width: `${conf}%`, background: confColor }} />
                      </div>
                      <span className="conf-val">{conf}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SubThemeBlock({ sub, granulars }) {
  const [open, setOpen] = useState(true);
  const totalReqs = Object.values(granulars).reduce((a, items) => a + items.length, 0);
  return (
    <div style={{ marginBottom: 1 }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px 9px 20px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1 }}>{sub}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{Object.keys(granulars).length} granular</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "1px 8px" }}>
          {totalReqs} reqs
        </span>
        <span style={{ color: "var(--text3)", fontSize: 10, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>{"▼"}</span>
      </div>
      {open && Object.entries(granulars).sort((a, b) => a[0].localeCompare(b[0])).map(([g, items]) => (
        <GranularSection key={g} granular={g} items={items} />
      ))}
    </div>
  );
}

function MainThemeBlock({ main, subs }) {
  const [open, setOpen] = useState(true);
  const totalReqs = Object.values(subs).reduce((a, gs) =>
    a + Object.values(gs).reduce((b, items) => b + items.length, 0), 0);
  const totalGranular = Object.values(subs).reduce((a, gs) => a + Object.keys(gs).length, 0);
  return (
    <div className="theme-section">
      <div className="theme-header" onClick={() => setOpen((o) => !o)}>
        <span className="theme-name">{main}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{Object.keys(subs).length} sub-themes</span>
        <span className="theme-count">{totalGranular} granular</span>
        <span className="theme-count">{totalReqs} reqs</span>
        <span className={`theme-chevron ${open ? "open" : ""}`}>{"▼"}</span>
      </div>
      {open && (
        <div style={{ border: "1px solid var(--border)", borderTop: "none" }}>
          {Object.entries(subs).sort((a, b) => a[0].localeCompare(b[0])).map(([sub, granulars]) => (
            <SubThemeBlock key={sub} sub={sub} granulars={granulars} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [libsReady, setLibsReady] = useState(false);
  const [libError, setLibError] = useState("");

  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"),
    ])
      .then(() => {
        // PDF.js CDN exposes itself as window.pdfjsLib OR window["pdfjs-dist/build/pdf"]
        // Normalize to window.pdfjsLib so parsePDF can reliably find it
        if (!window.pdfjsLib && window["pdfjs-dist/build/pdf"]) {
          window.pdfjsLib = window["pdfjs-dist/build/pdf"];
        }
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        setLibsReady(true);
      })
      .catch(() => setLibError("Failed to load document parsing libraries. Check your connection."));
  }, []);
  const [step, setStep] = useState(0); // 0=config, 1=upload, 2=processing, 3=results
  const [apiKey, setApiKey] = useState("");
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [apiVersion, setApiVersion] = useState("2024-02-15-preview");
  const [themes, setThemes] = useState([]);
  const [themeTree, setThemeTree] = useState([]);
  const [themeFileName, setThemeFileName] = useState("");
  const [themeSheets, setThemeSheets] = useState([]);
  const [themeSheet, setThemeSheet] = useState("");
  const [themeWorkbook, setThemeWorkbook] = useState(null);
  const [themeParseError, setThemeParseError] = useState("");
  const themeFileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const fileInputRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    setLogs((prev) => [...prev, { time: now(), msg, type }]);
  }, []);

  // ── Hierarchical theme parser ──────────────────────────────────────────────
  // The Excel has a multi-column layout where:
  //   Row with merged/wide cell = Main theme (e.g. "01. IT Strategy")
  //   Next row pattern = Sub-theme (e.g. "1.1. Strategy & Planning")
  //   Remaining rows = Granular themes (e.g. "1.1.1. Management Reporting")
  //
  // Detection heuristic: cells matching /^\d+\.\s/ are themes.
  // Level determined by number of numeric segments before the dot-space:
  //   1 segment  → Main  (e.g. "01." or "1.")
  //   2 segments → Sub   (e.g. "1.1.")
  //   3 segments → Granular (e.g. "1.1.1.")

  const detectLevel = (text) => {
    const t = String(text || "").trim();
    // Match patterns like "01.", "1.1.", "1.1.1.", "2.4.1." etc.
    const m = t.match(/^(\d+\.)+/);
    if (!m) return null;
    const dots = (m[0].match(/\./g) || []).length;
    if (dots === 1) return 1;
    if (dots === 2) return 2;
    if (dots >= 3) return 3;
    return null;
  };

  const parseHierarchicalThemes = (wb, sheetName) => {
    const XLSX = window.XLSX;
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    
    // Flatten all non-empty cell values from all rows
    const allCells = [];
    rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const val = String(cell || "").trim();
        if (val) allCells.push({ val, ri, ci });
      });
    });

    // Build tree by grouping by detected level
    const tree = []; // [{main, sub: [{sub, granular: [str]}]}]
    let currentMain = null;
    let currentSub = null;

    // Sort cells by row then col so we process in reading order
    allCells.sort((a, b) => a.ri - b.ri || a.ci - b.ci);

    allCells.forEach(({ val }) => {
      const level = detectLevel(val);
      if (level === 1) {
        currentMain = { main: val, subs: [] };
        tree.push(currentMain);
        currentSub = null;
      } else if (level === 2) {
        if (!currentMain) { currentMain = { main: "Uncategorized", subs: [] }; tree.push(currentMain); }
        currentSub = { sub: val, granular: [] };
        currentMain.subs.push(currentSub);
      } else if (level === 3) {
        if (!currentMain) { currentMain = { main: "Uncategorized", subs: [] }; tree.push(currentMain); }
        if (!currentSub) { currentSub = { sub: "General", granular: [] }; currentMain.subs.push(currentSub); }
        currentSub.granular.push(val);
      }
    });

    return tree;
  };

  const buildThemePreview = (wb, sheetName) => {
    if (!wb || !sheetName) return;
    try {
      const tree = parseHierarchicalThemes(wb, sheetName);
      setThemeTree(tree);
      // Flat list of granular themes for AI prompt
      const flat = [];
      tree.forEach((m) => m.subs.forEach((s) => s.granular.forEach((g) => flat.push(g))));
      // Fallback: if no granular found, use sub-themes; if none, use mains
      if (flat.length === 0) {
        tree.forEach((m) => m.subs.forEach((s) => flat.push(s.sub)));
      }
      if (flat.length === 0) {
        tree.forEach((m) => flat.push(m.main));
      }
      setThemes(flat);
      if (flat.length === 0) setThemeParseError("No themes detected. Ensure theme names start with numbered patterns like 1.1.1.");
    } catch (e) {
      setThemeParseError("Could not parse theme hierarchy: " + e.message);
    }
  };

  const handleThemeFile = (file) => {
    setThemeParseError("");
    setThemes([]);
    setThemeTree([]);
    setThemeSheets([]);
    setThemeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) throw new Error("SheetJS not loaded");
        const wb = XLSX.read(e.target.result, { type: "array" });
        setThemeWorkbook(wb);
        const sheets = wb.SheetNames;
        setThemeSheets(sheets);
        const firstSheet = sheets[0];
        setThemeSheet(firstSheet);
        buildThemePreview(wb, firstSheet);
      } catch (err) {
        setThemeParseError("Failed to parse Excel file: " + err.message);
      }
    };
    reader.onerror = () => setThemeParseError("Could not read file.");
    reader.readAsArrayBuffer(file);
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => {
      const ext = getFileExt(f.name);
      return ["pdf", "docx", "xlsx", "xls"].includes(ext);
    });
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  };

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const process = async () => {
    if (!apiKey || !azureEndpoint || !apiVersion || files.length === 0 || themes.length === 0) return;
    setIsProcessing(true);
    setStep(2);
    setLogs([]);
    setResults([]);
    setProgress(0);

    const allMapped = [];
    const totalFiles = files.length;

    try {
      for (let fi = 0; fi < files.length; fi++) {
        const file = files[fi];
        const ext = getFileExt(file.name);
        const frameworkName = file.name.replace(/\.[^.]+$/, "");

        addLog(`[${fi + 1}/${totalFiles}] Processing: ${file.name}`, "accent");

        // Parse with page-level progress for PDFs
        addLog(`  Parsing ${ext.toUpperCase()} document...`);
        let text = "";
        try {
          if (ext === "pdf") {
            text = await parsePDF(file, (page, total) => {
              setProgressLabel(`Parsing PDF — page ${page}/${total}`);
              setProgress(Math.round(((fi + (page / total) * 0.2) / totalFiles) * 100));
            });
          } else if (ext === "docx") {
            text = await parseDOCX(file);
          } else if (ext === "xlsx" || ext === "xls") {
            text = await parseXLSX(file);
          }
        } catch (e) {
          addLog(`  PARSE ERROR: ${e.message}`, "warn");
          addLog(`  Skipping this file. Check if PDF is scanned/image-based.`, "warn");
          continue;
        }

        const charCount = text.trim().length;
        addLog(`  Extracted ${charCount.toLocaleString()} characters`, charCount > 100 ? "success" : "warn");

        if (charCount < 100) {
          addLog(`  Too little text extracted — PDF may be image-based or encrypted. Skipping.`, "warn");
          continue;
        }

        // Use larger chunks (6000 chars) to reduce API calls and give more context per chunk
        const chunks = chunkText(text, 6000, 400);
        addLog(`  Split into ${chunks.length} chunks (6000 chars each with 400 overlap)`);

        // Extract requirements per chunk
        const allReqs = [];
        for (let ci = 0; ci < chunks.length; ci++) {
          const pct = Math.round(((fi + 0.2 + (ci + 1) / chunks.length * 0.5) / totalFiles) * 100);
          setProgress(pct);
          setProgressLabel(`Extracting requirements — chunk ${ci + 1}/${chunks.length}`);
          addLog(`  Chunk ${ci + 1}/${chunks.length} (${chunks[ci].length} chars)...`);

          try {
            const result = await extractRequirementsFromChunk(apiKey, azureEndpoint, apiVersion, chunks[ci], frameworkName, `${fi}-${ci}`);
            if (result.parseError) {
              addLog(`    JSON parse failed. Raw response (first 300 chars):`, "warn");
              addLog(`    ${(result.rawResponse || "").slice(0, 300)}`, "warn");
            } else if (result.reqs.length === 0) {
              addLog(`    0 reqs found. Model said: ${(result.rawResponse || "").slice(0, 200)}`, "info");
            } else {
              addLog(`    Found ${result.reqs.length} requirements`, "success");
            }
            allReqs.push(...result.reqs);
          } catch (e) {
            addLog(`    ERROR chunk ${ci + 1}: ${e.message}`, "warn");
          }

          // 800ms delay between chunks to respect Azure TPM limits
          if (ci < chunks.length - 1) await new Promise((r) => setTimeout(r, 800));
        }

        addLog(`  Total raw requirements extracted: ${allReqs.length}`, allReqs.length > 0 ? "success" : "warn");

        if (allReqs.length === 0) {
          addLog(`  No requirements found — document may not contain structured requirements.`, "warn");
          continue;
        }

        // Map to themes in batches of 30 (smaller = more reliable JSON)
        const BATCH = 30;
        const mapped = [];
        const batches = Math.ceil(allReqs.length / BATCH);

        for (let bi = 0; bi < batches; bi++) {
          const batch = allReqs.slice(bi * BATCH, (bi + 1) * BATCH);
          const pct = Math.round(((fi + 0.7 + (bi + 1) / batches * 0.3) / totalFiles) * 100);
          setProgress(pct);
          setProgressLabel(`Mapping to themes — batch ${bi + 1}/${batches}`);
          addLog(`  Mapping batch ${bi + 1}/${batches} (${batch.length} reqs) to themes...`);

          try {
            const mappedBatch = await mapRequirementsToThemes(apiKey, azureEndpoint, apiVersion, batch, themes, themeTree, frameworkName);
            addLog(`    Mapped ${mappedBatch.length} requirements`, mappedBatch.length > 0 ? "success" : "warn");
            mapped.push(...mappedBatch);
          } catch (e) {
            addLog(`    ERROR mapping batch ${bi + 1}: ${e.message}`, "warn");
          }

          if (bi < batches - 1) await new Promise((r) => setTimeout(r, 800));
        }

        addLog(`  Done: ${mapped.length} requirements mapped for "${frameworkName}"`, "success");
        allMapped.push(...mapped);
      }

      setProgress(100);
      setProgressLabel("Complete");
      addLog(`Processing complete — ${allMapped.length} total requirements mapped`, "accent");

      const mainCount = [...new Set(allMapped.map((r) => r.mainTheme).filter(Boolean))].length;
      addLog(`Main themes covered: ${mainCount}`, "success");

      setResults(allMapped);
      setTimeout(() => setStep(3), 800);
    } catch (err) {
      addLog(`FATAL: ${err.message}`, "warn");
    } finally {
      setIsProcessing(false);
    }
  };

  const [testStatus, setTestStatus] = useState(""); // "", "testing", "ok", "fail"
  const [testMsg, setTestMsg] = useState("");

  const testConnection = async () => {
    setTestStatus("testing");
    setTestMsg("");
    try {
      const result = await extractRequirementsFromChunk(
        apiKey, azureEndpoint, apiVersion,
        "The organization shall implement multi-factor authentication for all privileged accounts. Access to sensitive data must be logged and reviewed monthly.",
        "TEST", "test-0"
      );
      if (result.parseError) {
        setTestStatus("fail");
        setTestMsg(`Connected but JSON parse failed. Raw: ${(result.rawResponse || "").slice(0, 300)}`);
      } else if (result.reqs.length > 0) {
        setTestStatus("ok");
        setTestMsg(`Connected! Extracted ${result.reqs.length} requirement(s) from test text. Your credentials work.`);
      } else {
        setTestStatus("fail");
        setTestMsg(`Connected but model returned 0 requirements from test text. Raw: ${(result.rawResponse || "").slice(0, 300)}`);
      }
    } catch (e) {
      setTestStatus("fail");
      setTestMsg(`Connection failed: ${e.message}`);
    }
  };

  const exportCSV = () => {
    const header = "ID,Framework,Main Theme,Sub Theme,Granular Theme,Confidence,Requirement\n";
    const rows = results.map((r) =>
      `"${r.id}","${r.framework}","${r.mainTheme || ""}","${r.subTheme || ""}","${r.granularTheme || r.theme || ""}","${r.confidence}","${(r.requirement || "").replace(/"/g, '""')}"`
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "framework-mapping.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "framework-mapping.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group results by Main > Sub > Granular hierarchy
  const byMain = {};
  results.forEach((r) => {
    const main = r.mainTheme || "Uncategorized";
    const sub = r.subTheme || "General";
    const granular = r.granularTheme || r.theme || "Uncategorized";
    if (!byMain[main]) byMain[main] = {};
    if (!byMain[main][sub]) byMain[main][sub] = {};
    if (!byMain[main][sub][granular]) byMain[main][sub][granular] = [];
    byMain[main][sub][granular].push(r);
  });

  const allFrameworks = [...new Set(results.map((r) => r.framework))];
  const filteredMain =
    activeFilter === "ALL"
      ? Object.entries(byMain)
      : Object.entries(byMain).map(([main, subs]) => {
          const filteredSubs = {};
          Object.entries(subs).forEach(([sub, granulars]) => {
            const filteredGranulars = {};
            Object.entries(granulars).forEach(([g, items]) => {
              const f = items.filter((i) => i.framework === activeFilter);
              if (f.length) filteredGranulars[g] = f;
            });
            if (Object.keys(filteredGranulars).length) filteredSubs[sub] = filteredGranulars;
          });
          return [main, filteredSubs];
        }).filter(([, subs]) => Object.keys(subs).length > 0);

  const STEPS = ["01 - Config", "02 - Upload", "03 - Processing", "04 - Results"];

  return (
    <>
      <style>{styles}</style>

      <div className="app">
        {!libsReady && !libError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, fontFamily: "var(--mono)", fontSize: 13, color: "var(--text2)" }}>
            <span className="spinner" /> Loading document parsers...
          </div>
        )}
        {libError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <div className="warn-box" style={{ maxWidth: 400 }}>{libError}</div>
          </div>
        )}
        {libsReady && (
          <div>
        <div className="header">
          <div className="header-logo" />
          <span className="header-title">CyberMapper</span>
          <span style={{ color: "var(--border2)", margin: "0 8px" }}>|</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
            {"Framework Requirements \u2192 Theme Mapping Engine"}
          </span>
          <span className="header-sub">{"v1.0 \u00b7 PROTOTYPE"}</span>
        </div>

        <div className="steps-nav">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`step-tab ${step === i ? "active" : ""} ${step > i ? "done" : ""}`}
              onClick={() => step > i && setStep(i)}
            >
              <span className={`step-num ${step > i ? "done-icon" : ""}`}>
                {step > i ? "\u2713" : i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>

        <div className="main">

          {/* ── Step 0: Config ── */}
          {step === 0 && (
            <>
              <div className="section-title">Configuration</div>
              <div className="section-sub">Set up your Azure OpenAI credentials and define the theme taxonomy before uploading documents.</div>

              <div className="row">
                <div className="col">
                  <div className="card">
                    <div className="card-title">Azure OpenAI Credentials</div>
                    <div className="warn-box" style={{ marginBottom: 14 }}>
                      <strong>Proxy + ngrok required.</strong> Browser iframes block both direct Azure calls and localhost. Run <code>proxy-server.js</code> locally, expose it via ngrok, then paste the ngrok HTTPS URL here.
                    </div>
                    <div className="info-box">
                      1. Fill credentials in <code>proxy-server.js</code><br/>
                      2. <code>npm install express cors &amp;&amp; node proxy-server.js</code><br/>
                      3. In a new terminal: <code>npx ngrok http 3001</code><br/>
                      4. Set endpoint below to: <code>https://xxxx.ngrok-free.app/azure</code>
                    </div>
                    <div className="field">
                      <label className="label">AZURE OPENAI API KEY</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="label">AZURE ENDPOINT (include deployment path)</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="https://<resource>.openai.azure.com/openai/deployments/gpt-4o"
                        value={azureEndpoint}
                        onChange={(e) => setAzureEndpoint(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="label">API VERSION</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="2024-02-15-preview"
                        value={apiVersion}
                        onChange={(e) => setApiVersion(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ marginTop: 4 }}
                      disabled={!apiKey || !azureEndpoint || !apiVersion || testStatus === "testing"}
                      onClick={testConnection}
                    >
                      {testStatus === "testing" ? <span className="spinner" /> : null}
                      {testStatus === "testing" ? "Testing..." : "Test Connection"}
                    </button>
                    {testMsg && (
                      <div className={testStatus === "ok" ? "info-box" : "warn-box"} style={{ marginTop: 10, marginBottom: 0, fontSize: 11, wordBreak: "break-all" }}>
                        {testMsg}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className="card">
                    <div className="card-title">Theme Taxonomy</div>
                    <div className="info-box">
                      Upload your Excel theme file. Themes are auto-detected by numbered patterns (e.g. 1., 1.1., 1.1.1.). Requirements will be mapped to the granular (Level 3) themes.
                    </div>

                    {/* Upload zone */}
                    <div
                      className="upload-zone"
                      style={{ padding: "20px", marginBottom: 14 }}
                      onClick={() => themeFileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleThemeFile(f); }}
                    >
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>
                        {themeFileName ? `\u2713 ${themeFileName}` : "\u2B06 Drop theme Excel file or click to browse"}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 4 }}>
                        .xlsx / .xls accepted
                      </div>
                    </div>
                    <input ref={themeFileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                      onChange={(e) => { if (e.target.files[0]) handleThemeFile(e.target.files[0]); }} />

                    {/* Sheet selector */}
                    {themeSheets.length > 1 && (
                      <div className="field">
                        <label className="label">SHEET</label>
                        <select className="input" value={themeSheet}
                          onChange={(e) => { setThemeSheet(e.target.value); buildThemePreview(themeWorkbook, e.target.value); }}>
                          {themeSheets.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Hierarchy tree preview */}
                    {themeTree.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginBottom: 8, letterSpacing: "0.06em" }}>
                          {themeTree.length} MAIN THEMES &nbsp;|&nbsp;
                          {themeTree.reduce((a, m) => a + m.subs.length, 0)} SUB-THEMES &nbsp;|&nbsp;
                          {themes.length} GRANULAR THEMES (mapping targets)
                        </div>
                        <div style={{ maxHeight: 220, overflowY: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "10px 14px" }}>
                          {themeTree.map((m) => (
                            <div key={m.main} style={{ marginBottom: 10 }}>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
                                {m.main}
                              </div>
                              {m.subs.map((s) => (
                                <div key={s.sub} style={{ marginLeft: 12, marginBottom: 4 }}>
                                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", marginBottom: 2 }}>
                                    {"\u25B8"} {s.sub}
                                  </div>
                                  {s.granular.map((g) => (
                                    <div key={g} style={{ marginLeft: 16, fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", lineHeight: 1.8 }}>
                                      {"\u2013"} {g}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {themeParseError && (
                      <div className="warn-box" style={{ marginTop: 10, marginBottom: 0 }}>{themeParseError}</div>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                disabled={!apiKey || !azureEndpoint || !apiVersion || themes.length === 0}
                onClick={() => setStep(1)}
              >
                {"Continue \u2192 Upload Documents"}
              </button>
            </>
          )}

          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <>
              <div className="section-title">Upload Framework Documents</div>
              <div className="section-sub">
                Upload one or more documents — each file is treated as a separate framework. Supported: PDF, DOCX, XLSX.
              </div>

              <div className="card">
                <div className="card-title">Document Upload</div>
                <div
                  className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                >
                  <div className="upload-icon">{"\u2B06"}</div>
                  <div className="upload-text">Drop files here or click to browse</div>
                  <div className="upload-hint">{"PDF \u00b7 DOCX \u00b7 XLSX \u2014 multiple files supported \u00b7 300+ page docs OK"}</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {files.length > 0 && (
                  <div className="file-list">
                    {files.map((f) => {
                      const ext = getFileExt(f.name);
                      return (
                        <div key={f.name} className="file-item">
                          <div className={`file-icon ${ext}`}>{ext.toUpperCase()}</div>
                          <span className="file-name">{f.name}</span>
                          <span className="file-size">{formatBytes(f.size)}</span>
                          <button className="btn btn-danger" onClick={() => removeFile(f.name)}>
                          {"\u2715 Remove"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <div className="warn-box">
                  {"\u26A0 Large documents (100+ pages) will make many API calls and may take several minutes. Ensure your API key has sufficient rate limits."}
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-outline" onClick={() => setStep(0)}>
                  {"\u2190 Back"}
                </button>
                <button
                  className="btn btn-primary"
                  disabled={files.length === 0 || isProcessing}
                  onClick={process}
                >
                  {isProcessing ? <span className="spinner" /> : null}
                  Start Processing {files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""}
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Processing ── */}
          {step === 2 && (
            <>
              <div className="section-title">Processing Documents</div>
              <div className="section-sub">
                Extracting requirements and mapping to themes. Do not close this tab.
              </div>

              <div className="card">
                <div className="card-title">
                  {isProcessing && <span className="spinner" />}
                  Processing Log
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-label">
                  <span>{progressLabel || "Initializing..."}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <LogBox logs={logs} />
                </div>
              </div>

              {!isProcessing && results.length > 0 && (
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  {"View Results \u2192"}
                </button>
              )}
            </>
          )}


          {/* ── Step 3: Results ── */}
          {step === 3 && (
            <>
              <div className="results-header">
                <div>
                  <div className="section-title">Mapping Results</div>
                  <div className="section-sub" style={{ margin: 0 }}>
                    Requirements mapped to granular themes across the 3-level hierarchy.
                  </div>
                </div>
                <div className="export-row">
                  <button className="btn btn-outline" onClick={exportCSV}>{"\u2193 Export CSV"}</button>
                  <button className="btn btn-outline" onClick={exportJSON}>{"\u2193 Export JSON"}</button>
                  <button className="btn btn-outline" onClick={() => { setStep(1); setFiles([]); setResults([]); setLogs([]); setProgress(0); }}>
                    + New Run
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="stat-row" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                  <div className="stat-val">{results.length}</div>
                  <div className="stat-label">Requirements</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">{Object.keys(byMain).length}</div>
                  <div className="stat-label">Main Themes</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">
                    {Object.values(byMain).reduce((a, subs) => a + Object.keys(subs).length, 0)}
                  </div>
                  <div className="stat-label">Sub-Themes</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">
                    {Object.values(byMain).reduce((a, subs) =>
                      a + Object.values(subs).reduce((b, gs) => b + Object.keys(gs).length, 0), 0)}
                  </div>
                  <div className="stat-label">Granular Themes</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">{allFrameworks.length}</div>
                  <div className="stat-label">Frameworks</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">
                    {results.length > 0
                      ? Math.round(results.reduce((a, r) => a + (r.confidence || 75), 0) / results.length)
                      : 0}%
                  </div>
                  <div className="stat-label">Avg Confidence</div>
                </div>
              </div>

              {/* Filter by framework */}
              {allFrameworks.length > 1 && (
                <div className="filter-row">
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filter:</span>
                  <button className={`filter-btn ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>All Frameworks</button>
                  {allFrameworks.map((f) => (
                    <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                  ))}
                </div>
              )}

              {/* 3-level hierarchy results */}
              {filteredMain.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{"◈"}</div>
                  <div>No results to display</div>
                </div>
              ) : (
                filteredMain.sort((a, b) => a[0].localeCompare(b[0])).map(([main, subs]) => (
                  <MainThemeBlock key={main} main={main} subs={subs} />
                ))
              )}
            </>
          )}
        </div>
        </div>
        )}
      </div>
    </>
  );
}
