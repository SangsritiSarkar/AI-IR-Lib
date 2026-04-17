import { useState, useCallback, useEffect, useRef } from "react";
import { callGPT }                from "../services/azureGPT";
import { tavilySearch, tavilySearchCyber } from "../services/tavilySearch";
import { fetchPage }              from "../services/fetchPage";
import { saveConfig, loadConfig } from "../utils/configStorage";

// ── Constants ─────────────────────────────────────────────────────────────────
const CURRENT_YEAR         = new Date().getFullYear();
const GPT_KNOWLEDGE_CUTOFF = 2023;


export const timeRangeLabel = (r) => {
  const map = {
    "3m": "last 3 months",
    "6m": "last 6 months",
    "1y": `${CURRENT_YEAR - 1}`,
    "2y": `${CURRENT_YEAR - 2}\u2013${CURRENT_YEAR}`,   // ← 2024–2026
    "3y": `${CURRENT_YEAR - 3}\u2013${CURRENT_YEAR}`,   // ← 2023–2026
    "5y": `${CURRENT_YEAR - 5}\u2013${CURRENT_YEAR}`,   // ← 2021–2026
  };
  return map[r] ?? `${CURRENT_YEAR - 1}`;
};

function getYearRange(timeRange) {
  const spans = { "3m": 0, "6m": 0, "1y": 1, "2y": 2, "3y": 3, "5y": 5 };
  const span  = spans[timeRange] ?? 1;
  if (span === 0) {
    const y = CURRENT_YEAR;
    return { startYear: y, endYear: y, years: [y],
      preGPTYears: y <= GPT_KNOWLEDGE_CUTOFF ? [y] : [],
      liveYears:   y >= 2024 ? [y] : [] };
  }
  if (span === 1) {
    // 1y = previous full year only (e.g. 2025)
    const y = CURRENT_YEAR - 1;
    return { startYear: y, endYear: y, years: [y],
      preGPTYears: y <= GPT_KNOWLEDGE_CUTOFF ? [y] : [],
      liveYears:   y >= 2024 ? [y] : [] };
  }
  // 2y/3y/5y → up to CURRENT_YEAR (2026) inclusive
  const startYear = CURRENT_YEAR - span;
  const endYear   = CURRENT_YEAR;        // ← FIXED
  const years     = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);
  return {
    startYear, endYear, years,
    preGPTYears: years.filter(y => y <= GPT_KNOWLEDGE_CUTOFF),
    liveYears:   years.filter(y => y >= 2024),
  };
}

function buildDateScope(startYear, endYear) {
  return startYear === endYear
    ? `the year ${startYear}`
    : `the years ${startYear} to ${endYear}`;
}

