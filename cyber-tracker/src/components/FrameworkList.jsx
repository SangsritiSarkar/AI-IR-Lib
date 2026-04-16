import { P, C, s } from "../styles/tokens";
import StatusDot from "./StatusDot";

const tagType = (cat) => {
  const c = (cat ?? "").toLowerCase();
  if (c.includes("priv")) return "privacy";
  if (c.includes("cyber") || c.includes("sec")) return "cyber";
  return "other";
};

const tagColors = {
  cyber:   { color: P[300],    bg: "rgba(174,156,242,0.15)", border: "rgba(174,156,242,0.3)"  },
  privacy: { color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"   },
  other:   { color: "#9C8FC4", bg: "rgba(156,143,196,0.1)",  border: "rgba(156,143,196,0.2)"  },
};

export default function FrameworkList({ frameworks, results, selectedIdx, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={s.cardTitle}>
        <span style={s.dot()} />
        Frameworks
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {frameworks.map((f, i) => {
          const r       = results[i] ?? {};
          const active  = selectedIdx === i;
          const type    = tagType(f.category);
          const tc      = tagColors[type];

          return (
            <div
              key={i}
              style={s.fwItem(active)}
              onClick={() => onSelect(i)}
            >
              {/* Status dot */}
              <StatusDot status={r.status ?? "pending"} />

              {/* Name + URL */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, lineHeight: 1.35,
                  color: active ? "#fff" : C.text,
                }}>
                  {f.name}
                </div>
                <div style={{
                  fontSize: 11, color: C.textDim,
                  fontFamily: "'DM Mono', monospace",
                  marginTop: 3, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                  maxWidth: 200,
                }}>
                  {f.url ?? "No URL"}
                </div>
              </div>

              {/* Category tag — only if category exists */}
              {f.category ? (
                <span style={{
                  fontSize: 10,
                  padding: "2px 9px",
                  borderRadius: 20,
                  fontFamily: "'DM Mono', monospace",
                  background: tc.bg,
                  color: tc.color,
                  border: `1px solid ${tc.border}`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  lineHeight: 1.6,
                }}>
                  {f.category}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}