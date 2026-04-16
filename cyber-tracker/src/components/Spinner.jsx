import { P } from "../styles/tokens";

export default function Spinner({ size = 14, color = P[300] }) {
  return (
    <>
      <style>{`
        @keyframes cs-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          border: `2px solid ${color}40`,
          borderTop: `2px solid ${color}`,
          borderRadius: "50%",
          animation: "cs-spin 0.7s linear infinite",
          flexShrink: 0,
        }}
      />
    </>
  );
}