import { useState, useRef, useCallback, useEffect } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070a0e;
    --bg2: #0d1117;
    --bg3: #141b24;
    --bg4: #1a2332;
    --border: #1e2d3d;
    --border2: #253545;
    --cyan: #00d4ff;
    --cyan2: #0099bb;
    --green: #00ff88;
    --orange: #ff6b2b;
    --purple: #a855f7;
    --yellow: #ffd43b;
    --text: #d4e4f4;
    --text2: #7a9ab5;
    --text3: #3d5a73;
    --mono: 'Space Mono', monospace;
    --sans: 'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  .app { min-height: 100vh; }

  /* Header */
  .header {
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg2);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-logo {
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--cyan);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo-icon {
    width: 24px; height: 24px;
    border: 2px solid var(--cyan);
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  .header-div { width: 1px; height: 20px; background: var(--border2); }
  .header-sub { font-family: var(--mono); font-size: 10px; color: var(--text3); letter-spacing: 0.06em; }
  .header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border2); }
  .status-dot.ok { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .status-dot.fail { background: var(--orange); }

  /* Steps */
  .steps-nav {
    display: flex;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
    padding: 0 32px;
  }
  .step-tab {
    padding: 10px 18px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text3);
    cursor: default;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.15s;
  }
  .step-tab.active { color: var(--cyan); border-bottom-color: var(--cyan); }
  .step-tab.done { color: var(--green); cursor: pointer; }
  .step-tab.done:hover { color: var(--cyan); }
  .step-num {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 1px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px;
    font-weight: 700;
  }

  /* Main */
  .main { padding: 28px 32px; max-width: 1400px; margin: 0 auto; }

  /* Section title */
  .section-title {
    font-family: var(--mono);
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
    letter-spacing: 0.03em;
  }
  .section-sub {
    font-size: 13px;
    color: var(--text2);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  /* Cards */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .card-title {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    color: var(--cyan);
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
    width: 3px; height: 12px;
    background: var(--cyan);
    border-radius: 2px;
  }

  /* Inputs */
  .input {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 4px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s;
  }
  .input:focus { border-color: var(--cyan); }
  .input::placeholder { color: var(--text3); }
  .label {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--text3);
    margin-bottom: 5px;
    display: block;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .field { margin-bottom: 14px; }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 4px;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-primary { background: var(--cyan); color: var(--bg); }
  .btn-primary:hover:not(:disabled) { background: #33ddff; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--cyan); border: 1px solid var(--cyan); }
  .btn-outline:hover:not(:disabled) { background: rgba(0,212,255,0.08); }
  .btn-outline:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); background: var(--bg3); }
  .btn-danger { background: transparent; color: var(--orange); border: 1px solid rgba(255,107,43,0.4); padding: 5px 10px; font-size: 9px; }
  .btn-danger:hover { background: rgba(255,107,43,0.08); }

  /* Upload */
  .upload-zone {
    border: 2px dashed var(--border2);
    border-radius: 5px;
    padding: 36px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg3);
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--cyan);
    background: rgba(0,212,255,0.04);
  }
  .upload-icon { font-size: 28px; margin-bottom: 10px; }
  .upload-text { font-family: var(--mono); font-size: 11px; color: var(--text2); letter-spacing: 0.05em; }
  .upload-hint { font-size: 11px; color: var(--text3); margin-top: 5px; font-family: var(--mono); font-size: 10px; }

  /* File list */
  .file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
  .file-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .file-icon {
    width: 26px; height: 26px;
    border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono);
    font-size: 8px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .file-icon.pdf { background: rgba(255,107,43,0.15); color: var(--orange); border: 1px solid rgba(255,107,43,0.3); }
  .file-icon.docx { background: rgba(0,212,255,0.1); color: var(--cyan); border: 1px solid rgba(0,212,255,0.2); }
  .file-icon.xlsx, .file-icon.xls { background: rgba(0,255,136,0.1); color: var(--green); border: 1px solid rgba(0,255,136,0.2); }
  .file-name { font-family: var(--mono); font-size: 11px; color: var(--text); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-size { font-family: var(--mono); font-size: 10px; color: var(--text3); flex-shrink: 0; }

  /* Progress / logs */
  .log-box {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 14px;
    height: 240px;
    overflow-y: auto;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.9;
  }
  .log-line { display: flex; gap: 10px; }
  .log-time { color: var(--text3); flex-shrink: 0; }
  .log-msg.info { color: var(--text2); }
  .log-msg.success { color: var(--green); }
  .log-msg.warn { color: var(--orange); }
  .log-msg.accent { color: var(--cyan); }

  .progress-bar-wrap { background: var(--bg3); border-radius: 2px; height: 3px; margin: 10px 0; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--cyan); border-radius: 2px; transition: width 0.4s ease; box-shadow: 0 0 8px var(--cyan); }
  .progress-label { font-family: var(--mono); font-size: 10px; color: var(--text2); display: flex; justify-content: space-between; }

  /* Results */
  .results-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
  }
  .stat-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
  .stat-box {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 12px 18px;
    min-width: 110px;
    flex: 1;
  }
  .stat-val { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--cyan); }
  .stat-label { font-family: var(--mono); font-size: 9px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 3px; }

  /* Filter / view toggle */
  .toolbar {
    display: flex; gap: 10px; margin-bottom: 20px;
    flex-wrap: wrap; align-items: center;
  }
  .filter-btn {
    padding: 5px 12px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text2);
    transition: all 0.15s;
  }
  .filter-btn.active, .filter-btn:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.06); }
  .toolbar-sep { width: 1px; height: 20px; background: var(--border); }
  .view-btn {
    padding: 5px 12px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text3);
    transition: all 0.15s;
  }
  .view-btn.active { border-color: var(--purple); color: var(--purple); background: rgba(168,85,247,0.06); }
  .view-btn:hover { color: var(--text2); }
  .export-row { display: flex; gap: 8px; }

  /* ── Document-first table view ── */
  .framework-block { margin-bottom: 24px; }
  .framework-header {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 5px 5px 0 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  .framework-header:hover { background: var(--bg4); }
  .framework-name {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--cyan);
    flex: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .framework-badge {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--text3);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 2px 9px;
  }
  .chevron { color: var(--text3); font-size: 10px; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }

  /* The big results table */
  .req-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--border);
    border-top: none;
    font-size: 12px;
  }
  .req-table th {
    background: var(--bg2);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 56px;
    z-index: 5;
    white-space: nowrap;
  }
  .req-table td {
    padding: 9px 12px;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    vertical-align: top;
    line-height: 1.5;
  }
  .req-table tr:last-child td { border-bottom: none; }
  .req-table tr:hover td { background: rgba(0,212,255,0.02); }

  /* Cell types */
  .cell-mono { font-family: var(--mono); font-size: 10px; color: var(--text2); }
  .cell-id { font-family: var(--mono); font-size: 10px; color: var(--yellow); }
  .cell-req { font-size: 12px; color: var(--text); line-height: 1.55; max-width: 320px; }
  .cell-granular { font-family: var(--mono); font-size: 10px; color: var(--green); }
  .cell-sub { font-family: var(--mono); font-size: 10px; color: var(--cyan2); }
  .cell-main { font-family: var(--mono); font-size: 10px; color: var(--purple); }
  .conf-pill {
    display: inline-block;
    font-family: var(--mono);
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: 700;
  }
  .conf-high { background: rgba(0,255,136,0.12); color: var(--green); }
  .conf-mid { background: rgba(0,212,255,0.1); color: var(--cyan); }
  .conf-low { background: rgba(255,107,43,0.12); color: var(--orange); }

  /* ── Theme-first hierarchical view ── */
  .theme-section { margin-bottom: 20px; }
  .theme-header {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 16px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 5px 5px 0 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  .theme-header:hover { background: var(--bg4); }
  .theme-name {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    color: var(--purple);
    flex: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .theme-count { font-family: var(--mono); font-size: 9px; color: var(--text3); background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 2px 8px; }
  .sub-theme-row {
    padding: 8px 16px 8px 28px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
  }
  .sub-theme-row:hover { background: var(--bg3); }
  .sub-name { font-family: var(--mono); font-size: 10px; color: var(--cyan2); flex: 1; }
  .granular-row {
    padding: 6px 16px 6px 48px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
  }
  .granular-row:hover { background: rgba(0,255,136,0.02); }
  .granular-name { font-family: var(--mono); font-size: 10px; color: var(--green); flex: 1; }

  /* Info/warn */
  .info-box {
    background: rgba(0,212,255,0.05);
    border: 1px solid rgba(0,212,255,0.18);
    border-radius: 4px;
    padding: 11px 14px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text2);
    line-height: 1.8;
    margin-bottom: 14px;
  }
  .warn-box {
    background: rgba(255,107,43,0.07);
    border: 1px solid rgba(255,107,43,0.22);
    border-radius: 4px;
    padding: 11px 14px;
    font-family: var(--mono);
    font-size: 10px;
    color: #ff9060;
    line-height: 1.8;
    margin-bottom: 14px;
  }
  .success-box {
    background: rgba(0,255,136,0.05);
    border: 1px solid rgba(0,255,136,0.2);
    border-radius: 4px;
    padding: 11px 14px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--green);
    line-height: 1.8;
    margin-bottom: 14px;
  }

  .row { display: flex; gap: 16px; flex-wrap: wrap; }
  .col { flex: 1; min-width: 260px; }
  .gap { margin-bottom: 12px; }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(0,212,255,0.2);
    border-top-color: var(--cyan);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text3); font-family: var(--mono); font-size: 11px; }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }

  .section-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .section-divider::before, .section-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .section-divider span { font-family: var(--mono); font-size: 9px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }

  .tag {
    display: inline-block;
    font-family: var(--mono);
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 2px;
    white-space: nowrap;
  }
  .tag-cyan { background: rgba(0,212,255,0.1); color: var(--cyan); border: 1px solid rgba(0,212,255,0.2); }
  .tag-green { background: rgba(0,255,136,0.1); color: var(--green); border: 1px solid rgba(0,255,136,0.2); }

  /* Theme preview tree */
  .theme-tree { background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 12px; max-height: 200px; overflow-y: auto; }
  .tree-main { font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--purple); margin-bottom: 3px; margin-top: 6px; }
  .tree-sub { font-family: var(--mono); font-size: 10px; color: var(--cyan2); margin-left: 12px; margin-bottom: 1px; }
  .tree-granular { font-family: var(--mono); font-size: 9px; color: var(--text3); margin-left: 24px; line-height: 1.8; }

  .inline-code { font-family: var(--mono); font-size: 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 3px; padding: 1px 6px; color: var(--cyan); }

  .sheet-select { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .sheet-btn {
    font-family: var(--mono);
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 3px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .sheet-btn.active { border-color: var(--green); color: var(--green); background: rgba(0,255,136,0.06); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunkText(text, chunkSize = 5000, overlap = 300) {
  // Split on paragraph/section boundaries where possible
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    // Try to break at a natural boundary (newline) within last 15% of chunk
    if (end < text.length) {
      const lookback = Math.max(start, end - Math.floor(chunkSize * 0.15));
      const nlIdx = text.lastIndexOf("\n", end);
      if (nlIdx > lookback) end = nlIdx + 1;
    }
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
function getFileExt(name) { return name.split(".").pop().toLowerCase(); }

// ─── Azure OpenAI ─────────────────────────────────────────────────────────────

async function callAzure(endpoint, apiKey, apiVersion, messages, maxTokens = 2000, retries = 3) {
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
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(bodyObj) });
      if (res.status === 429 || res.status === 503) {
        await new Promise(r => setTimeout(r, attempt * 2500));
        lastError = new Error(`Rate limited (${res.status})`);
        continue;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Azure API error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Azure OpenAI");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise(r => setTimeout(r, attempt * 1500));
    }
  }
  throw lastError || new Error("All retry attempts failed");
}

function robustParseJSON(raw) {
  // Attempt 1: direct
  try { return JSON.parse(raw.trim()); } catch {}
  // Attempt 2: extract array
  try { const m = raw.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]); } catch {}
  // Attempt 3: strip fences
  try {
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return JSON.parse(clean);
  } catch {}
  return null;
}

