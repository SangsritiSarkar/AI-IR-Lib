import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";

// ─── Utility: parse Excel workbook into structured data ───────────────────────
function parseFrameworkWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const allData = [];
        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
          rows.forEach((row) => {
            // Normalize column names (case-insensitive key matching)
            const norm = {};
            Object.entries(row).forEach(([k, v]) => {
              norm[k.toLowerCase().replace(/[\s_]/g, "")] = v;
            });
            const entry = {
              framework: sheetName,
              sourceName: norm["sourcename"] || norm["source"] || sheetName,
              topic: norm["topic"] || "",
              subTopic: norm["subtopic"] || norm["sub-topic"] || norm["subtopic"] || "",
              sectionNumber: norm["sectionnumber"] || norm["section"] || "",
              requirements: norm["requirements"] || norm["requirement"] || "",
              theme: norm["theme"] || norm["granulartheme"] || "",
            };
            if (entry.requirements) allData.push(entry);
          });
        });
        resolve(allData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseThemeWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const themes = [];
        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
          rows.forEach((row) => {
            const norm = {};
            Object.entries(row).forEach(([k, v]) => {
              norm[k.toLowerCase().replace(/[\s_\-\.]/g, "")] = v;
            });
            const entry = {
              mainTheme: norm["maintheme"] || norm["main"] || "",
              subTheme: norm["subtheme"] || norm["sub"] || "",
              granularTheme: norm["granulartheme"] || norm["granular"] || "",
            };
            if (entry.mainTheme || entry.granularTheme) themes.push(entry);
          });
        });
        resolve(themes);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Export results to Excel ──────────────────────────────────────────────────
