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
    border-bottom: 2px solid var(--border2);
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

  /* Multi-theme mapping pills */
  .theme-mapping-cell { display: flex; flex-direction: column; gap: 6px; }
  .theme-mapping-entry {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-left: 3px solid var(--green);
    border-radius: 4px;
    padding: 6px 9px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .theme-mapping-entry:hover { border-color: var(--border2); border-left-color: var(--green); }
  .tme-label {
    font-family: var(--mono);
    font-size: 8px;
    color: var(--text3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .tme-label-sep { color: var(--border2); }
  .tme-granular { font-family: var(--mono); font-size: 10px; color: var(--green); line-height: 1.4; font-weight: 700; }
  .tme-sub { font-family: var(--mono); font-size: 9px; color: var(--cyan2); }
  .tme-main { font-family: var(--mono); font-size: 9px; color: var(--purple); }
  .tme-footer { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
  .tme-idx { font-family: var(--mono); font-size: 8px; color: var(--text3); background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 1px 6px; }
  .no-mappings { font-family: var(--mono); font-size: 10px; color: var(--text3); font-style: italic; }
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

// ─── FIX 5: Theme name normaliser — strips numeric prefixes ──────────────────
// Converts "9.1.1. IT Governance Framework" → "IT Governance Framework"
// Applied to every granular theme name coming out of the AI, ensuring all
// comparisons, grouping and display use clean plain names.
function normaliseThemeName(name) {
  if (!name) return "";
  return String(name).replace(/^\d+(\.\d+)*\.\s*/, "").trim();
}

// ─── FIX 4: Theme descriptions for rarely-produced themes ────────────────────
// These descriptions are injected into the mapping prompt so the model can
// recognise when a requirement maps to a theme it would otherwise overlook.
const THEME_DESCRIPTIONS = {
  "IT Compliance Management Framework": "Overarching framework governing compliance obligations, policies, and processes for managing regulatory requirements",
  "IT Compliance Reporting": "Reporting on regulatory or compliance status, findings, and obligations to stakeholders or regulators",
  "IT Compliance Assessment": "Formal assessment or audit activities to evaluate compliance with regulatory or policy requirements",
  "IT Regulatory Change Management": "Process for tracking, assessing, and responding to changes in laws, regulations, and standards",
  "IT Strategy": "Strategic planning and long-term direction for IT and cybersecurity aligned to business objectives",
  "Information Security Management System (ISMS)": "The overarching ISMS framework (e.g. ISO 27001) governing information security policies, controls, and continual improvement",
  "Employee Roles & Responsibilities": "Defining, communicating, and enforcing security-related roles, duties, and accountabilities within the workforce",
  "Management Reporting": "Internal reporting to senior management on security posture, risk status, incidents, and metrics",
  "Network Architecture Diagram": "Documentation and maintenance of network topology, data flows, and authorised communication paths",
  "Service Catalog Management": "Inventory and lifecycle management of services the organisation provides to or receives from others",
  "Incident Management": "Organisation-level governance, policy, and oversight for cybersecurity incident management",
  "Cybersecurity Incident Response Plans": "Specific documented plans, playbooks, and procedures for responding to cybersecurity incidents",
  "Password Management": "Controls governing creation, storage, rotation, and enforcement of passwords and passphrases",
  "Access Control System": "Technical and procedural controls enforcing who can access systems, applications, and data",
  "Dual Access": "Controls requiring two separate parties or credentials to complete a sensitive action (dual control / dual authorisation)",
  "External Digital Identity": "Management of digital identities for external users, partners, or customers accessing organisational systems",
  "Generic IDs Management": "Governance of shared, generic, or non-personal accounts (e.g. admin, service, system accounts)",
  "Non-Conformity and Findings Management": "Process for recording, tracking, and resolving non-conformities, audit findings, and exceptions",
  "IT Third Party Recourse": "Contractual and procedural mechanisms for seeking redress or remediation from third-party suppliers",
  "IT Third Party Service Monitoring": "Ongoing monitoring of third-party service performance, security posture, and compliance",
  "Service Level Monitoring": "Tracking and reporting on SLA adherence, service performance metrics, and breach management",
  "Third party Concentration Risk": "Assessment and management of risk arising from over-reliance on a single supplier or class of suppliers",
  "Escrows for Third Party Source Codes": "Contractual arrangements ensuring source code or software assets are held in escrow for continuity",
  "IT Contract Renewals and Termination": "Governance of contract renewal decisions, termination clauses, and exit obligations",
  "Asset Disposition": "Secure disposal and sanitisation of assets at end-of-life to prevent data leakage",
  "Asset Maintenance": "Scheduled maintenance, patching, and upkeep of hardware and software assets",
  "Asset Recertification": "Periodic re-validation and recertification of asset inventories and their classifications",
  "IT Asset Decommissioning": "Formal process for decommissioning and retiring IT assets from service",
  "Data Discovery": "Identification and cataloguing of data across systems, including sensitive and unstructured data",
  "Database Inventory": "Maintaining a register of all databases, their owners, data types, and sensitivity levels",
  "Penetration Testing and Remediation": "Planned penetration tests against systems and the remediation of identified vulnerabilities",
  "Post-remediation Validation": "Testing to confirm that previously identified vulnerabilities have been fully remediated",
  "Security Testing for Platforms": "Security testing activities specific to platforms, operating systems, or infrastructure components",
  "Vulnerability & Pentest Metrics Reporting": "Reporting on vulnerability scan results, penetration test outcomes, and remediation metrics",
  "Vulnerability and Penetration Testing of Vendor Managed Applications": "Vulnerability and pen-testing of applications or systems managed by third-party vendors",
  "Zero-day Vulnerability Management": "Processes for identifying, assessing, and responding to zero-day vulnerabilities",
  "Change Tracking and Communication": "Recording change activities and communicating change status to affected stakeholders",
  "Testing of Changes": "Testing requirements for verifying changes before deployment, including regression and impact testing",
  "Disaster Recovery Plan Testing": "Scheduled testing and exercising of disaster recovery plans to validate recovery capabilities",
  "Background Screening": "Pre-employment and periodic background checks for personnel with access to sensitive systems or data",
};

// ─── FIX 2 + FIX 1: Build enriched granular theme list with descriptions ─────
// Combines the taxonomy list with descriptions for rarely-produced themes, and
// applies strict usage rules for over-used generic themes.
function buildEnrichedThemeList(themes) {
  return themes.map(t => {
    const clean = normaliseThemeName(t);
    const desc = THEME_DESCRIPTIONS[clean];
    return desc ? `${clean} — ${desc}` : clean;
  }).join("\n");
}

// ─── Step 2: Map requirements to MULTIPLE themes (batched) ───────────────────
// Each requirement can match several granular themes.
// Returns array of { idx, mappings: [{granularTheme, subTheme, mainTheme, confidence}] }

async function mapRequirementsToThemes(apiKey, endpoint, apiVersion, requirements, themes, themeTree, frameworkName) {
  // FIX 5: normalise theme names in hierarchy context (strip numeric prefixes)
  const hierarchyContext = themeTree.length > 0
    ? themeTree.slice(0, 40).map(m =>
        `[MAIN] ${normaliseThemeName(m.main)}\n` + m.subs.slice(0, 15).map(s =>
          `  [SUB] ${normaliseThemeName(s.sub)}\n` + s.granular.slice(0, 20).map(g => `    [GRAN] ${normaliseThemeName(g)}`).join("\n")
        ).join("\n")
      ).join("\n")
    : themes.map(t => normaliseThemeName(t)).slice(0, 150).join("\n");

  // FIX 4: enriched list with descriptions for underused themes
  const enrichedGranularList = buildEnrichedThemeList(themes);

  // FIX 3: Few-shot calibration examples from verified manual ground truth
  const fewShotExamples = `CALIBRATION EXAMPLES (from verified expert mappings — use as precision reference):
Req: "The organizational mission is understood and informs cybersecurity risk management"
→ [IT Governance Framework]

Req: "Risk appetite and risk tolerance statements are established, communicated, and maintained"
→ [IT Risk Response]

Req: "Cybersecurity risk management activities and outcomes are included in enterprise risk management processes"
→ [IT Compliance Reporting, IT Risk Reporting, IT Risk Response]

Req: "Lines of communication across the organization are established for cybersecurity risks, including risks from suppliers and other third parties"
→ [Communication, IT Compliance Reporting, IT Risk Reporting, Management Reporting]

Req: "Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced"
→ [Employee Roles & Responsibilities]

Req: "Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced to reflect changes in requirements, threats, technology, and organizational mission"
→ [IT Compliance Assessment, IT Compliance Management Framework, IT Policies and Standards Management]

Req: "Identities are proofed and bound to credentials based on the context of interactions"
→ [Access Control System, Dual Access, External Digital Identity, Generic IDs Management, User Access Provisioning]

Req: "Vulnerabilities in assets are identified, validated, and recorded"
→ [Penetration Testing and Remediation, Post-remediation Validation, Vulnerability & Pentest Metrics Reporting, Vulnerability Prioritization, Vulnerability Scanning and Remediation, Vulnerability and Penetration Testing of Vendor Managed Applications, Zero-day Vulnerability Management]

Req: "Systems, hardware, software, services, and data are managed throughout their life cycles"
→ [Asset Disposition, Asset End of Life Management, Asset Maintenance, Asset Protection, Asset Recertification, IT Asset Decommissioning, Return of Assets]

Req: "Representations of the organization's authorized network communication and internal and external network links are maintained"
→ [Network Architecture Diagram]

Req: "Inventories of software, services, and systems managed by the organization are maintained"
→ [Asset Catalog Management, Data Discovery, Database Inventory, Service Catalog Management]

Req: "Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or agreement"
→ [IT Contract Renewals and Termination, Third Party Offboarding & Exit Strategies]`;

  // FIX 1: Strict usage rules for over-used generic themes
  const usageRules = `STRICT THEME USAGE RULES — apply rigorously before assigning any theme:

"Communication": ONLY when the requirement is specifically about notification channels, reporting lines, escalation paths, or alert mechanisms. NOT a catch-all for requirements that mention communicating anything.

"IT Governance Framework": ONLY when the requirement is specifically about governance structures, charters, board-level accountability, or governance frameworks. NOT for risk management, strategy, or policy topics.

"Asset Discovery": ONLY for active scanning, discovery, or enumeration processes for identifying assets on a network. NOT for any requirement that simply mentions assets or inventories in another context.

"Continual Process Improvement": ONLY when the requirement explicitly mentions reviews, improvement cycles, lessons learned, or feedback loops. NOT for general operational or management processes.

"Training and Awareness": ONLY when the requirement explicitly mentions training, awareness programmes, education, or staff learning activities. NOT for HR, roles, responsibilities, or cultural topics.

"IT Risk Management Framework": ONLY for the risk management methodology, framework, or governance structure itself. When a requirement mentions specific risk activities, use the specific theme instead:
  - Risk evaluation → IT Risk Assessment
  - Risk treatment/response → IT Risk Response
  - Risk reporting → IT Risk Reporting
  - Compliance reporting → IT Compliance Reporting

DISAMBIGUATION PAIRS — distinguish carefully:
- "Incident Management" (org-level governance) vs "Incident Response and Resolution" (IT operational process)
- "Service Catalog Management" (services inventory) vs "Asset Catalog Management" (hardware/software inventory)
- "IT Compliance Reporting" (regulatory obligations) vs "IT Risk Reporting" (risk posture) — these frequently BOTH apply to the same requirement
- "IT Third Party Risk Assessment" (proactive evaluation) vs "IT Third Party Risk Issue Management" (reactive problem handling)
- "Cybersecurity Incident Response Plans" (specific cyber IR plans) vs "Business Continuity Plan" (broader operational continuity)
- "Network Architecture Diagram" (topology documentation) vs "Asset Discovery" (active scanning process)`;

  // FIX 3: Reasoning framework instruction
  const reasoningInstruction = `REASONING PROCESS — for each requirement, systematically check ALL five dimensions:
1. DOCUMENTATION: What records, registers, inventories, or diagrams must be maintained?
2. PROCESSES: What operational processes or procedures must be in place?
3. CONTROLS: What technical or procedural controls are mandated?
4. REPORTING: What reporting or communication obligations follow (compliance, risk, management)?
5. THIRD-PARTY: Are there vendor/supplier management implications?
Map to a theme for EACH dimension that genuinely applies. Complex requirements often span 4–7 themes.`;

  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a senior cybersecurity compliance analyst specialising in mapping framework requirements to control themes. A single requirement frequently addresses multiple security themes — your job is to identify ALL of them with precision.

${usageRules}

${reasoningInstruction}

AVAILABLE THEME HIERARCHY (3 levels — Main → Sub → Granular):
${hierarchyContext}

GRANULAR THEMES (mapping targets — use EXACT plain names, no numeric prefixes):
${enrichedGranularList}

${fewShotExamples}

OUTPUT FORMAT — return ONLY a valid JSON array (no markdown, no explanation, no preamble):
Each element represents ONE requirement:
{
  "idx": <0-based index from input>,
  "mappings": [
    { "granularTheme": "<exact plain name>", "subTheme": "<Level-2 parent>", "mainTheme": "<Level-1 parent>", "confidence": <0-100> },
    ...
  ]
}

CRITICAL OUTPUT RULES:
- "granularTheme" must be the PLAIN NAME only — no numbers, no prefixes (e.g. "IT Governance Framework" NOT "9.1.1. IT Governance Framework")
- Include ALL genuinely relevant granular themes per requirement — do not stop at the first match
- Minimum confidence threshold: 55 — exclude mappings below this
- If truly no theme fits, use mappings: []`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}

Requirements to map (0-indexed):
${JSON.stringify(
  requirements.map((r, i) => ({ idx: i, requirement: r.requirement, topic: r.topic, subTopic: r.subTopic })),
  null, 1
)}

Apply the reasoning process (5 dimensions) for each requirement. Return JSON array only.`,
    },
  ], 4000);

  const parsed = robustParseJSON(raw);
  if (!Array.isArray(parsed)) return [];

  // FIX 5: Normalise all output theme names (strip any numeric prefixes the model may still include)
  return parsed.map(item => {
    // Handle legacy single-theme format
    if (!item.mappings && item.granularTheme) {
      return {
        idx: item.idx ?? 0,
        mappings: [{
          granularTheme: normaliseThemeName(item.granularTheme),
          subTheme: normaliseThemeName(item.subTheme || ""),
          mainTheme: normaliseThemeName(item.mainTheme || ""),
          confidence: item.confidence || 75
        }]
      };
    }
    if (!item.mappings || !Array.isArray(item.mappings)) {
      return { idx: item.idx ?? 0, mappings: [] };
    }
    return {
      idx: item.idx ?? 0,
      mappings: item.mappings
        .filter(m => m && m.granularTheme)
        .map(m => ({
          granularTheme: normaliseThemeName(m.granularTheme),
          subTheme: normaliseThemeName(m.subTheme || ""),
          mainTheme: normaliseThemeName(m.mainTheme || ""),
          confidence: m.confidence || 75
        }))
    };
  });
}

// ─── Step 3: Post-processing validator (FIX 3 — reviewer pass) ───────────────
// Lightweight second call that reviews the mappings for a single requirement,
// catches obviously wrong themes and surfaces obvious misses.
async function validateMappings(apiKey, endpoint, apiVersion, requirement, proposedMappings, themes, frameworkName) {
  const proposedNames = proposedMappings.map(m => m.granularTheme).join(", ");
  const cleanThemes = themes.map(t => normaliseThemeName(t)).filter(Boolean);

  const raw = await callAzure(endpoint, apiKey, apiVersion, [
    {
      role: "system",
      content: `You are a senior cybersecurity compliance reviewer. You will review a proposed theme mapping and correct it.

Available granular themes (plain names only):
${cleanThemes.slice(0, 200).join(", ")}

Your task:
1. Remove any proposed themes that are clearly incorrect or too generic for this specific requirement
2. Add any obviously missing themes from the available list that clearly apply
3. Return the corrected final list

STRICT RULES (same as original mapping):
- "Communication": only for explicit notification/reporting channels
- "IT Governance Framework": only for governance structures/accountability
- "Asset Discovery": only for active asset scanning processes
- "Continual Process Improvement": only when improvement cycles are explicitly mentioned
- "Training and Awareness": only when training/education is explicitly mentioned
- "IT Risk Management Framework": only for the framework methodology itself

Return ONLY a JSON object: { "finalMappings": ["Theme Name 1", "Theme Name 2", ...] }
Use exact plain theme names. No numeric prefixes. No markdown.`,
    },
    {
      role: "user",
      content: `Framework: ${frameworkName}
Requirement: "${requirement}"
Proposed themes: [${proposedNames}]

Review and return corrected finalMappings JSON only.`,
    },
  ], 1000);

  try {
    const parsed = robustParseJSON(raw);
    if (parsed && Array.isArray(parsed.finalMappings)) {
      return parsed.finalMappings.map(t => normaliseThemeName(t)).filter(Boolean);
    }
  } catch {}
  return null; // null = keep original if validator fails
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

function FrameworkTableBlock({ framework, rows }) {
  const [open, setOpen] = useState(true);
  const totalMappings = rows.reduce((sum, r) => sum + (r.themeMappings?.length || 0), 0);
  return (
    <div className="framework-block">
      <div className="framework-header" onClick={() => setOpen(o => !o)}>
        <span className="framework-name">{framework}</span>
        <span className="framework-badge">{rows.length} requirements</span>
        <span className="framework-badge" style={{ color: "var(--green)", borderColor: "rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.05)" }}>
          {totalMappings} theme mappings
        </span>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div style={{ overflowX: "auto" }}>
          <table className="req-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Section ID</th>
                <th style={{ width: 120 }}>Topic</th>
                <th style={{ width: 120 }}>Sub-Topic</th>
                <th style={{ minWidth: 260 }}>Requirement</th>
                <th style={{ minWidth: 340 }}>Theme Mappings (Granular → Sub → Main)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const mappings = row.themeMappings || [];
                return (
                  <tr key={idx}>
                    <td><span className="cell-id">{row.sectionId || "—"}</span></td>
                    <td><span className="cell-mono">{row.topic || "—"}</span></td>
                    <td><span className="cell-mono" style={{ color: "var(--text3)" }}>{row.subTopic || "—"}</span></td>
                    <td><span className="cell-req">{row.requirement}</span></td>
                    <td>
                      {mappings.length === 0 ? (
                        <span className="no-mappings">No theme matched</span>
                      ) : (
                        <div className="theme-mapping-cell">
                          {mappings.map((tm, ti) => {
                            const conf = tm.confidence || 0;
                            const confCls = conf >= 80 ? "conf-high" : conf >= 60 ? "conf-mid" : "conf-low";
                            return (
                              <div key={ti} className="theme-mapping-entry">
                                <div className="tme-label">
                                  <span style={{ color: "var(--green)" }}>Granular</span>
                                  <span className="tme-label-sep">→</span>
                                  <span style={{ color: "var(--cyan2)" }}>Sub</span>
                                  <span className="tme-label-sep">→</span>
                                  <span style={{ color: "var(--purple)" }}>Main</span>
                                </div>
                                <span className="tme-granular">{tm.granularTheme || "—"}</span>
                                <span className="tme-sub">↳ {tm.subTheme || "—"}</span>
                                <span className="tme-main">↳ {tm.mainTheme || "—"}</span>
                                <div className="tme-footer">
                                  <span className="tme-idx">#{ti + 1}</span>
                                  <span className={`conf-pill ${confCls}`}>{conf}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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

        // Map to themes in batches of 10 (smaller = better focus per call with enriched prompt)
        const BATCH = 10;
        const batches = Math.ceil(allReqs.length / BATCH);
        const mappedData = [];

        for (let bi = 0; bi < batches; bi++) {
          const batch = allReqs.slice(bi * BATCH, (bi + 1) * BATCH);
          const pct = Math.round(((fi + 0.55 + (bi + 1) / batches * 0.30) / totalFiles) * 100);
          setProgress(pct);
          setProgressLabel(`[${frameworkName}] Mapping themes — batch ${bi + 1}/${batches}`);
          addLog(`  Mapping batch ${bi + 1}/${batches} (${batch.length} reqs)...`);

          try {
            const mappedBatch = await mapRequirementsToThemes(apiKey, azureEndpoint, apiVersion, batch, themes, themeTree, frameworkName);
            const totalMappings = mappedBatch.reduce((sum, m) => sum + (m.mappings?.length || 0), 0);
            addLog(`    ✓ ${mappedBatch.length} reqs → ${totalMappings} theme mappings`, mappedBatch.length > 0 ? "success" : "warn");

            // ── Validator pass: review each requirement's mappings ────────────
            // Runs a lightweight second AI call per requirement to catch false
            // positives and obvious missed themes.
            for (let mi = 0; mi < mappedBatch.length; mi++) {
              const m = mappedBatch[mi];
              const originalIdx = m.idx ?? 0;
              const original = batch[originalIdx] || batch[0];
              if (!original || !Array.isArray(m.mappings) || m.mappings.length === 0) continue;

              const validatorPct = Math.round(((fi + 0.55 + (bi + 1) / batches * 0.30 + (mi + 1) / mappedBatch.length * 0.05) / totalFiles) * 100);
              setProgress(Math.min(validatorPct, 99));
              setProgressLabel(`[${frameworkName}] Validating — batch ${bi + 1}, req ${mi + 1}/${mappedBatch.length}`);

              try {
                const validatedNames = await validateMappings(
                  apiKey, azureEndpoint, apiVersion,
                  original.requirement,
                  m.mappings,
                  themes,
                  frameworkName
                );

                if (validatedNames && validatedNames.length > 0) {
                  // Rebuild mappings: keep original confidence for retained themes,
                  // assign 75 for newly added ones, look up sub/main from themeTree
                  const existingByName = Object.fromEntries(
                    m.mappings.map(x => [x.granularTheme.toLowerCase(), x])
                  );
                  m.mappings = validatedNames.map(name => {
                    const existing = existingByName[name.toLowerCase()];
                    if (existing) return existing;
                    // New theme added by validator — look up hierarchy
                    let subTheme = "", mainTheme = "";
                    for (const mn of themeTree) {
                      for (const sn of mn.subs || []) {
                        for (const gn of sn.granular || []) {
                          if (normaliseThemeName(gn).toLowerCase() === name.toLowerCase()) {
                            subTheme = normaliseThemeName(sn.sub);
                            mainTheme = normaliseThemeName(mn.main);
                          }
                        }
                      }
                    }
                    return { granularTheme: name, subTheme, mainTheme, confidence: 75 };
                  });
                  const delta = validatedNames.length - (Object.keys(existingByName).length);
                  if (delta !== 0) addLog(`      Validator adjusted req ${originalIdx}: ${delta > 0 ? "+" : ""}${delta} themes`, "info");
                }
              } catch (ve) {
                addLog(`      Validator skipped req ${originalIdx}: ${ve.message}`, "info");
              }

              await new Promise(r => setTimeout(r, 400));
            }

            // Store each requirement with its validated theme mappings
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
                  themeMappings: Array.isArray(m.mappings) && m.mappings.length > 0
                    ? m.mappings
                    : [{ granularTheme: "Unmapped", subTheme: "", mainTheme: "Uncategorized", confidence: 0 }],
                });
              }
            });
          } catch (e) { addLog(`    ERROR batch ${bi + 1}: ${e.message}`, "warn"); }

          if (bi < batches - 1) await new Promise(r => setTimeout(r, 800));
        }

        const totalThemeMappings = mappedData.reduce((sum, r) => sum + (r.themeMappings?.length || 0), 0);
        addLog(`  ✓ Done: ${mappedData.length} requirements, ${totalThemeMappings} theme mappings for "${frameworkName}"`, "success");
        allMapped.push(...mappedData);
      }

      setProgress(100); setProgressLabel("Complete ✓");
      const totalTM = allMapped.reduce((sum, r) => sum + (r.themeMappings?.length || 0), 0);
      addLog(`Processing complete — ${allMapped.length} requirements · ${totalTM} total theme mappings`, "accent");
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
    // Expand: one CSV row per requirement × theme mapping
    const rows = [];
    results.forEach(r => {
      (r.themeMappings || []).forEach(tm => {
        rows.push(
          [r.framework, r.sectionId, r.topic, r.subTopic, r.requirement,
           tm.granularTheme, tm.subTheme, tm.mainTheme, tm.confidence]
            .map(v => `"${String(v || "").replace(/"/g, '""')}"`)
            .join(",")
        );
      });
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "framework-mapping.csv"; a.click();
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

  // Total theme-mapping rows (for stats)
  const totalMappingCount = filteredResults.reduce((sum, r) => sum + (r.themeMappings?.length || 0), 0);

  // By framework (for document view) — results keep their multi-mapping structure
  const byFramework = {};
  filteredResults.forEach(r => {
    if (!byFramework[r.framework]) byFramework[r.framework] = [];
    byFramework[r.framework].push(r);
  });

  // By main > sub > granular (for theme view) — expand each requirement across all its mappings
  // FIX 5: normalise all theme names at grouping time to prevent duplicate groups from prefix variants
  const byMain = {};
  filteredResults.forEach(r => {
    (r.themeMappings || []).forEach(tm => {
      const main = normaliseThemeName(tm.mainTheme) || "Uncategorized";
      const sub = normaliseThemeName(tm.subTheme) || "General";
      const granular = normaliseThemeName(tm.granularTheme) || "Uncategorized";
      if (!byMain[main]) byMain[main] = {};
      if (!byMain[main][sub]) byMain[main][sub] = {};
      if (!byMain[main][sub][granular]) byMain[main][sub][granular] = [];
      byMain[main][sub][granular].push({ ...r, confidence: tm.confidence });
    });
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
                      ⚠ Large documents (100+ pages) generate many API calls and may take several minutes. Each document is chunked into ~5000-char segments for extraction, then requirements are mapped in batches of 10 with a validator pass per requirement.
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
                      <div className="stat-val">{filteredResults.length}</div>
                      <div className="stat-label">Requirements</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{totalMappingCount}</div>
                      <div className="stat-label">Theme Mappings</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{allFrameworks.length}</div>
                      <div className="stat-label">Frameworks</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(filteredResults.flatMap(r => (r.themeMappings||[]).map(tm => normaliseThemeName(tm.mainTheme))).filter(Boolean))].length}</div>
                      <div className="stat-label">Main Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(filteredResults.flatMap(r => (r.themeMappings||[]).map(tm => normaliseThemeName(tm.subTheme))).filter(Boolean))].length}</div>
                      <div className="stat-label">Sub Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">{[...new Set(filteredResults.flatMap(r => (r.themeMappings||[]).map(tm => normaliseThemeName(tm.granularTheme))).filter(Boolean))].length}</div>
                      <div className="stat-label">Granular Themes</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-val">
                        {totalMappingCount > 0
                          ? Math.round(filteredResults.flatMap(r => (r.themeMappings||[]).map(tm => tm.confidence || 0)).reduce((a, b) => a + b, 0) / totalMappingCount)
                          : 0}%
                      </div>
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
                        <strong>Columns:</strong> Section ID · Topic · Sub-Topic · Requirement (extracted from document) → Theme Mappings (each requirement may map to multiple granular themes; each mapping shows Granular → Sub → Main theme with confidence score)
                      </div>
                      {Object.keys(byFramework).length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">◈</div><div>No results to display</div></div>
                      ) : (
                        Object.entries(byFramework).sort((a, b) => a[0].localeCompare(b[0])).map(([fw, rows]) => (
                          <FrameworkTableBlock key={fw} framework={fw} rows={rows} />
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