// ─── Step 1: Extract structured requirements from chunk ───────────────────────
// Returns array of { sectionId, topic, subTopic, requirement }

async function extractRequirementsFromChunk(apiKey, endpoint, apiVersion, chunk, frameworkName, chunkIndex) {
  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a senior cybersecurity compliance analyst. Extract ALL requirements, controls, obligations, and mandates from the provided framework text.

For each requirement, identify:
- sectionId: The section/control/article identifier (e.g., "5.1.1", "AC-2", "Article 32", "Clause 6.1") — use "" if not present
- topic: The high-level topic or domain this section belongs to (e.g., "Access Control", "Risk Management", "Incident Response")
- subTopic: The more specific sub-topic or sub-section title (e.g., "User Account Management", "Password Policy") — use "" if not present
- requirement: The full, verbatim or closely paraphrased requirement text (be comprehensive, do NOT truncate)

Return ONLY a valid JSON array. No markdown, no code fences, no preamble.
Each object: { "sectionId": "...", "topic": "...", "subTopic": "...", "requirement": "..." }
If no requirements exist in this text, return: []`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}\nChunk index: ${chunkIndex}\n\nText:\n${chunk}\n\nReturn JSON array only.`,
    },
  ], 3000);

  const parsed = robustParseJSON(raw);
  if (!parsed) return { reqs: [], rawResponse: raw, parseError: "JSON parse failed" };
  if (!Array.isArray(parsed)) return { reqs: [], rawResponse: raw, parseError: "Not an array" };
  return { reqs: parsed, rawResponse: raw, parseError: null };
}