function normName(name) {
  return (name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCyberScan() {

  // ── Credentials ────────────────────────────────────────────────────────────
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureKey,      setAzureKey]      = useState("");
  const [deployment,    setDeployment]    = useState("gpt-4o");
  const [apiVersion,    setApiVersion]    = useState("2024-02-01");
  const [tavilyKey,     setTavilyKey]     = useState("");

  // ── Time range ──────────────────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState("1y");

  // ── Feature 1: Framework scan ───────────────────────────────────────────────
  const [frameworks,  setFrameworks]  = useState([]);
  const [results,     setResults]     = useState({});
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [scanning,    setScanning]    = useState(false);
  const [scanAborted, setScanAborted] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [statusLabel, setStatusLabel] = useState("Ready");

  // ── Feature 2: Discover new ─────────────────────────────────────────────────
  const [newFWs,          setNewFWs]          = useState([]);
  const [discovering,     setDiscovering]     = useState(false);
  const [discoverAborted, setDiscoverAborted] = useState(false);
  const [discoverStatus,  setDiscoverStatus]  = useState("idle");
  const [discoverError,   setDiscoverError]   = useState(null);

  // ── File + config ───────────────────────────────────────────────────────────
  const [fileAlert, setFileAlert] = useState(null);
  const [fileName,  setFileName]  = useState(null);
  const [savedMsg,  setSavedMsg]  = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  // abortControllerRef: holds live AbortControllers to cancel fetch mid-flight
  const abortControllerRef = useRef({ scan: null, discover: null });
  // stateRef: async functions always read latest state
  const stateRef = useRef({});
  stateRef.current = {
    azureEndpoint, azureKey, deployment, apiVersion,
    tavilyKey, timeRange, frameworks,
  };

  // ── Abort handlers ──────────────────────────────────────────────────────────
  const abortScan = useCallback(() => {
    abortControllerRef.current.scan?.abort();
    console.log("[Scan] Abort requested — cancelling in-flight request.");
  }, []);

  const abortDiscover = useCallback(() => {
    abortControllerRef.current.discover?.abort();
    console.log("[Discover] Abort requested — cancelling in-flight request.");
  }, []);

  // ── Auto-load config ────────────────────────────────────────────────────────
  useEffect(() => {
    const cfg = loadConfig();
    if (cfg.azureEndpoint) setAzureEndpoint(cfg.azureEndpoint);
    if (cfg.azureKey)      setAzureKey(cfg.azureKey);
    if (cfg.deployment)    setDeployment(cfg.deployment);
    if (cfg.apiVersion)    setApiVersion(cfg.apiVersion);
    if (cfg.tavilyKey)     setTavilyKey(cfg.tavilyKey);
    if (cfg.timeRange)     setTimeRange(cfg.timeRange);
  }, []);

  const handleSaveConfig = () => {
    saveConfig({ azureEndpoint, azureKey, deployment, apiVersion, tavilyKey, timeRange });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleLoadConfig = () => {
    const cfg = loadConfig();
    if (cfg.azureEndpoint) setAzureEndpoint(cfg.azureEndpoint);
    if (cfg.azureKey)      setAzureKey(cfg.azureKey);
    if (cfg.deployment)    setDeployment(cfg.deployment);
    if (cfg.apiVersion)    setApiVersion(cfg.apiVersion);
    if (cfg.tavilyKey)     setTavilyKey(cfg.tavilyKey);
    if (cfg.timeRange)     setTimeRange(cfg.timeRange);
  };

  // ── File parse ──────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) throw new Error("SheetJS not loaded.");
        const wb   = XLSX.read(ev.target.result, { type: "binary" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!data.length) throw new Error("No data rows found.");
        const keys    = Object.keys(data[0]);
        const nameKey = keys.find(k => /name/i.test(k))        ?? keys[0];
        const urlKey  = keys.find(k => /url/i.test(k))         ?? keys[1];
        const catKey  = keys.find(k => /cat/i.test(k));
        const verKey  = keys.find(k => /ver|version/i.test(k));
        const parsed  = data
          .map(r => ({
            name:     String(r[nameKey] ?? "").trim(),
            url:      String(r[urlKey]  ?? "").trim(),
            category: catKey ? String(r[catKey] ?? "").trim() : "",
            version:  verKey ? String(r[verKey]  ?? "").trim() : "",
          }))
          .filter(f => f.name);
        setFrameworks(parsed);
        setResults({});
        //setNewFWs([]);
        setSelectedIdx(null);
        setProgress(0);
        setScanAborted(false);
        setDiscoverAborted(false);
        setDiscoverStatus("idle");
        setDiscoverError(null);
        setFileName(`${file.name} · ${parsed.length} frameworks`);
        setFileAlert({ type: "success", msg: `${parsed.length} frameworks loaded. Columns: ${keys.join(", ")}` });
      } catch (err) {
        setFileAlert({ type: "error", msg: `Parse error: ${err.message}` });
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── JSON helpers ────────────────────────────────────────────────────────────
  const extractArray = (raw) => {
    let clean = raw
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    const start = clean.indexOf("[");
    const end   = clean.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    clean = clean.slice(start, end + 1);
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) return parsed;
      const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      return arrKey ? parsed[arrKey] : null;
    } catch (_) { return null; }
  };

  const repairTruncated = (raw) => {
    let clean = raw
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    const start = clean.indexOf("[");
    if (start === -1) return null;
    clean = clean.slice(start);
    const lastClose = clean.lastIndexOf("}");
    if (lastClose === -1) return null;
    try {
      const parsed = JSON.parse(clean.slice(0, lastClose + 1) + "]");
      return Array.isArray(parsed) ? parsed : null;
    } catch (_) { return null; }
  };

  // ── FEATURE 1: Scan one existing framework ───────────────────────────────────
  const scanOne = async (i, frameworksList) => {
    const {
      azureEndpoint, azureKey, deployment,
      apiVersion, tavilyKey, timeRange,
    } = stateRef.current;

    const f                             = frameworksList[i];
    const { startYear, endYear, years } = getYearRange(timeRange);
    const dateScope                     = buildDateScope(startYear, endYear);

    // Create a fresh AbortController for this framework's GPT call
    const controller = new AbortController();
    abortControllerRef.current.scan = controller;

    const creds = { endpoint: azureEndpoint, apiKey: azureKey, deployment, apiVersion };

    setResults(prev => ({ ...prev, [i]: { status: "scanning" } }));

    try {
      let ctx = `No live data. Use training knowledge for ${f.name}, scoped strictly to ${dateScope}.`;

      if (tavilyKey) {
        try {
          const yearStr = years.join(" OR ");
          const sr      = await tavilySearch(
            tavilyKey,
            `"${f.name}" updates amendments changes regulations ${yearStr}`
          );
          if (sr.length) {
            ctx =
              `Live search results for "${f.name}" (${dateScope}):\n\n` +
              sr.map(r =>
                `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content ?? r.snippet ?? ""}`
              ).join("\n\n");
          }
        } catch (_) {}
      } else if (f.url) {
        const page = await fetchPage(f.url);
        if (page) ctx = `Live page content from ${f.url}:\n${page}`;
      }

      const sys =
`You are a cybersecurity and privacy compliance expert.
Return a JSON object with EXACTLY these keys:

- currentVersion: current version/status as of end of ${endYear}

- recentChanges: bullet list of updates ONLY within ${dateScope}.
  STRICT REQUIREMENTS for each bullet:
  1. MUST include the exact Month and Year — mandatory for every bullet.
  2. Order bullets from LATEST to OLDEST (most recent first).
  3. Format each bullet EXACTLY as:
     "Month YYYY: detailed description of what changed"
     IMPORTANT FORMAT RULES:
     - Use a COLON (:) after the date.
     - DO NOT use hyphens (-) or dashes (—) after the date.
     - DO NOT use square brackets around the date.
     - Structure the description naturally and professionally.
     - Be DETAILED and SPECIFIC: include exact document names, versions,
       what changed, what was added/removed, and why it matters.

  4. Separate each bullet using the pipe character | at the start (including the first).
  5. If no updates occurred within ${dateScope}, write exactly:
     "No significant changes recorded in ${dateScope}."

  ✅ GOOD examples (follow exactly):
  "| February 2024: NIST officially released Cybersecurity Framework (CSF) 2.0, replacing version 1.1, introducing the new Govern function, and expanding enterprise-wide cyber risk management expectations across sectors."
  "| October 2023: NIST issued SP 800-53 Release 5.1.1, adding new supply chain and privacy controls and integrating updates into the Cybersecurity and Privacy Reference Tool (CPRT)."
  "| July 2023: SEC adopted mandatory cybersecurity disclosure rules requiring public companies to report material cyber incidents within four business days and disclose annual risk management practices."

  ❌ BAD (DO NOT USE):
  - "February 2024 – update released"
  - "[February 2024] — changes announced"
  - "2024: update"

- upcoming: changes announced or expected AFTER ${endYear}
- implications: compliance implications from changes in ${dateScope}
- sourceNote: one sentence confirming data is scoped to ${dateScope} and whether source is live search or training knowledge

STRICT RULES:
1. Only include events within ${dateScope} (${years.join(", ")}).
2. Do NOT include anything before ${startYear} or after ${endYear}.
3. Follow the exact bullet format rules above — colon is mandatory.

Return ONLY valid JSON.
No markdown fences.
No extra text.`;
``

      const usr =
`Framework: ${f.name}
Last known version: ${f.version ?? "unknown"}
Category: ${f.category ?? "cybersecurity/privacy"}
STRICT time scope: ${dateScope} (${years.join(", ")})

${ctx}

Return JSON strictly scoped to ${dateScope}.`;

      // Pass abort signal — fetch throws AbortError immediately if cancelled
      const raw   = await callGPT(creds, sys, usr, 900, controller.signal);
      const clean = raw.replace(/```json|```/g, "").trim();
      let parsed;
      try   { parsed = JSON.parse(clean); }
      catch {
        parsed = {
          currentVersion: "—",
          recentChanges:  raw.substring(0, 600),
          upcoming:       "—",
          implications:   "—",
          sourceNote:     `Raw response — JSON parse failed. Scoped to ${dateScope}.`,
        };
      }
      // ── Normalise recentChanges — if GPT returned array, join to pipe-string ──
      if (Array.isArray(parsed?.recentChanges)) {
        parsed.recentChanges = parsed.recentChanges
          .map(item => String(item).replace(/^["'\s]+|["'\s,]+$/g, "").trim())
          .filter(item => item.length > 0)
          .join(" | ");
      }

      
      setResults(prev => ({ ...prev, [i]: { status: "done", data: parsed } }));
    } catch (err) {
      if (err.name === "AbortError") {
        // Request cancelled by user — mark as aborted, not error
        setResults(prev => ({ ...prev, [i]: { status: "aborted" } }));
      } else {
        setResults(prev => ({ ...prev, [i]: { status: "error", error: err.message } }));
      }
    }
  };

  // ── FEATURE 2: Discover new frameworks + regulations ─────────────────────────
  const startDiscover = useCallback(async () => {
    const {
      azureEndpoint, azureKey, deployment,
      apiVersion, tavilyKey, timeRange,
    } = stateRef.current;

    if (!azureEndpoint || !azureKey || !deployment) {
      alert("Please fill in Azure OpenAI credentials first.");
      return;
    }

    // Create AbortController for this discover session
    const discoverController = new AbortController();
    abortControllerRef.current.discover = discoverController;
    const discoverSignal = discoverController.signal;

    setDiscovering(true);
    setDiscoverAborted(false);
    setDiscoverStatus("running");
    //setNewFWs([]);
    setDiscoverError(null);

    const { startYear, endYear, years, preGPTYears, liveYears } = getYearRange(timeRange);
    const dateScope    = buildDateScope(startYear, endYear);
    const fullYearList = years.join(", ");
    const creds        = { endpoint: azureEndpoint, apiKey: azureKey, deployment, apiVersion };

    // Helper: checks if aborted and cleans up
    const checkAborted = () => {
      if (discoverSignal.aborted) {
        console.log("[Discover] Aborted.");
        setDiscovering(false);
        setDiscoverAborted(true);
        setDiscoverStatus("idle");
        return true;
      }
      return false;
    };

    console.log(`[Discover] Range: ${dateScope}`);
    console.log(`[Discover] GPT-knowledge years (<=2023): ${preGPTYears.join(", ") || "none"}`);
    console.log(`[Discover] Live-search years (>=2024):   ${liveYears.join(", ")   || "none"}`);

    // ════════════════════════════════════════════════════════════════════════
    // PHASE A — GPT-4o training knowledge for ALL years
    // ════════════════════════════════════════════════════════════════════════
    console.log("[Discover] Phase A: GPT knowledge enumeration...");

    const phaseASys =
`You are a world-class cybersecurity and IT regulatory expert with comprehensive knowledge of all major frameworks, regulations, standards, and strategies published globally.

Your task: List ALL brand-new cybersecurity, privacy, IT security, and AI governance frameworks, regulations, standards, and strategies that were FIRST officially published, enacted, released, or came into effect during ${dateScope}.

Knowledge confidence guidance:
- For years ${preGPTYears.length > 0 ? preGPTYears.join(", ") : "N/A"}: Your training knowledge is complete and reliable. Include everything you know confidently.
- For years ${liveYears.length > 0 ? liveYears.join(", ") : "N/A"}: Include what you know, but note your knowledge may be incomplete for these years.

"Brand new" = FIRST introduced during ${dateScope}. Do NOT include version updates of existing frameworks.
Include items across ALL regions: USA, EU, UK, India, Australia, Singapore, Canada, Global, etc.
Include ALL types: Regulation, Framework, Standard, Strategy.

Return a JSON array. Each item MUST have exactly these fields:
{
  "name": "full official name",
  "type": "Regulation | Framework | Standard | Strategy",
  "description": "2 sentences: what it is and who it applies to",
  "region": "USA / EU / India / UK / Australia / Global / etc.",
  "publishedDate": "Month YYYY",
  "relevance": "High / Medium / Low",
  "url": "official source URL if known, else empty string"
}

IMPORTANT examples to include if they fall in your date range:
- NIST AI RMF (January 2023) — type: Framework
- SEC Cybersecurity Disclosure Rule (July 2023) — type: Regulation
- DPDP Act India (August 2023) — type: Regulation
- NIS2 Directive enforcement (October 2023) — type: Regulation
- White House National Cybersecurity Strategy (March 2023) — type: Strategy
- EU AI Act enacted (August 2024) — type: Regulation
- DORA enforcement (January 2025) — type: Regulation
- NIST CSF 2.0 (February 2024) — type: Framework

Return ONLY the raw JSON array. Start with [. End with ]. No markdown. No explanation.`;

    const phaseAUsr =
`List all brand-new cybersecurity/IT frameworks, regulations, standards, and strategies
first officially released in ${dateScope} (${fullYearList}).

Be comprehensive — include items from all regions and categories.
For ${preGPTYears.length > 0 ? preGPTYears.join(", ") : "the years in range"}: use your full training knowledge.
For ${liveYears.length > 0 ? liveYears.join(", ") : "N/A"}: include what you know (will be supplemented by live search).

Return the complete JSON array starting with [.`;

    let phaseAItems = [];
    try {
      // Pass discoverSignal — cancels immediately if user clicks Abort
      const rawA  = await callGPT(creds, phaseASys, phaseAUsr, 3500, discoverSignal);
      phaseAItems = extractArray(rawA) ?? repairTruncated(rawA) ?? [];
      console.log(`[Discover] Phase A: ${phaseAItems.length} items from GPT knowledge`);
    } catch (err) {
      if (err.name === "AbortError") { if (checkAborted()) return; }
      else console.warn("[Discover] Phase A failed:", err.message);
    }

    // Abort check after Phase A
    if (checkAborted()) return;

    // ════════════════════════════════════════════════════════════════════════
    // PHASE B — Tavily live search for years >= 2024
    // ════════════════════════════════════════════════════════════════════════
    let phaseBItems = [];

    if (liveYears.length > 0 && tavilyKey) {
      console.log(`[Discover] Phase B: Tavily live search for ${liveYears.join(", ")}...`);

      const queries = liveYears.flatMap(year => [
        `new cybersecurity regulation law enacted published ${year}`,
        `new privacy data protection law enacted ${year}`,
        `new AI governance regulation framework published ${year}`,
        `new cybersecurity framework standard released ${year}`,
        `new information security regulation compliance rule ${year}`,
        `cybersecurity legislation regulation news ${year}`,
      ]);

      let allResults = [];
      for (const q of queries) {
        // Abort check inside Tavily loop
        if (discoverSignal.aborted) {
          console.log("[Discover] Aborted during Phase B Tavily loop.");
          setDiscovering(false);
          setDiscoverAborted(true);
          setDiscoverStatus("idle");
          return;
        }
        try {
          const res  = await tavilySearchCyber(tavilyKey, q);
          allResults = allResults.concat(res);
          console.log(`  ✓ "${q}" → ${res.length} results`);
        } catch (err) {
          console.warn(`  ✗ "${q}" failed: ${err.message}`);
        }
      }

      const seen    = new Set();
      const deduped = allResults.filter(r => {
        if (!r.url || seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });

      const liveYearStrs = liveYears.map(String);
      const scored = deduped.map(r => {
        const text = `${r.title ?? ""} ${r.content ?? r.snippet ?? ""}`.toLowerCase();
        let score  = 0;
        liveYearStrs.forEach(y => { if (text.includes(y)) score += 3; });
        if (/nist\.gov|cisa\.gov|europa\.eu|federalregister\.gov|sec\.gov|iso\.org/.test(r.url)) score += 5;
        if (/enacted|published|released|signed|effective|finalized|adopted|launched/.test(text)) score += 2;
        if (/cybersecurity|privacy|data protection|framework|regulation|standard/.test(text)) score += 1;
        if (!liveYearStrs.some(y => text.includes(y))) score -= 3;
        if (/tips|how to|best practices|guide|tutorial|checklist/.test(text)) score -= 2;
        return { ...r, score };
      });
      const top25 = scored.sort((a, b) => b.score - a.score).slice(0, 25);
      console.log(`[Discover] Phase B: ${deduped.length} unique, top ${top25.length} to GPT`);

      // Abort check before Phase B GPT call
      if (checkAborted()) return;

      const phaseANames = phaseAItems.map(it => it.name ?? "").filter(Boolean).join("; ");
      const snippets    = top25
        .map((r, idx) =>
          `[${idx + 1}] ${r.title}\n    URL: ${r.url}\n    ${(r.content ?? r.snippet ?? "").substring(0, 400)}`
        ).join("\n\n");

      const phaseBSys =
`You are a cybersecurity and IT regulatory expert.
From LIVE web search results, extract ALL brand-new cybersecurity/privacy/IT frameworks,
regulations, standards, or strategies FIRST officially released in ${liveYears.join(" or ")}.
"Brand new" = first introduced then. NOT updates to existing frameworks.
Already found (DO NOT duplicate): ${phaseANames || "None yet"}
Return a JSON array of NEW items only. Each item:
{ "name":"...", "type":"Regulation|Framework|Standard|Strategy",
  "description":"2 sentences", "region":"...", "publishedDate":"Mon YYYY",
  "relevance":"High/Medium/Low", "url":"URL from search results" }
Return [] if nothing new. Return ONLY the JSON array. Start with [. End with ].`;

      const phaseBUsr =
`Extract brand-new cybersecurity/IT frameworks and regulations from these live search results for ${liveYears.join(", ")}:

${snippets || "No search results available."}

Return JSON array of items NOT already in the prior list. Start with [.`;

      try {
        // Pass discoverSignal
        const rawB  = await callGPT(creds, phaseBSys, phaseBUsr, 2500, discoverSignal);
        phaseBItems = extractArray(rawB) ?? repairTruncated(rawB) ?? [];
        console.log(`[Discover] Phase B: ${phaseBItems.length} additional items`);
      } catch (err) {
        if (err.name === "AbortError") { if (checkAborted()) return; }
        else console.warn("[Discover] Phase B GPT failed:", err.message);
      }
    } else {
      console.log(`[Discover] Phase B skipped (${liveYears.length === 0 ? "no live years" : "no Tavily key"}).`);
    }

    // Abort check before Phase C
    if (checkAborted()) return;

    // ════════════════════════════════════════════════════════════════════════
    // PHASE C — Merge + deduplicate + normalise
    // ════════════════════════════════════════════════════════════════════════
    const combined  = [...phaseAItems, ...phaseBItems];
    const seenNames = new Set();
    const merged    = combined.filter(item => {
      if (!item || typeof item.name !== "string" || item.name.trim().length < 3) return false;
      const key = normName(item.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    const validTypes = ["Regulation", "Framework", "Standard", "Strategy"];
    const normalised = merged.map(item => ({
      ...item,
      type: validTypes.includes((item.type ?? "").trim()) ? item.type.trim() : "Framework",
    }));

    console.log(`[Discover] Phase C: ${normalised.length} merged unique items`);
    normalised.forEach((it, idx) =>
      console.log(`  [${idx + 1}] [${it.type}] ${it.name} (${it.publishedDate ?? "?"})`)
    );

    setNewFWs(normalised);
    setDiscoverStatus(normalised.length === 0 ? "empty" : "done");
    setDiscovering(false);

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── FEATURE 1: Start full scan ────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    const { azureEndpoint, azureKey, deployment, frameworks } = stateRef.current;
    if (!azureEndpoint || !azureKey || !deployment) {
      alert("Please fill in Azure OpenAI credentials.");
      return;
    }
    if (!frameworks.length) {
      alert("Please upload an Excel file first.");
      return;
    }

    // Reset abort controller and state
    abortControllerRef.current.scan = null;
    setScanning(true);
    setScanAborted(false);
    setResults({});
    setProgress(0);
    setStatusLabel("Scanning");
    setSelectedIdx(0);

    for (let i = 0; i < frameworks.length; i++) {
      await scanOne(i, frameworks);
      // After each scanOne, check if its controller was aborted
      if (abortControllerRef.current.scan?.signal?.aborted) {
        console.log(`[Scan] Stopped at framework ${i} due to abort.`);
        setScanning(false);
        setScanAborted(true);
        setStatusLabel("Aborted");
        setProgress(0);
        return;
      }
      setProgress(Math.round(((i + 1) / frameworks.length) * 100));
    }

    setScanning(false);
    setStatusLabel("Complete");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Return ──────────────────────────────────────────────────────────────────
  return {
    // Credentials
    azureEndpoint, setAzureEndpoint,
    azureKey,      setAzureKey,
    deployment,    setDeployment,
    apiVersion,    setApiVersion,
    tavilyKey,     setTavilyKey,
    // Time range
    timeRange,     setTimeRange,
    // Feature 1
    frameworks,    results,
    selectedIdx,   setSelectedIdx,
    scanning,      scanAborted,   progress,  statusLabel,
    // Feature 2
    newFWs,        discovering,   discoverAborted,
    discoverStatus, discoverError,
    // File + config
    fileAlert,     fileName,      savedMsg,
    // Handlers
    handleSaveConfig, handleLoadConfig, handleFile,
    startScan,    abortScan,
    startDiscover, abortDiscover,
  };
}
