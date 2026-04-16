import { P, C, s } from "../styles/tokens";
import Spinner from "./Spinner";

// ── Generic section ──────────────────────────────────────────────────────────
const Section = ({ title, value }) =>
  value ? (
    <div style={{ marginBottom: 18 }}>
      <div style={s.sectionLabel}>{title}</div>
      <div style={s.sectionContent}>{value}</div>
    </div>
  ) : null;

// ── Bullet section for recentChanges ─────────────────────────────────────────
// Primary split on • (bullet char GPT outputs)
// Fallback on | then plain single block
// ✅ Fixed — coerce to string first
const BulletSection = ({ title, value }) => {
  if (!value) return null;

  // GPT sometimes returns an array, sometimes a string — handle both
  let bullets = [];

  if (Array.isArray(value)) {
    // Already an array — use directly, clean each item
    bullets = value
      .map(b => String(b).replace(/^["'\s]+|["'\s,]+$/g, "").trim())
      .filter(b => b.length > 0);

  } else {
    // It's a string — detect separator and split
    const str = String(value);
    if (str.includes("|")) {
      bullets = str.split("|").map(b => b.trim()).filter(b => b.length > 0);
    } else if (str.includes("•")) {
      bullets = str.split("•").map(b => b.trim()).filter(b => b.length > 0);
    } else if (str.includes("\n")) {
      bullets = str.split("\n").map(b => b.trim()).filter(b => b.length > 0);
    } else {
      bullets = [str.trim()];
    }
  }

  // Final cleanup — remove any leftover JSON artifacts like [" or ",] or "]
  bullets = bullets
    .map(b => b
        .replace(/^[\s\u2022|\-\["']+/, "")  // strip leading junk
        .replace(/\]/g, "")                   // ← remove ALL ] anywhere in string
        .replace(/[\["'\s,]+$/, "")           // strip trailing junk
        .trim()
      )
    .filter(b => b.length > 2);

  if (bullets.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={s.sectionLabel}>{title}</div>
      <div style={{
        background: "rgba(13,10,26,0.4)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "12px 14px",
      }}>
        {bullets.map((bullet, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 10,
            marginBottom: i < bullets.length - 1 ? 10 : 0,
            alignItems: "flex-start",
          }}>
            <span style={{
              color: C.info,
              flexShrink: 0,
              fontSize: 16,
              lineHeight: 1.5,
              marginTop: 1,
            }}>•</span>
            <span style={{
              fontSize: 13,
              color: C.text,
              lineHeight: 1.7,
              flex: 1,
            }}>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function DetailPanel({ frameworks, results, selectedIdx }) {

  // Empty state
  if (selectedIdx === null) {
    return (
      <div style={{
        ...s.detailPanel,
        display: "flex", alignItems: "center",
        justifyContent: "center", color: C.textDim, fontSize: 13,
      }}>
        Select a framework to view details
      </div>
    );
  }

  const f = frameworks[selectedIdx];
  const r = results[selectedIdx] ?? {};

  // Scanning state
  if (r.status === "scanning") return (
    <div style={s.detailPanel}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>
        {f.name}
      </div>
      <div style={{ fontSize: 11, color: P[400], marginBottom: 20 }}>{f.url}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.textMuted, fontSize: 13 }}>
        <Spinner /> Fetching live content and analysing with GPT-4o...
      </div>
    </div>
  );

  // Error state
  if (r.status === "error") return (
    <div style={s.detailPanel}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>
        {f.name}
      </div>
      <div style={s.alert("error")}>{r.error}</div>
    </div>
  );

  // Done state
  if (r.status === "done" && r.data) {
    const d = r.data;
    return (
      <div style={s.detailPanel}>

        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: 4,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{f.name}</div>
            {f.url && (
              <div style={{ fontSize: 11, color: P[400], marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                {f.url}
              </div>
            )}
            {f.version && (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                Last known: v{f.version}
              </div>
            )}
          </div>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20,
            background: "rgba(174,156,242,0.15)", color: P[300],
            border: "1px solid rgba(174,156,242,0.3)",
            fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
          }}>
            {f.category ?? "General"}
          </span>
        </div>

        {/* Source note */}
        {d.sourceNote && (
          <div style={{ ...s.alert("warning"), marginBottom: 16 }}>{d.sourceNote}</div>
        )}

        {/* Sections */}
        <div style={{ marginTop: 12 }}>
          <Section       title="Current Version / Status" value={d.currentVersion} />
          <BulletSection title="Recent Changes"           value={d.recentChanges}  />
          <Section       title="Upcoming Changes"         value={d.upcoming}       />
          <Section       title="Compliance Implications"  value={d.implications}   />
        </div>

      </div>
    );
  }

  // Pending fallback
  return (
    <div style={{ ...s.detailPanel, color: C.textDim, fontSize: 13 }}>
      Pending scan for {f.name}
    </div>
  );
}