function exportToExcel(results, queryText) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["Unified Risk and Control Framework - Query Results"],
    ["Query:", queryText],
    ["Generated:", new Date().toLocaleString()],
    ["Total Results:", results.length],
    [],
    ["#", "Framework", "Topic", "Sub Topic", "Section Number", "Requirements", "Theme"],
  ];
  results.forEach((r, i) => {
    summaryData.push([
      i + 1,
      r.framework,
      r.topic,
      r.subTopic,
      r.sectionNumber,
      r.requirements,
      r.theme,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws["!cols"] = [
    { wch: 4 }, { wch: 16 }, { wch: 20 }, { wch: 25 },
    { wch: 18 }, { wch: 60 }, { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Results");

  // Per-framework sheets
  const byFramework = {};
  results.forEach((r) => {
    if (!byFramework[r.framework]) byFramework[r.framework] = [];
    byFramework[r.framework].push(r);
  });
  Object.entries(byFramework).forEach(([fw, rows]) => {
    const sheetData = [
      ["Framework", "Topic", "Sub Topic", "Section", "Requirements", "Theme"],
      ...rows.map((r) => [r.framework, r.topic, r.subTopic, r.sectionNumber, r.requirements, r.theme]),
    ];
    const fwSheet = XLSX.utils.aoa_to_sheet(sheetData);
    fwSheet["!cols"] = [{ wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 55 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, fwSheet, fw.slice(0, 31));
  });

  XLSX.writeFile(wb, `CyberFramework_Results_${Date.now()}.xlsx`);
}

// ─── Azure OpenAI RAG call ────────────────────────────────────────────────────
async function queryAzureOpenAI({ apiKey, endpoint, deploymentName, apiVersion }, systemPrompt, userMessage) {
  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function CyberFrameworkApp() {
  const [azureConfig, setAzureConfig] = useState({
    apiKey: "",
    endpoint: "",
    deploymentName: "",
    apiVersion: "2024-02-01",
  });

  const [frameworkData, setFrameworkData] = useState(null);
  const [themeData, setThemeData] = useState(null);
  const [frameworkFileName, setFrameworkFileName] = useState("");
  const [themeFileName, setThemeFileName] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [filterFramework, setFilterFramework] = useState("All");

  const frameworkInputRef = useRef();
  const themeInputRef = useRef();

  const handleFrameworkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseFrameworkWorkbook(file);
      setFrameworkData(data);
      setFrameworkFileName(file.name);
      setError("");
    } catch (err) {
      setError("Failed to parse framework workbook: " + err.message);
    }
  };

  const handleThemeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseThemeWorkbook(file);
      setThemeData(data);
      setThemeFileName(file.name);
      setError("");
    } catch (err) {
      setError("Failed to parse theme workbook: " + err.message);
    }
  };

  const handleQuery = useCallback(async () => {
    if (!query.trim()) return;
    if (!frameworkData) { setError("Please upload the frameworks workbook first."); return; }
    if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
      setError("Please fill in all Azure OpenAI configuration fields."); return;
    }

    setIsLoading(true);
    setError("");
    setResults(null);
    setAiAnalysis("");

    try {
      // Build context from frameworks (sample ~200 rows to fit token limits)
      const sample = frameworkData.slice(0, 200);
      const frameworkContext = sample.map((r, i) =>
        `[${i}] Framework:${r.framework} | Topic:${r.topic} | SubTopic:${r.subTopic} | Section:${r.sectionNumber} | Theme:${r.theme} | Req:${r.requirements.slice(0, 150)}`
      ).join("\n");

      const themeContext = themeData
        ? themeData.slice(0, 100).map((t) => `${t.mainTheme} > ${t.subTheme} > ${t.granularTheme}`).join("\n")
        : "No theme data loaded.";

      const systemPrompt = `You are a cybersecurity compliance expert. You have access to a database of cybersecurity frameworks and regulations.

THEME STRUCTURE:
${themeContext}

FRAMEWORK DATA (sample):
${frameworkContext}

Your job:
1. Analyze the user's query about their industry/use case.
2. Identify which frameworks/regulations are most relevant.
3. Return a JSON object with this exact structure:
{
  "relevantFrameworks": ["PCI DSS v4.01", "NIST CSF 2.0"],
  "reasoning": "Brief explanation of why these frameworks apply",
  "relevantThemes": ["Information Security Management System (ISMS)", "IT Governance Framework"],
  "industryRisks": ["data breaches", "payment fraud"],
  "priorityLevel": "High/Medium/Low"
}
Only return valid JSON, nothing else.`;

      const aiResponse = await queryAzureOpenAI(azureConfig, systemPrompt, query);

      let parsed;
      try {
        const clean = aiResponse.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = { relevantFrameworks: [], relevantThemes: [], reasoning: aiResponse };
      }

      // Filter framework data based on AI suggestions
      const relevantFrameworks = parsed.relevantFrameworks || [];
      const relevantThemes = parsed.relevantThemes || [];

      let filtered = frameworkData.filter((row) => {
        const fwMatch = relevantFrameworks.length === 0 ||
          relevantFrameworks.some((fw) => row.framework.toLowerCase().includes(fw.toLowerCase()) || fw.toLowerCase().includes(row.framework.toLowerCase()));
        const themeMatch = relevantThemes.length === 0 ||
          relevantThemes.some((t) => row.theme.toLowerCase().includes(t.toLowerCase()));
        return fwMatch || themeMatch;
      });

      // If still too broad, limit to 200
      if (filtered.length > 200) filtered = filtered.slice(0, 200);
      if (filtered.length === 0) filtered = frameworkData.slice(0, 50);

      // Generate readable analysis
      const analysisPrompt = `Based on the query: "${query}"
      
Relevant frameworks: ${relevantFrameworks.join(", ")}
Key themes: ${relevantThemes.join(", ")}
Industry risks: ${(parsed.industryRisks || []).join(", ")}

Write a concise 3-4 sentence analysis explaining: which frameworks this industry must comply with, why they apply, and the top 3 compliance priorities. Be specific and actionable.`;

      const analysis = await queryAzureOpenAI(azureConfig,
        "You are a cybersecurity compliance advisor. Be concise and professional.",
        analysisPrompt
      );

      setResults(filtered);
      setAiAnalysis(analysis);
      setActiveTab("results");
    } catch (err) {
      setError("Query failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [query, frameworkData, themeData, azureConfig]);

  const frameworks = results ? ["All", ...new Set(results.map((r) => r.framework))] : [];
  const displayResults = results
    ? filterFramework === "All" ? results : results.filter((r) => r.framework === filterFramework)
    : [];

  const DARK = "#0f1117";
  const CARD = "#1a1d2e";
  const BORDER = "#2a2d3e";
  const PURPLE = "#8b5cf6";
  const PINK = "#ec4899";
  const TEAL = "#14b8a6";
  const TEXT = "#e2e8f0";
  const MUTED = "#64748b";

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${CARD} 0%, #12152a 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛡</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>CyberCompliance Intelligence</h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>RAG-powered framework & regulation advisor · Azure OpenAI</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["config", "query", "results"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeTab === tab ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : "transparent",
                color: activeTab === tab ? "#fff" : MUTED, transition: "all 0.2s" }}>
              {tab === "config" ? "⚙️ Config" : tab === "query" ? "🔍 Query" : `📊 Results ${results ? `(${results.length})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 32px" }}>
        {error && (
          <div style={{ background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* CONFIG TAB */}
        {activeTab === "config" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Azure Config */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 24 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>AZURE</span>
                OpenAI Configuration
              </h2>
              {[
                { key: "endpoint", label: "Endpoint URL", placeholder: "https://your-resource.openai.azure.com" },
                { key: "apiKey", label: "API Key", placeholder: "••••••••••••••••••••••••••••••••", type: "password" },
                { key: "deploymentName", label: "Deployment Name", placeholder: "gpt-4o" },
                { key: "apiVersion", label: "API Version", placeholder: "2024-02-01" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                  <input type={type || "text"} value={azureConfig[key]} placeholder={placeholder}
                    onChange={(e) => setAzureConfig((p) => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", background: "#0f1117", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginTop: 8, padding: 12, background: "#0f1117", borderRadius: 8, fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
                💡 <strong style={{ color: TEXT }}>RAG Architecture:</strong><br />
                1. Excel data → structured records (in-browser)<br />
                2. Query → Azure OpenAI identifies relevant frameworks<br />
                3. Filter + rank results semantically<br />
                4. Export matched requirements to Excel
              </div>
            </div>

            {/* File Upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Frameworks Workbook", desc: "Multi-sheet Excel with framework requirements (NIST CSF, PCI DSS, ISO 27001, etc.)", ref: frameworkInputRef, onChange: handleFrameworkUpload, fileName: frameworkFileName, icon: "📋", count: frameworkData?.length },
                { label: "Theme List Workbook", desc: "Excel with Main Theme > Sub Theme > Granular Theme hierarchy", ref: themeInputRef, onChange: handleThemeUpload, fileName: themeFileName, icon: "🏷️", count: themeData?.length },
              ].map(({ label, desc, ref, onChange, fileName, icon, count }) => (
                <div key={label} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 24 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>{icon} {label}</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED }}>{desc}</p>
                  <input type="file" accept=".xlsx,.xls" ref={ref} onChange={onChange} style={{ display: "none" }} />
                  <button onClick={() => ref.current.click()}
                    style={{ width: "100%", padding: "12px 20px", borderRadius: 10, border: `2px dashed ${fileName ? TEAL : BORDER}`, background: "transparent", color: fileName ? TEAL : MUTED, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}>
                    {fileName ? `✅ ${fileName}` : "Click to upload Excel file"}
                  </button>
                  {count && <p style={{ margin: "8px 0 0", fontSize: 12, color: TEAL }}>✓ {count.toLocaleString()} records loaded</p>}
                </div>
              ))}

              <button onClick={() => setActiveTab("query")}
                disabled={!frameworkData || !azureConfig.apiKey}
                style={{ padding: "14px 24px", borderRadius: 12, border: "none", cursor: frameworkData && azureConfig.apiKey ? "pointer" : "not-allowed", fontSize: 15, fontWeight: 700,
                  background: frameworkData && azureConfig.apiKey ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : "#1a1d2e", color: frameworkData && azureConfig.apiKey ? "#fff" : MUTED, transition: "all 0.2s" }}>
                {frameworkData && azureConfig.apiKey ? "Proceed to Query →" : "Upload workbook & configure Azure first"}
              </button>
            </div>
          </div>
        )}

        {/* QUERY TAB */}
        {activeTab === "query" && (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>🔍 Query Your Compliance Landscape</h2>
              <p style={{ margin: "0 0 28px", color: MUTED, fontSize: 14 }}>Describe your organization, industry, or compliance question in natural language.</p>

              <textarea value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Examples:&#10;• My client is in the gaming industry — which regulations must they follow?&#10;• We process payment cards and store user data in the EU&#10;• Healthcare SaaS startup handling patient data in the US&#10;• Automotive manufacturer with OT/IT systems"
                rows={5}
                style={{ width: "100%", background: "#0f1117", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", color: TEXT, fontSize: 15, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />

              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                {["Gaming industry, EU users", "Healthcare SaaS, US", "Fintech payment processing", "Automotive OT/IT systems", "Cloud SaaS B2B"].map((s) => (
                  <button key={s} onClick={() => setQuery(s)}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
                    {s}
                  </button>
                ))}
              </div>

              <button onClick={handleQuery} disabled={isLoading || !query.trim()}
                style={{ marginTop: 24, width: "100%", padding: "16px 24px", borderRadius: 12, border: "none", cursor: isLoading || !query.trim() ? "not-allowed" : "pointer",
                  fontSize: 16, fontWeight: 700, background: isLoading || !query.trim() ? "#1a1d2e" : `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
                  color: isLoading || !query.trim() ? MUTED : "#fff", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {isLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Querying Azure OpenAI & analyzing frameworks…
                  </>
                ) : "Analyze Compliance Requirements →"}
              </button>
            </div>

            {frameworkData && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Framework Records", value: frameworkData.length.toLocaleString(), icon: "📋" },
                  { label: "Frameworks Loaded", value: new Set(frameworkData.map((r) => r.framework)).size, icon: "🗂️" },
                  { label: "Theme Records", value: themeData ? themeData.length.toLocaleString() : "Not loaded", icon: "🏷️" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: PURPLE }}>{value}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && results && (
          <div>
            {/* AI Analysis */}
            {aiAnalysis && (
              <div style={{ background: `linear-gradient(135deg, #1e1040, #12152a)`, borderRadius: 16, border: `1px solid ${PURPLE}40`, padding: 24, marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: PURPLE, display: "flex", alignItems: "center", gap: 8 }}>
                  🤖 AI Analysis
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: TEXT }}>{aiAnalysis}</p>
              </div>
            )}

            {/* Stats + Actions */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, flex: 1, flexWrap: "wrap" }}>
                {frameworks.map((fw) => (
                  <button key={fw} onClick={() => setFilterFramework(fw)}
                    style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: filterFramework === fw ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : CARD,
                      color: filterFramework === fw ? "#fff" : MUTED, transition: "all 0.2s" }}>
                    {fw} {fw !== "All" ? `(${results.filter((r) => r.framework === fw).length})` : `(${results.length})`}
                  </button>
                ))}
              </div>
              <button onClick={() => exportToExcel(results, query)}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
                  background: `linear-gradient(135deg, ${TEAL}, #0ea5e9)`, color: "#fff", whiteSpace: "nowrap" }}>
                ⬇️ Export to Excel
              </button>
            </div>

            {/* Results Table */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#12152a" }}>
                      {["#", "Framework", "Topic", "Sub Topic", "Section", "Requirements", "Theme"].map((h) => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: MUTED, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayResults.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}20`, transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e2235")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "12px 14px", color: MUTED }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: `${PURPLE}22`, color: PURPLE, padding: "3px 9px", borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{row.framework}</span>
                        </td>
                        <td style={{ padding: "12px 14px", color: TEXT }}>{row.topic}</td>
                        <td style={{ padding: "12px 14px", color: MUTED, fontSize: 12 }}>{row.subTopic}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: `${TEAL}22`, color: TEAL, padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{row.sectionNumber}</span>
                        </td>
                        <td style={{ padding: "12px 14px", maxWidth: 420, lineHeight: 1.5 }}>{row.requirements}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: `${PINK}22`, color: PINK, padding: "3px 9px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{row.theme}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p style={{ marginTop: 12, fontSize: 13, color: MUTED, textAlign: "right" }}>
              Showing {displayResults.length} of {results.length} matched requirements
            </p>
          </div>
        )}

        {activeTab === "results" && !results && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No results yet — run a query first</p>
            <button onClick={() => setActiveTab("query")}
              style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: PURPLE, color: "#fff", fontWeight: 600 }}>
              Go to Query
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #374151; }
        input:focus, textarea:focus { border-color: #8b5cf6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #2a2d3e; border-radius: 3px; }
      `}</style>
    </div>
  );
}
