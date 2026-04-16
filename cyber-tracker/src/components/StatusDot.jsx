import { C } from "../styles/tokens";

export default function StatusDot({ status }) {
  const cfg = {
    pending:  { bg: C.textDim,  border: C.textDim  },
    scanning: { bg: C.warning,  border: C.warning   },
    done:     { bg: C.success,  border: C.success   },
    error:    { bg: C.error,    border: C.error      },
  }[status] ?? { bg: C.textDim, border: C.textDim };

  return (
    <>
      <style>{`
        @keyframes cs-pulse {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 20, borderRadius: "50%",
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        fontSize: 9, color: "#fff", fontWeight: 700,
        flexShrink: 0,
      }}>
        {status === "done"     && "✓"}
        {status === "error"    && "✕"}
        {status === "scanning" && (
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#fff",
            animation: "cs-pulse 1s ease-in-out infinite",
            display: "inline-block",
          }} />
        )}
        {status === "pending"  && (
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            display: "inline-block",
          }} />
        )}
      </span>
    </>
  );
}