// ─── Step 2: Map requirements to themes (batched) ────────────────────────────

async function mapRequirementsToThemes(apiKey, endpoint, apiVersion, requirements, themes, themeTree, frameworkName) {
  // Build compact hierarchy string for context
  const hierarchyContext = themeTree.length > 0
    ? themeTree.slice(0, 30).map(m =>
        `[MAIN] ${m.main}\n` + m.subs.slice(0, 10).map(s =>
          `  [SUB] ${s.sub}\n` + s.granular.slice(0, 15).map(g => `    [GRAN] ${g}`).join("\n")
        ).join("\n")
      ).join("\n")
    : themes.slice(0, 100).map((t, i) => `${i + 1}. ${t}`).join("\n");

  const granularList = themes.slice(0, 200).map((t, i) => `${i + 1}. ${t}`).join("\n");

  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a cybersecurity compliance analyst. Map each requirement to the most specific (granular) theme from the hierarchy below.

Theme hierarchy (3 levels):
${hierarchyContext}

Exact granular themes to use:
${granularList}

Return ONLY a valid JSON array (no markdown, no explanation).
Each item must have:
- "idx": the index number from the input array (0-based)
- "granularTheme": EXACT text from the granular themes list above
- "subTheme": the parent sub-theme (Level 2) that contains the granular theme
- "mainTheme": the top-level main theme (Level 1)
- "confidence": integer 0-100

CRITICAL: granularTheme MUST be copied exactly from the list. Never invent theme names.`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}\n\nRequirements (0-indexed):\n${JSON.stringify(requirements.map((r, i) => ({ idx: i, requirement: r.requirement, topic: r.topic, subTopic: r.subTopic })), null, 1)}\n\nReturn JSON array only.`,
    },
  ], 4000);

  const parsed = robustParseJSON(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed;
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

// ─── Document parsers ─────────────────────────────────────────────────────────

async function parsePDF(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const pdfjsLib = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
        if (!pdfjsLib) throw new Error("PDF.js not loaded");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          if (onProgress) onProgress(i, pdf.numPages);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let lastY = null, pageText = "";
          for (const item of content.items) {
            if (!item.str) continue;
            const y = item.transform?.[5] ?? null;
            if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) pageText += "\n";
            else if (pageText.length > 0 && !pageText.endsWith(" ")) pageText += " ";
            pageText += item.str;
            lastY = y;
          }
          fullText += `\n--- Page ${i} ---\n` + pageText + "\n";
        }
        if (!fullText.trim()) throw new Error("No text extracted — PDF may be scanned/image-based");
        resolve(fullText);
      } catch (err) { reject(err); }
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
      } catch (err) { reject(err); }
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
        wb.SheetNames.forEach(name => {
          text += `[Sheet: ${name}]\n` + XLSX.utils.sheet_to_csv(wb.Sheets[name]) + "\n\n";
        });
        resolve(text);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── LogBox ───────────────────────────────────────────────────────────────────

