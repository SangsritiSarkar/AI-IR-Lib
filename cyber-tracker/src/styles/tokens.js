const CURRENT_YEAR = new Date().getFullYear(); // 2026

export const TIME_RANGE_OPTIONS = [
  { value: "3m", label: "Last 3 Months"                                          },
  { value: "6m", label: "Last 6 Months"                                          },
  { value: "1y", label: `Last 1 Year (${CURRENT_YEAR - 1})`                      },
  { value: "2y", label: `Last 2 Years (${CURRENT_YEAR - 2}–${CURRENT_YEAR})`     },
  { value: "3y", label: `Last 3 Years (${CURRENT_YEAR - 3}–${CURRENT_YEAR})`     },
  { value: "5y", label: `Last 5 Years (${CURRENT_YEAR - 5}–${CURRENT_YEAR})`     },
];

export const timeRangeLabel = (r) => {
  const map = {
    "3m": "last 3 months",
    "6m": "last 6 months",
    "1y": `${CURRENT_YEAR - 1}`,
    "2y": `${CURRENT_YEAR - 2}–${CURRENT_YEAR}`,
    "3y": `${CURRENT_YEAR - 3}–${CURRENT_YEAR}`,
    "5y": `${CURRENT_YEAR - 5}–${CURRENT_YEAR}`,
  };
  return map[r] ?? `${CURRENT_YEAR - 1}`;
};

export const P = {
  950: "#0D0A1A", 900: "#130E2B", 850: "#1A1238", 800: "#221847",
  750: "#2D2060", 700: "#3B2A80", 600: "#5238B8", 500: "#6C4FD4",
  400: "#8B72E8", 300: "#AE9CF2", 200: "#CDBFF8", 100: "#E8E2FC", 50: "#F4F1FE",
};

export const C = {
  success:       "#34D399",
  successBg:     "rgba(52,211,153,0.12)",
  successBorder: "rgba(52,211,153,0.3)",
  warning:       "#FBBF24",
  warningBg:     "rgba(251,191,36,0.12)",
  warningBorder: "rgba(251,191,36,0.3)",
  error:         "#F87171",
  errorBg:       "rgba(248,113,113,0.12)",
  errorBorder:   "rgba(248,113,113,0.3)",
  info:          "#AE9CF2",
  infoBg:        "rgba(174,156,242,0.12)",
  infoBorder:    "rgba(174,156,242,0.3)",
  text:          "#F0ECF8",
  textMuted:     "#9C8FC4",
  textDim:       "#5C5280",
  border:        "rgba(174,156,242,0.15)",
  borderHover:   "rgba(174,156,242,0.35)",
  surface:       "rgba(34,24,71,0.6)",
  surfaceHover:  "rgba(45,32,96,0.8)",
  card:          "rgba(26,18,56,0.8)",
};

export const s = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: `linear-gradient(135deg, ${P[950]} 0%, ${P[900]} 50%, #0E0B20 100%)`,
    minHeight: "100vh",
    color: C.text,
    padding: 0,
  },
  header: {
    background: `linear-gradient(90deg, ${P[850]} 0%, ${P[800]} 100%)`,
    borderBottom: `1px solid ${C.border}`,
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  main: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "18px 22px",
    backdropFilter: "blur(8px)",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: P[300],
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: 16,
    fontFamily: "'DM Mono', monospace",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: (color = P[400]) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 6px ${color}`,
  }),
  input: {
    background: "rgba(13,10,26,0.6)",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "9px 13px",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    color: C.text,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  select: {
    background: "rgba(13,10,26,0.6)",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "9px 13px",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    color: C.text,
    width: "100%",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  label: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  hint: {
    fontSize: 11,
    color: C.textDim,
    fontFamily: "'DM Mono', monospace",
    marginTop: 3,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 18,
    alignItems: "start",
  },
  badge: (color, bg, border) => ({
    fontSize: 11,
    padding: "4px 12px",
    borderRadius: 20,
    background: bg,
    color,
    border: `1px solid ${border}`,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.5px",
    fontWeight: 600,
  }),
  statCard: {
    background: "rgba(13,10,26,0.5)",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "10px 16px",
    textAlign: "center",
    minWidth: 72,
  },
  fwItem: (active) => ({
    background: active ? "rgba(59,42,128,0.5)" : "rgba(13,10,26,0.4)",
    border: `1px solid ${active ? P[500] : C.border}`,
    borderRadius: 10,
    padding: "11px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    cursor: "pointer",
    transition: "all 0.15s",
    boxShadow: active ? `0 0 12px ${P[700]}60` : "none",
  }),
  tag: (type) => {
    const map = {
      cyber:   [P[300],      "rgba(174,156,242,0.15)", "rgba(174,156,242,0.3)" ],
      privacy: [C.success,   C.successBg,              C.successBorder         ],
      other:   [C.textMuted, "rgba(156,143,196,0.1)",  "rgba(156,143,196,0.2)" ],
    };
    const [color, bg, border] = map[type] ?? map.other;
    return {
      fontSize: 10, padding: "2px 9px", borderRadius: 20,
      fontFamily: "'DM Mono', monospace",
      background: bg, color, border: `1px solid ${border}`,
      whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1.6,
    };
  },
  detailPanel: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "22px",
    minHeight: 380,
    backdropFilter: "blur(8px)",
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: P[400],
    textTransform: "uppercase", letterSpacing: "2px",
    fontFamily: "'DM Mono', monospace", marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14, color: C.text, lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    background: "rgba(13,10,26,0.4)",
    border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "12px 14px",
  },
  newCard: {
    background: "rgba(13,10,26,0.5)",
    border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "16px",
    display: "flex", flexDirection: "column", gap: 8,
    transition: "border-color 0.2s",
  },
  alert: (type) => {
    const map = {
      success: [C.success, C.successBg, C.successBorder],
      error:   [C.error,   C.errorBg,   C.errorBorder  ],
      warning: [C.warning, C.warningBg, C.warningBorder ],
    };
    const [color, bg, border] = map[type] ?? map.warning;
    return {
      padding: "10px 14px", borderRadius: 8,
      background: bg, color, border: `1px solid ${border}`,
      fontSize: 13, marginTop: 10,
    };
  },
  modalBackdrop: {
    position: "fixed", inset: 0,
    background: "rgba(13,10,26,0.85)",
    backdropFilter: "blur(6px)",
    zIndex: 200, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: `linear-gradient(135deg, ${P[900]} 0%, ${P[850]} 100%)`,
    border: `1px solid ${C.borderHover}`,
    borderRadius: 16, padding: "28px",
    width: "100%", maxWidth: 520,
    boxShadow: `0 24px 64px rgba(13,10,26,0.8), 0 0 40px ${P[700]}40`,
    position: "relative", maxHeight: "90vh", overflowY: "auto",
  },
};