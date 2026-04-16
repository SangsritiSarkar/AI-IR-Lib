import { P, C, s, TIME_RANGE_OPTIONS } from "../styles/tokens";
import Spinner from "./Spinner";

export default function Header({ scanning, discovering, timeRange, statusLabel, onOpenSettings }) {
  const badgeCfg = {
    "Ready":    [P[300],    C.infoBg,    C.infoBorder   ],
    "Scanning": [C.warning, C.warningBg, C.warningBorder],
    "Complete": [C.success, C.successBg, C.successBorder],
  }[statusLabel] ?? [P[300], C.infoBg, C.infoBorder];

  return (
    <header style={s.header}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38,
          background: `linear-gradient(135deg, ${P[600]}, ${P[400]})`,
          borderRadius: 10, display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px ${P[500]}55`,
        }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
        </div>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 800,
            background: `linear-gradient(90deg, ${P[200]}, ${P[400]})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}>CyberScan</div>
          <div style={{
            fontSize: 10, color: C.textDim, letterSpacing: "2px",
            textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 1,
          }}>Framework Intelligence · 2026</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {scanning   && <><Spinner color={C.warning} /><span style={{ fontSize: 11, color: C.warning }}>Scanning</span></>}
        {discovering && <><Spinner color={C.success} /><span style={{ fontSize: 11, color: C.success }}>Discovering</span></>}

        {/* Time range badge */}
        <span style={s.badge(P[200], "rgba(174,156,242,0.2)", "rgba(174,156,242,0.4)")}>
          🕐 {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label ?? "Last 1 Year"}
        </span>

        {/* Status badge */}
        <span style={s.badge(...badgeCfg)}>{statusLabel}</span>

        {/* Gear */}
        <button onClick={onOpenSettings} title="Settings" style={{
          width: 36, height: 36,
          background: "rgba(59,42,128,0.5)",
          border: `1px solid ${C.border}`,
          borderRadius: 10, color: P[300],
          cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>⚙️</button>
      </div>
    </header>
  );
}