function LogBox({ logs }) {
  const ref = useRef(null);
  const prevLen = useRef(0);
  if (ref.current && logs.length !== prevLen.current) {
    prevLen.current = logs.length;
    setTimeout(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, 50);
  }
  return (
    <div className="log-box" ref={ref}>
      {logs.map((l, i) => (
        <div key={i} className="log-line">
          <span className="log-time">{l.time}</span>
          <span className={`log-msg ${l.type || "info"}`}>{l.msg}</span>
        </div>
      ))}
      {logs.length === 0 && <span style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 11 }}>Awaiting process start...</span>}
    </div>
  );
}

// ─── Results: Document-first view ─────────────────────────────────────────────

function ConfPill({ conf }) {
  const c = conf || 75;
  const cls = c >= 80 ? "conf-high" : c >= 60 ? "conf-mid" : "conf-low";
  return <span className={`conf-pill ${cls}`}>{c}%</span>;
}

function FrameworkTableBlock({ framework, rows, show }) {
  const [open, setOpen] = useState(true);
  if (!show) return null;
  return (
    <div className="framework-block">
      <div className="framework-header" onClick={() => setOpen(o => !o)}>
        <span className="framework-name">{framework}</span>
        <span className="framework-badge">{rows.length} requirements</span>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div style={{ overflowX: "auto" }}>
          <table className="req-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Section ID</th>
                <th style={{ width: 130 }}>Topic</th>
                <th style={{ width: 130 }}>Sub-Topic</th>
                <th>Requirement</th>
                <th style={{ width: 180 }}>Granular Theme</th>
                <th style={{ width: 160 }}>Sub Theme</th>
                <th style={{ width: 160 }}>Main Theme</th>
                <th style={{ width: 60 }}>Conf.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="cell-id">{row.sectionId || "—"}</span></td>
                  <td><span className="cell-mono">{row.topic || "—"}</span></td>
                  <td><span className="cell-mono" style={{ color: "var(--text3)" }}>{row.subTopic || "—"}</span></td>
                  <td><span className="cell-req">{row.requirement}</span></td>
                  <td><span className="cell-granular">{row.granularTheme || "—"}</span></td>
                  <td><span className="cell-sub">{row.subTheme || "—"}</span></td>
                  <td><span className="cell-main">{row.mainTheme || "—"}</span></td>
                  <td><ConfPill conf={row.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Results: Theme-first view ────────────────────────────────────────────────

function GranularBlock({ granular, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="granular-row" onClick={() => setOpen(o => !o)}>
        <span className="granular-name">{granular}</span>
        <span className="theme-count">{items.length} reqs</span>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div style={{ overflowX: "auto" }}>
          <table className="req-table">
            <thead>
              <tr>
                <th style={{ width: 90, paddingLeft: 60 }}>Section ID</th>
                <th style={{ width: 120 }}>Topic</th>
                <th style={{ width: 120 }}>Sub-Topic</th>
                <th>Requirement</th>
                <th style={{ width: 100 }}>Framework</th>
                <th style={{ width: 60 }}>Conf.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ paddingLeft: 60 }}><span className="cell-id">{item.sectionId || "—"}</span></td>
                  <td><span className="cell-mono">{item.topic || "—"}</span></td>
                  <td><span className="cell-mono" style={{ color: "var(--text3)" }}>{item.subTopic || "—"}</span></td>
                  <td><span className="cell-req">{item.requirement}</span></td>
                  <td><span className="tag tag-cyan">{item.framework}</span></td>
                  <td><ConfPill conf={item.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubThemeBlock({ sub, granulars }) {
  const [open, setOpen] = useState(false);
  const total = Object.values(granulars).reduce((a, items) => a + items.length, 0);
  return (
    <div>
      <div className="sub-theme-row" onClick={() => setOpen(o => !o)}>
        <span className="sub-name">{sub}</span>
        <span className="theme-count">{Object.keys(granulars).length} granular</span>
        <span className="theme-count">{total} reqs</span>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && Object.entries(granulars).sort((a, b) => a[0].localeCompare(b[0])).map(([g, items]) => (
        <GranularBlock key={g} granular={g} items={items} />
      ))}
    </div>
  );
}

function MainThemeBlock({ main, subs }) {
  const [open, setOpen] = useState(true);
  const totalReqs = Object.values(subs).reduce((a, gs) => a + Object.values(gs).reduce((b, items) => b + items.length, 0), 0);
  return (
    <div className="theme-section">
      <div className="theme-header" onClick={() => setOpen(o => !o)}>
        <span className="theme-name">{main}</span>
        <span className="theme-count">{Object.keys(subs).length} sub-themes</span>
        <span className="theme-count">{totalReqs} reqs</span>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
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
    ]).then(() => {
      if (!window.pdfjsLib && window["pdfjs-dist/build/pdf"]) window.pdfjsLib = window["pdfjs-dist/build/pdf"];
      if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setLibsReady(true);
    }).catch(() => setLibError("Failed to load document parsing libraries. Please refresh."));
  }, []);

  const [step, setStep] = useState(0);
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
  const [viewMode, setViewMode] = useState("document"); // "document" | "theme"
  const fileInputRef = useRef(null);
  const [testStatus, setTestStatus] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [connOk, setConnOk] = useState(false);

  const addLog = useCallback((msg, type = "info") => {
    setLogs(prev => [...prev, { time: now(), msg, type }]);
  }, []);

  // ── Theme hierarchy detection ──────────────────────────────────────────────

  const detectLevel = (text) => {
    const t = String(text || "").trim();
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
    const allCells = [];
    rows.forEach((row, ri) => row.forEach((cell, ci) => {
      const val = String(cell || "").trim();
      if (val) allCells.push({ val, ri, ci });
    }));
    allCells.sort((a, b) => a.ri - b.ri || a.ci - b.ci);

    const tree = [];
    let currentMain = null, currentSub = null;
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
      const flat = [];
      tree.forEach(m => m.subs.forEach(s => s.granular.forEach(g => flat.push(g))));
      if (flat.length === 0) tree.forEach(m => m.subs.forEach(s => flat.push(s.sub)));
      if (flat.length === 0) tree.forEach(m => flat.push(m.main));
      setThemes(flat);
      if (flat.length === 0) setThemeParseError("No themes detected. Ensure theme names start with numbered patterns like 1.1.1.");
    } catch (e) { setThemeParseError("Could not parse theme hierarchy: " + e.message); }
  };

  const handleThemeFile = (file) => {
    setThemeParseError(""); setThemes([]); setThemeTree([]); setThemeSheets([]);
    setThemeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) throw new Error("SheetJS not loaded");
        const wb = XLSX.read(e.target.result, { type: "array" });
        setThemeWorkbook(wb);
        setThemeSheets(wb.SheetNames);
        setThemeSheet(wb.SheetNames[0]);
        buildThemePreview(wb, wb.SheetNames[0]);
      } catch (err) { setThemeParseError("Failed to parse Excel: " + err.message); }
    };
    reader.onerror = () => setThemeParseError("Could not read file.");
    reader.readAsArrayBuffer(file);
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => ["pdf", "docx", "xlsx", "xls"].includes(getFileExt(f.name)));
    setFiles(prev => { const names = new Set(prev.map(f => f.name)); return [...prev, ...valid.filter(f => !names.has(f.name))]; });
  };

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const testConnection = async () => {
    setTestStatus("testing"); setTestMsg(""); setConnOk(false);
    try {
      const result = await extractRequirementsFromChunk(
        apiKey, azureEndpoint, apiVersion,
        "5.1.1 The organization shall implement multi-factor authentication for all privileged accounts. Access to sensitive systems must be logged and reviewed on a monthly basis.",
        "TEST", "test-0"
      );
      if (result.parseError) { setTestStatus("fail"); setTestMsg(`Connected but JSON parse failed. Raw: ${(result.rawResponse || "").slice(0, 300)}`); }
      else if (result.reqs.length > 0) { setTestStatus("ok"); setConnOk(true); setTestMsg(`✓ Connected. Extracted ${result.reqs.length} requirement(s) from test text.`); }
      else { setTestStatus("fail"); setTestMsg(`Connected but model returned 0 requirements. Raw: ${(result.rawResponse || "").slice(0, 300)}`); }
    } catch (e) { setTestStatus("fail"); setTestMsg(`Connection failed: ${e.message}`); }
  };

  // ── Main processing pipeline ───────────────────────────────────────────────

  const process = async () => {
    if (!apiKey || !azureEndpoint || !apiVersion || files.length === 0 || themes.length === 0) return;
    setIsProcessing(true); setStep(2); setLogs([]); setResults([]); setProgress(0);

    const allMapped = [];
    const totalFiles = files.length;

    try {
      for (let fi = 0; fi < files.length; fi++) {
        const file = files[fi];
        const ext = getFileExt(file.name);
        const frameworkName = file.name.replace(/\.[^.]+$/, "");
        addLog(`[${fi + 1}/${totalFiles}] ▶ ${file.name}`, "accent");

        // Parse document
        addLog(`  Parsing ${ext.toUpperCase()}...`);
        let text = "";
        try {
          if (ext === "pdf") {
            text = await parsePDF(file, (page, total) => {
              setProgressLabel(`Parsing PDF — page ${page}/${total}`);
              setProgress(Math.round(((fi + (page / total) * 0.15) / totalFiles) * 100));
            });
          } else if (ext === "docx") {
            text = await parseDOCX(file);
          } else {
            text = await parseXLSX(file);
          }
        } catch (e) {
          addLog(`  PARSE ERROR: ${e.message}`, "warn");
          continue;
        }

        const charCount = text.trim().length;
        addLog(`  Extracted ${charCount.toLocaleString()} chars`, charCount > 100 ? "success" : "warn");
        if (charCount < 100) { addLog(`  Too little text. Skipping.`, "warn"); continue; }

        // Chunk and extract structured requirements
        const chunks = chunkText(text, 5000, 300);
        addLog(`  Split into ${chunks.length} chunks for extraction`);

        const allReqs = [];
        for (let ci = 0; ci < chunks.length; ci++) {
          const pct = Math.round(((fi + 0.15 + (ci + 1) / chunks.length * 0.5) / totalFiles) * 100);
          setProgress(pct);
          setProgressLabel(`[${frameworkName}] Extracting — chunk ${ci + 1}/${chunks.length}`);
          addLog(`  Chunk ${ci + 1}/${chunks.length} (${chunks[ci].length} chars)...`);

          try {
            const result = await extractRequirementsFromChunk(apiKey, azureEndpoint, apiVersion, chunks[ci], frameworkName, `${fi}-${ci}`);
            if (result.parseError) addLog(`    Parse error: ${result.parseError}`, "warn");
            else addLog(`    ${result.reqs.length} requirement(s) extracted`, result.reqs.length > 0 ? "success" : "info");
            allReqs.push(...result.reqs);
          } catch (e) { addLog(`    ERROR: ${e.message}`, "warn"); }

          if (ci < chunks.length - 1) await new Promise(r => setTimeout(r, 800));
        }

        addLog(`  Total extracted: ${allReqs.length} requirements`, allReqs.length > 0 ? "success" : "warn");
        if (allReqs.length === 0) { addLog(`  Skipping theme mapping — no requirements found.`, "warn"); continue; }

        // Map to themes in batches of 20
        const BATCH = 20;
        const batches = Math.ceil(allReqs.length / BATCH);
        const mappedData = [];

        for (let bi = 0; bi < batches; bi++) {
          const batch = allReqs.slice(bi * BATCH, (bi + 1) * BATCH);
          const pct = Math.round(((fi + 0.65 + (bi + 1) / batches * 0.35) / totalFiles) * 100);
          setProgress(pct);
          setProgressLabel(`[${frameworkName}] Mapping themes — batch ${bi + 1}/${batches}`);
          addLog(`  Mapping batch ${bi + 1}/${batches} (${batch.length} reqs)...`);

          try {
            const mappedBatch = await mapRequirementsToThemes(apiKey, azureEndpoint, apiVersion, batch, themes, themeTree, frameworkName);
            addLog(`    ✓ Mapped ${mappedBatch.length} requirements`, mappedBatch.length > 0 ? "success" : "warn");

            // Merge extraction data with mapping data
            mappedBatch.forEach(m => {
              const originalIdx = m.idx ?? 0;
              const original = batch[originalIdx] || batch[0];
              if (original) {
                mappedData.push({
                  framework: frameworkName,
                  sectionId: original.sectionId || "",
                  topic: original.topic || "",
                  subTopic: original.subTopic || "",
                  requirement: original.requirement || "",
                  granularTheme: m.granularTheme || "",
                  subTheme: m.subTheme || "",
                  mainTheme: m.mainTheme || "",
                  confidence: m.confidence || 75,
                });
              }
            });
          } catch (e) { addLog(`    ERROR batch ${bi + 1}: ${e.message}`, "warn"); }

          if (bi < batches - 1) await new Promise(r => setTimeout(r, 800));
        }

        addLog(`  ✓ Done: ${mappedData.length} requirements mapped for "${frameworkName}"`, "success");
        allMapped.push(...mappedData);
      }

      setProgress(100); setProgressLabel("Complete ✓");
      addLog(`Processing complete — ${allMapped.length} total requirements mapped`, "accent");
      setResults(allMapped);
      setTimeout(() => setStep(3), 800);
    } catch (err) {
      addLog(`FATAL: ${err.message}`, "warn");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const header = "Framework,Section ID,Topic,Sub-Topic,Requirement,Granular Theme,Sub Theme,Main Theme,Confidence\n";
    const rows = results.map(r =>
      [r.framework, r.sectionId, r.topic, r.subTopic, r.requirement, r.granularTheme, r.subTheme, r.mainTheme, r.confidence]
        .map(v => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "framework-mapping.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "framework-mapping.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived data for results ───────────────────────────────────────────────

  const allFrameworks = [...new Set(results.map(r => r.framework))];
  const filteredResults = activeFilter === "ALL" ? results : results.filter(r => r.framework === activeFilter);

  // By framework (for document view)
  const byFramework = {};
  filteredResults.forEach(r => {
    if (!byFramework[r.framework]) byFramework[r.framework] = [];
    byFramework[r.framework].push(r);
  });

  // By main > sub > granular (for theme view)
  const byMain = {};
  filteredResults.forEach(r => {
    const main = r.mainTheme || "Uncategorized";
    const sub = r.subTheme || "General";
    const granular = r.granularTheme || "Uncategorized";
    if (!byMain[main]) byMain[main] = {};
    if (!byMain[main][sub]) byMain[main][sub] = {};
    if (!byMain[main][sub][granular]) byMain[main][sub][granular] = [];
    byMain[main][sub][granular].push(r);
  });

  const STEPS = ["01 · Config", "02 · Upload", "03 · Processing", "04 · Results"];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {!libsReady && !libError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>
            <span className="spinner" /> Loading parsers...
          </div>
        )}
        {libError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <div className="warn-box" style={{ maxWidth: 420 }}>{libError}</div>
          </div>
        )}
        {libsReady && (
          <>
            {/* Header */}
            <div className="header">
              <div className="header-logo">
                <div className="logo-icon">◈</div>
                CyberMapper
              </div>
              <div className="header-div" />
              <span className="header-sub">Framework Requirements → Theme Mapping Engine</span>
              <div className="header-right">
                <div className={`status-dot ${connOk ? "ok" : ""}`} title={connOk ? "API connected" : "Not tested"} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.06em" }}>
                  {connOk ? "API CONNECTED" : "NOT TESTED"}
                </span>
              </div>
            </div>

            {/* Steps nav */}
            <div className="steps-nav">
              {STEPS.map((s, i) => (
                <div key={i} className={`step-tab ${step === i ? "active" : ""} ${step > i ? "done" : ""}`} onClick={() => step > i && setStep(i)}>
                  <span className="step-num">{step > i ? "✓" : i + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            <div className="main">

              {/* ── Step 0: Config ── */}
              {step === 0 && (
                <>
                  <div className="section-title">Configuration</div>
                  <div className="section-sub">Connect your Azure OpenAI API and upload the theme taxonomy before processing documents.</div>

                  <div className="row">
                    <div className="col">
                      <div className="card">
                        <div className="card-title">Azure OpenAI Credentials</div>
                        <div className="warn-box">
                          <strong>CORS note:</strong> Browser security blocks direct Azure calls from Claude artifacts. Run <span className="inline-code">proxy-server.js</span> locally + expose via ngrok, or configure CORS on your Azure resource. Paste the proxy URL (e.g. <span className="inline-code">https://xxxx.ngrok-free.app/azure</span>) as the endpoint.
                        </div>
                        <div className="field">
                          <label className="label">API Key</label>
                          <input className="input" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                        </div>
                        <div className="field">
                          <label className="label">Azure Endpoint (include /openai/deployments/&lt;model&gt;)</label>
                          <input className="input" type="text" placeholder="https://<resource>.openai.azure.com/openai/deployments/gpt-4o" value={azureEndpoint} onChange={e => setAzureEndpoint(e.target.value)} />
                        </div>
                        <div className="field">
                          <label className="label">API Version</label>
                          <input className="input" type="text" placeholder="2024-02-15-preview" value={apiVersion} onChange={e => setApiVersion(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <button className="btn btn-outline" disabled={!apiKey || !azureEndpoint || !apiVersion || testStatus === "testing"} onClick={testConnection}>
                            {testStatus === "testing" ? <><span className="spinner" /> Testing...</> : "▶ Test Connection"}
                          </button>
                        </div>
                        {testMsg && (
                          <div className={testStatus === "ok" ? "success-box" : "warn-box"} style={{ marginTop: 10, marginBottom: 0 }}>
                            {testMsg}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col">
                      <div className="card">
                        <div className="card-title">Theme Taxonomy</div>
                        <div className="info-box">
                          Upload your Excel theme file. Theme levels are detected by numbered prefixes:<br />
                          <span className="inline-code">1.</span> → Main theme &nbsp;|&nbsp;
                          <span className="inline-code">1.1.</span> → Sub-theme &nbsp;|&nbsp;
                          <span className="inline-code">1.1.1.</span> → Granular theme (mapping target)
                        </div>
                        <div
                          className="upload-zone"
                          style={{ padding: 18, marginBottom: 12 }}
                          onClick={() => themeFileRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleThemeFile(f); }}
                        >
                          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>
                            {themeFileName ? `✓ ${themeFileName}` : "⬆ Drop theme Excel or click"}
                          </div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 3 }}>.xlsx / .xls</div>
                        </div>
                        <input ref={themeFileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                          onChange={e => { if (e.target.files[0]) handleThemeFile(e.target.files[0]); }} />

                        {themeSheets.length > 1 && (
                          <div style={{ marginBottom: 12 }}>
                            <div className="label">Select sheet</div>
                            <div className="sheet-select">
                              {themeSheets.map(s => (
                                <button key={s} className={`sheet-btn ${themeSheet === s ? "active" : ""}`}
                                  onClick={() => { setThemeSheet(s); buildThemePreview(themeWorkbook, s); }}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {themeTree.length > 0 && (
                          <>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginBottom: 8, letterSpacing: "0.08em", display: "flex", gap: 16 }}>
                              <span><span style={{ color: "var(--purple)" }}>{themeTree.length}</span> MAIN</span>
                              <span><span style={{ color: "var(--cyan)" }}>{themeTree.reduce((a, m) => a + m.subs.length, 0)}</span> SUB</span>
                              <span><span style={{ color: "var(--green)" }}>{themes.length}</span> GRANULAR</span>
                            </div>
                            <div className="theme-tree">
                              {themeTree.slice(0, 20).map(m => (
                                <div key={m.main}>
                                  <div className="tree-main">{m.main}</div>
                                  {m.subs.slice(0, 5).map(s => (
                                    <div key={s.sub}>
                                      <div className="tree-sub">▸ {s.sub}</div>
                                      {s.granular.slice(0, 4).map(g => (
                                        <div key={g} className="tree-granular">– {g}</div>
                                      ))}
                                      {s.granular.length > 4 && <div className="tree-granular" style={{ color: "var(--text3)", fontStyle: "italic" }}>  + {s.granular.length - 4} more...</div>}
                                    </div>
                                  ))}
                                  {m.subs.length > 5 && <div className="tree-sub" style={{ color: "var(--text3)", fontStyle: "italic" }}>  + {m.subs.length - 5} more sub-themes...</div>}
                                </div>
                              ))}
                              {themeTree.length > 20 && <div className="tree-main" style={{ color: "var(--text3)", fontStyle: "italic" }}>+ {themeTree.length - 20} more main themes...</div>}
                            </div>
                          </>
                        )}
                        {themeParseError && <div className="warn-box" style={{ marginTop: 10, marginBottom: 0 }}>{themeParseError}</div>}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={!apiKey || !azureEndpoint || !apiVersion || themes.length === 0}
                    onClick={() => setStep(1)}
                  >
                    Continue → Upload Documents
                  </button>
                </>
              )}

              {/* ── Step 1: Upload ── */}
              {step === 1 && (
                <>
                  <div className="section-title">Upload Framework Documents</div>
                  <div className="section-sub">Each file is treated as a separate framework. PDF, DOCX, and XLSX are all supported — including 300+ page documents.</div>

                  <div className="card">
                    <div className="card-title">Document Upload</div>
                    <div
                      className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    >
                      <div className="upload-icon">⬆</div>
                      <div className="upload-text">Drop files here or click to browse</div>
                      <div className="upload-hint">PDF · DOCX · XLSX — multiple files · 300+ pages OK</div>
                    </div>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.xls" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />

                    {files.length > 0 && (
                      <div className="file-list">
                        {files.map(f => {
                          const ext = getFileExt(f.name);
                          return (
                            <div key={f.name} className="file-item">
                              <div className={`file-icon ${ext}`}>{ext.toUpperCase()}</div>
                              <span className="file-name">{f.name}</span>
                              <span className="file-size">{formatBytes(f.size)}</span>
                              <button className="btn btn-danger" onClick={() => removeFile(f.name)}>✕ Remove</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {files.length > 0 && (
                    <div className="warn-box">
                      ⚠ Large documents (100+ pages) generate many API calls and may take several minutes. Each document is chunked into ~5000-char segments for extraction, then requirements are mapped in batches of 20.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
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
                  <div className="section-sub">Extracting structured requirements (section ID, topic, sub-topic, requirement text) then mapping each to the granular theme hierarchy.</div>

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
                      <span style={{ color: "var(--cyan)" }}>{progress}%</span>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <LogBox logs={logs} />
                    </div>
                  </div>

                  {!isProcessing && results.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setStep(3)}>View Results →</button>
                  )}
                </>
              )}

              {/* ── Step 3: Results ── */}
              {step === 3 && (
                <>
                  <div className="results-header">
                    <div>
                      <div className="section-title">Mapping Results</div>
                      <div className="section-sub" style={{ marginBottom: 0 }}>
                        Each requirement is shown with its extracted metadata (topic, sub-topic, section ID) mapped to the granular → sub → main theme hierarchy.
                      </div>
                    </div>
                    <div className="export-row">
                      <button className="btn btn-outline" onClick={exportCSV}>↓ CSV</button>
                      <button className="btn btn-outline" onClick={exportJSON}>↓ JSON</button>
                      <button className="btn btn-ghost" onClick={() => { setStep(1); setFiles([]); setResults([]); setLogs([]); setProgress(0); }}>+ New Run</button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stat-row">
                    <div className="stat-box">
                      <div className="stat-val">{results.length}</div>
                      <div className="stat-label">Requirements</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{allFrameworks.length}</div>
                      <div className="stat-label">Frameworks</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(results.map(r => r.mainTheme).filter(Boolean))].length}</div>
                      <div className="stat-label">Main Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(results.map(r => r.subTheme).filter(Boolean))].length}</div>
                      <div className="stat-label">Sub Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(results.map(r => r.granularTheme).filter(Boolean))].length}</div>
                      <div className="stat-label">Granular Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.confidence || 75), 0) / results.length) : 0}%</div>
                      <div className="stat-label">Avg Confidence</div>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="toolbar">
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filter:</span>
                    <button className={`filter-btn ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>All</button>
                    {allFrameworks.map(f => (
                      <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}

                    <div className="toolbar-sep" />

                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>View:</span>
                    <button className={`view-btn ${viewMode === "document" ? "active" : ""}`} onClick={() => setViewMode("document")}>
                      📄 Document View
                    </button>
                    <button className={`view-btn ${viewMode === "theme" ? "active" : ""}`} onClick={() => setViewMode("theme")}>
                      🗂 Theme View
                    </button>
                  </div>

                  {/* ── Document-first view ── */}
                  {viewMode === "document" && (
                    <>
                      <div className="section-divider"><span>Results by Framework → Requirements → Theme Mapping</span></div>
                      <div className="info-box" style={{ marginBottom: 16 }}>
                        <strong>Columns:</strong> Section ID · Topic · Sub-Topic · Requirement (from the document) → Granular Theme · Sub Theme · Main Theme (from your taxonomy)
                      </div>
                      {Object.keys(byFramework).length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">◈</div><div>No results to display</div></div>
                      ) : (
                        Object.entries(byFramework).sort((a, b) => a[0].localeCompare(b[0])).map(([fw, rows]) => (
                          <FrameworkTableBlock key={fw} framework={fw} rows={rows} show={true} />
                        ))
                      )}
                    </>
                  )}

                  {/* ── Theme-first view ── */}
                  {viewMode === "theme" && (
                    <>
                      <div className="section-divider"><span>Results by Main Theme → Sub Theme → Granular Theme → Requirements</span></div>
                      {Object.keys(byMain).length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">◈</div><div>No results to display</div></div>
                      ) : (
                        Object.entries(byMain).sort((a, b) => a[0].localeCompare(b[0])).map(([main, subs]) => (
                          <MainThemeBlock key={main} main={main} subs={subs} />
                        ))
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
