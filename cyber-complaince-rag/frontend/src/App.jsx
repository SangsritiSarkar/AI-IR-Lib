import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://localhost:8000";

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0c14",
  card: "#111320",
  border: "#1e2235",
  purple: "#7c3aed",
  pink: "#db2777",
  teal: "#0d9488",
  amber: "#d97706",
  text: "#e2e8f0",
  muted: "#4b5563",
  green: "#059669",
};

// ─── Small reusable components ────────────────────────────────────────────────
function Badge({ children, color = C.purple }) {
  return (
    <span style={{
      background: color + "22", color, padding: "3px 10px",
      borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      padding: 24, ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", style = {} }) {
  const base = {
    padding: "11px 22px", borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14, fontWeight: 700, transition: "all 0.2s", ...style,
  };
  const themes = {
    primary: { background: disabled ? C.card : `linear-gradient(135deg, ${C.purple}, ${C.pink})`, color: disabled ? C.muted : "#fff" },
    teal:    { background: `linear-gradient(135deg, ${C.teal}, #0ea5e9)`, color: "#fff" },
    ghost:   { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...themes[variant] }}>{children}</button>;
}

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%", background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14,
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 18, height: 18,
      border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }} />
  );
}

function StatusDot({ active }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: active ? C.green : C.muted,
      boxShadow: active ? `0 0 6px ${C.green}` : "none",
    }} />
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "config",   label: "⚙️ Setup" },
  { id: "query",    label: "🔍 Query" },
  { id: "results",  label: "📊 Results" },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("config");
  const [status, setStatus] = useState({ indexed: false, record_count: 0, framework_count: 0 });

  // Azure config
  const [cfg, setCfg] = useState({
    api_key: "", endpoint: "", deployment_name: "",
    api_version: "2024-02-01", embedding_deployment: "text-embedding-ada-002",
  });
  const [configured, setConfigured] = useState(false);

  // File uploads
  const fwRef = useRef();
  const themeRef = useRef();
  const [fwFile, setFwFile] = useState(null);
  const [themeFile, setThemeFile] = useState(null);
  const [uploading, setUploading] = useState({ fw: false, theme: false });

  // Query
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [filterFw, setFilterFw] = useState("All");

  // Errors / toasts
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Poll health
  useEffect(() => {
    const poll = async () => {
      try {
        const s = await apiFetch("/health");
        setStatus(s);
        if (s.indexed) setConfigured(true);
      } catch { /* server not started yet */ }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Configure Azure ────────────────────────────────────────────────────────
  const handleConfigure = async () => {
    setError("");
    try {
      await apiFetch("/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setConfigured(true);
      showToast("✅ Azure OpenAI configured!");
    } catch (e) { setError(e.message); }
  };

  // ── Upload frameworks ──────────────────────────────────────────────────────
  const handleFwUpload = async (file) => {
    setFwFile(file);
    setUploading((p) => ({ ...p, fw: true }));
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiFetch("/upload/frameworks", { method: "POST", body: form });
      const s = await apiFetch("/health");
      setStatus(s);
      showToast(`✅ Indexed ${res.records_indexed} records from ${res.frameworks.length} frameworks`);
    } catch (e) { setError(e.message); }
    finally { setUploading((p) => ({ ...p, fw: false })); }
  };

  const handleThemeUpload = async (file) => {
    setThemeFile(file);
    setUploading((p) => ({ ...p, theme: true }));
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiFetch("/upload/themes", { method: "POST", body: form });
      showToast(`✅ Indexed ${res.themes_indexed} theme records`);
    } catch (e) { setError(e.message); }
    finally { setUploading((p) => ({ ...p, theme: false })); }
  };

  // ── Query ──────────────────────────────────────────────────────────────────
  const handleQuery = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await apiFetch("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 80 }),
      });
      setResults(res);
      setFilterFw("All");
      setTab("results");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [query]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!results) return;
    try {
      const res = await fetch(`${API}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: results.results,
          query: results.query,
          analysis: results.analysis,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CyberCompliance_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("✅ Excel exported!");
    } catch (e) { setError(e.message); }
  };

  const displayResults = results
    ? filterFw === "All" ? results.results : results.results.filter((r) => r.framework === filterFw)
    : [];

  const allFrameworkTabs = results ? ["All", ...results.frameworks] : [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, background: "#064e3b",
          border: `1px solid ${C.teal}`, borderRadius: 10, padding: "12px 20px",
          fontSize: 13, fontWeight: 600, zIndex: 999, animation: "fadeIn 0.3s",
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, #111320 0%, #0a0c14 100%)`,
        borderBottom: `1px solid ${C.border}`, padding: "16px 36px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `linear-gradient(135deg, ${C.purple}, ${C.pink})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🛡</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
            CyberCompliance Intelligence
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
            ChromaDB · Azure OpenAI · RAG Pipeline
          </p>
        </div>

        {/* Status pills */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, borderRadius: 20, padding: "6px 14px", border: `1px solid ${C.border}`, fontSize: 12 }}>
            <StatusDot active={configured} /> Azure OpenAI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, borderRadius: 20, padding: "6px 14px", border: `1px solid ${C.border}`, fontSize: 12 }}>
            <StatusDot active={status.indexed} />
            {status.indexed ? `${status.record_count.toLocaleString()} records indexed` : "No data indexed"}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginLeft: 20 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                background: tab === t.id ? `linear-gradient(135deg, ${C.purple}, ${C.pink})` : "transparent",
                color: tab === t.id ? "#fff" : C.muted,
              }}>
              {t.label}{t.id === "results" && results ? ` (${results.total})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 36px" }}>

        {/* Error banner */}
        {error && (
          <div style={{
            background: "#1c0909", border: `1px solid #7f1d1d`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 13,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            ⚠️ {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {tab === "config" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            <Card>
              <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                <Badge color={C.purple}>AZURE</Badge> OpenAI Configuration
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { key: "endpoint", label: "Endpoint URL", placeholder: "https://your-resource.openai.azure.com", full: true },
                  { key: "api_key", label: "API Key", placeholder: "Your Azure API key", type: "password", full: true },
                  { key: "deployment_name", label: "Chat Deployment", placeholder: "gpt-4o" },
                  { key: "embedding_deployment", label: "Embedding Deployment", placeholder: "text-embedding-ada-002" },
                  { key: "api_version", label: "API Version", placeholder: "2024-02-01" },
                ].map(({ key, label, placeholder, type, full }) => (
                  <div key={key} style={full ? { gridColumn: "1 / -1" } : {}}>
                    <Label>{label}</Label>
                    <Input
                      type={type || "text"}
                      value={cfg[key]}
                      placeholder={placeholder}
                      onChange={(e) => setCfg((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <Btn onClick={handleConfigure}
                disabled={!cfg.api_key || !cfg.endpoint || !cfg.deployment_name}
                style={{ marginTop: 20, width: "100%" }}>
                {configured ? "✅ Reconfigure Azure OpenAI" : "Connect to Azure OpenAI →"}
              </Btn>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Framework upload */}
              {[
                {
                  key: "fw", label: "Frameworks Workbook", icon: "📋",
                  desc: "Multi-sheet Excel — each sheet is a framework (NIST CSF, PCI DSS, ISO 27001…)",
                  ref: fwRef, file: fwFile, loading: uploading.fw,
                  onUpload: handleFwUpload, accept: ".xlsx,.xls",
                  stat: status.indexed ? `${status.record_count.toLocaleString()} records · ${status.framework_count} frameworks in ChromaDB` : null,
                },
                {
                  key: "theme", label: "Theme Hierarchy Workbook", icon: "🏷️",
                  desc: "Excel with Main Theme → Sub Theme → Granular Theme columns",
                  ref: themeRef, file: themeFile, loading: uploading.theme,
                  onUpload: handleThemeUpload, accept: ".xlsx,.xls",
                  stat: null,
                },
              ].map(({ key, label, icon, desc, ref, file, loading: upl, onUpload, accept, stat }) => (
                <Card key={key}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>{icon} {label}</h3>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: C.muted }}>{desc}</p>
                  <input type="file" accept={accept} ref={ref} onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} style={{ display: "none" }} />
                  <button onClick={() => ref.current.click()} disabled={!configured || upl}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10, cursor: configured && !upl ? "pointer" : "not-allowed",
                      border: `2px dashed ${file ? C.teal : C.border}`, background: "transparent",
                      color: file ? C.teal : C.muted, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                    {upl ? <><Spinner /> Embedding & indexing…</> : file ? `✅ ${file.name}` : "Click to upload .xlsx file"}
                  </button>
                  {stat && <p style={{ margin: "8px 0 0", fontSize: 11, color: C.teal }}>✓ {stat}</p>}
                </Card>
              ))}

              <Btn onClick={() => setTab("query")} disabled={!status.indexed} style={{ width: "100%" }}>
                {status.indexed ? "Proceed to Query →" : "Index framework data first"}
              </Btn>
            </div>
          </div>
        )}

        {/* ── QUERY TAB ── */}
        {tab === "query" && (
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <Card>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>🔍 Query Compliance Landscape</h2>
              <p style={{ margin: "0 0 24px", color: C.muted, fontSize: 14 }}>Describe your client's industry, geography, or risk scenario in plain language.</p>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={5}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") handleQuery(); }}
                placeholder={"Examples:\n• My client is in the gaming industry with EU users — which regulations apply?\n• Healthcare SaaS startup handling patient data in the US\n• Fintech startup processing payments globally\n• Automotive manufacturer with connected OT/IT systems"}
                style={{
                  width: "100%", background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "16px 18px", color: C.text, fontSize: 14,
                  resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.7,
                }}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Quick fill:</span>
                {[
                  "Gaming industry, EU users, handling payments",
                  "Healthcare SaaS, US patient data",
                  "Fintech payment processing globally",
                  "Cloud B2B SaaS, ISO compliance",
                  "Automotive manufacturer, OT/IT systems",
                ].map((s) => (
                  <button key={s} onClick={() => setQuery(s)}
                    style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12, transition: "all 0.15s" }}>
                    {s}
                  </button>
                ))}
              </div>

              <p style={{ margin: "10px 0 0", fontSize: 11, color: C.muted }}>Tip: Press Ctrl+Enter to submit</p>

              <Btn onClick={handleQuery} disabled={loading || !query.trim() || !status.indexed}
                style={{ marginTop: 20, width: "100%", padding: "15px 24px", fontSize: 15 }}>
                {loading ? <><Spinner style={{ marginRight: 10 }} /> Embedding query · Querying ChromaDB · GPT ranking…</> : "Analyze Compliance Requirements →"}
              </Btn>
            </Card>

            {status.indexed && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
                {[
                  { icon: "📋", label: "Records in ChromaDB", value: status.record_count.toLocaleString() },
                  { icon: "🗂️", label: "Frameworks Indexed", value: status.framework_count },
                  { icon: "⚡", label: "Retrieval Method", value: "Cosine Similarity" },
                ].map(({ icon, label, value }) => (
                  <Card key={label} style={{ textAlign: "center", padding: "18px 16px" }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.purple }}>{value}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{label}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS TAB ── */}
        {tab === "results" && results && (
          <div>
            {/* AI Analysis */}
            <div style={{
              background: `linear-gradient(135deg, #1a0a3a, #0a1020)`,
              borderRadius: 16, border: `1px solid ${C.purple}44`,
              padding: "20px 24px", marginBottom: 22,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    🤖 AI Compliance Analysis
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: C.text }}>{results.analysis}</p>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Frameworks Matched</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {results.frameworks.map((fw) => <Badge key={fw} color={C.purple}>{fw}</Badge>)}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 6 }}>Top Themes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {results.themes.slice(0, 4).map((t) => <Badge key={t} color={C.teal}>{t}</Badge>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter bar + export */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
                {allFrameworkTabs.map((fw) => {
                  const cnt = fw === "All" ? results.results.length : results.results.filter((r) => r.framework === fw).length;
                  return (
                    <button key={fw} onClick={() => setFilterFw(fw)}
                      style={{
                        padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                        background: filterFw === fw ? `linear-gradient(135deg, ${C.purple}, ${C.pink})` : C.card,
                        color: filterFw === fw ? "#fff" : C.muted,
                      }}>
                      {fw} ({cnt})
                    </button>
                  );
                })}
              </div>
              <Btn variant="teal" onClick={handleExport} style={{ whiteSpace: "nowrap" }}>
                ⬇️ Export Excel
              </Btn>
            </div>

            {/* Table */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#0d0f1e" }}>
                      {["Rank", "Score", "Framework", "Topic", "Sub Topic", "Section", "Requirements", "Theme", "Similarity"].map((h) => (
                        <th key={h} style={{
                          padding: "11px 14px", textAlign: "left", color: C.muted,
                          fontWeight: 700, fontSize: 11, textTransform: "uppercase",
                          letterSpacing: "0.5px", borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayResults.map((row, i) => (
                      <tr key={i}
                        style={{ borderBottom: `1px solid ${C.border}22`, cursor: "default" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#15182a"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 14px", color: C.muted, textAlign: "center" }}>{row.rank}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{
                            fontWeight: 800, fontSize: 13,
                            color: row.relevance_score >= 8 ? C.green : row.relevance_score >= 5 ? C.amber : "#ef4444",
                          }}>{row.relevance_score}</span>
                        </td>
                        <td style={{ padding: "11px 14px" }}><Badge color={C.purple}>{row.framework}</Badge></td>
                        <td style={{ padding: "11px 14px", color: C.text }}>{row.topic}</td>
                        <td style={{ padding: "11px 14px", color: C.muted }}>{row.sub_topic}</td>
                        <td style={{ padding: "11px 14px" }}><Badge color={C.teal}>{row.section_number}</Badge></td>
                        <td style={{ padding: "11px 14px", maxWidth: 400, lineHeight: 1.5, color: C.text }}>{row.requirements}</td>
                        <td style={{ padding: "11px 14px" }}><Badge color={C.pink}>{row.theme}</Badge></td>
                        <td style={{ padding: "11px 14px", color: C.muted, textAlign: "center" }}>{(row.similarity * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p style={{ marginTop: 10, fontSize: 12, color: C.muted, textAlign: "right" }}>
              Showing {displayResults.length} of {results.total} matched requirements · ChromaDB cosine similarity
            </p>
          </div>
        )}

        {tab === "results" && !results && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: C.muted }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No results yet — run a query first</p>
            <Btn onClick={() => setTab("query")} style={{ marginTop: 12 }}>Go to Query</Btn>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: #374151; }
        input:focus, textarea:focus { border-color: ${C.purple} !important; box-shadow: 0 0 0 3px ${C.purple}20; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
