import { P, C, s, timeRangeLabel } from "../styles/tokens";

// ── Type classifier ──────────────────────────────────────────────────────────
function isRegulation(item) {
  const type = (item.type ?? "").toLowerCase();
  const name = (item.name ?? "").toLowerCase();
  return (
    type === "regulation" ||
    /regulation|law|act|directive|rule|statute|legislation|mandate/.test(type) ||
    / act$| act | law | rule |directive|regulation|statute|gdpr|dpdp|dora|nis2|hipaa|ccpa|tdpsa|ocpa/.test(name)
  );
}

// ── Badge style helpers ───────────────────────────────────────────────────────
const typeBadge = (type) => {
  const map = {
    Regulation: { color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)" },
    Framework:  { color: "#AE9CF2", bg: "rgba(174,156,242,0.12)", border: "rgba(174,156,242,0.35)" },
    Standard:   { color: "#60A5FA", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)"  },
    Strategy:   { color: "#FBBF24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)"  },
  };
  const cfg = map[type] ?? map.Framework;
  return {
    fontSize: 10, padding: "2px 9px", borderRadius: 20,
    fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
  };
};

const relevanceBadge = (rel) => {
  const map = {
    High:   { color: C.success,   bg: C.successBg, border: C.successBorder },
    Medium: { color: C.warning,   bg: C.warningBg, border: C.warningBorder },
    Low:    { color: C.textMuted, bg: "rgba(156,143,196,0.1)", border: "rgba(156,143,196,0.25)" },
  };
  const cfg = map[rel] ?? map.Medium;
  return {
    fontSize: 10, padding: "2px 9px", borderRadius: 20,
    fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
  };
};

const regionBadge = () => ({
  fontSize: 10, padding: "2px 9px", borderRadius: 20,
  fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
  background: "rgba(174,156,242,0.1)", color: P[300],
  border: "1px solid rgba(174,156,242,0.25)",
});

const dateBadge = () => ({
  fontSize: 10, padding: "2px 9px", borderRadius: 20,
  fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
  background: "rgba(13,10,26,0.5)", color: C.textMuted,
  border: `1px solid ${C.border}`,
});

// ── Single item card ──────────────────────────────────────────────────────────
function DiscoveredCard({ item }) {
  const borderColor =
    item.type === "Regulation" ? "rgba(248,113,113,0.5)" :
    item.type === "Strategy"   ? "rgba(251,191,36,0.5)"  :
    item.type === "Standard"   ? "rgba(96,165,250,0.5)"  :
    "rgba(174,156,242,0.5)";

  return (
    <div style={{ ...s.newCard, borderLeft: `3px solid ${borderColor}` }}>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, lineHeight: 1.4 }}>
        {item.name ?? "Unknown"}
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
        {item.type         && <span style={typeBadge(item.type)}>{item.type}</span>}
        {item.region       && <span style={regionBadge()}>{item.region}</span>}
        {item.relevance    && <span style={relevanceBadge(item.relevance)}>{item.relevance} relevance</span>}
        {item.publishedDate && <span style={dateBadge()}>{item.publishedDate}</span>}
      </div>

      {/* Description */}
      {item.description && (
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65, marginTop: 4 }}>
          {item.description}
        </div>
      )}

      {/* Source link */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 11, color: C.info, textDecoration: "none", marginTop: 2 }}
        >
          View source →
        </a>
      )}
    </div>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────
function Section({ title, accent, items }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>

      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 14, paddingBottom: 10,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: accent,
          textTransform: "uppercase", letterSpacing: "2px",
          fontFamily: "'DM Mono', monospace",
        }}>
          {title}
        </span>
        <span style={{
          fontSize: 10, padding: "1px 8px", borderRadius: 20,
          background: "rgba(13,10,26,0.5)", color: C.textMuted,
          border: `1px solid ${C.border}`,
          fontFamily: "'DM Mono', monospace",
        }}>
          {items.length}
        </span>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <DiscoveredCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NewFrameworksCard({ newFWs, timeRange }) {
  if (!newFWs || newFWs.length === 0) return null;

  const regulations         = newFWs.filter(item => isRegulation(item));
  const frameworksStandards = newFWs.filter(item => !isRegulation(item));

  return (
    <div style={s.card}>

      {/* Card header */}
      <div style={{ ...s.cardTitle, marginBottom: 20 }}>
        <span style={s.dot(C.success)} />
        Newly Discovered Frameworks &amp; Regulations
        <span style={{ color: C.textMuted, fontWeight: 400 }}>
          &nbsp;— {timeRangeLabel(timeRange)}
        </span>
        <span style={{
          marginLeft: "auto", fontSize: 10, padding: "2px 10px",
          borderRadius: 20, background: C.successBg,
          color: C.success, border: `1px solid ${C.successBorder}`,
          fontFamily: "'DM Mono', monospace",
        }}>
          {newFWs.length} total
        </span>
      </div>

      {/* Section 1: Regulations & Laws */}
      <Section
        title="📋 Regulations & Laws"
        accent={C.error}
        items={regulations}
      />

      {/* Section 2: Frameworks, Standards & Strategies */}
      <Section
        title="🏗️ Frameworks, Standards & Strategies"
        accent={P[300]}
        items={frameworksStandards}
      />

    </div>
  );
}
