import { P, C, s, TIME_RANGE_OPTIONS, timeRangeLabel } from "../styles/tokens";
import Spinner from "./Spinner";

export default function ScanControlsCard({
  timeRange, setTimeRange,
  scanning, scanAborted, progress,
  frameworks, doneCt,
  newFWs, discovering, discoverAborted, discoverStatus, discoverError,
  onScan, onAbortScan,
  onDiscover, onAbortDiscover,
  onExport,
}) {

  const discoverBadge = {
    idle:    null,
    running: { label: "Discovering...",           color: C.warning   },
    done:    { label: `${newFWs.length} Found`,   color: C.success   },
    empty:   { label: "None Found",               color: C.textMuted },
    error:   { label: "Discover Failed",          color: C.error     },
  }[discoverStatus];

  return (
    <div style={s.card}>

      {/* Card title */}
      <div style={s.cardTitle}>
        <span style={s.dot(C.info)} />
        Scan Controls
      </div>
      <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, marginTop: -8 }}>
        Fetch live updates for existing frameworks &middot; Discover brand-new regulations separately
      </p>

      {/* Time Range */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ ...s.label, marginBottom: 6, display: "block" }}>
          🕐 Scan Time Range
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            style={{
              ...s.select,
              fontSize: 14,
              padding: "10px 36px 10px 13px",
              border: `1px solid ${C.borderHover}`,
            }}
          >
            {TIME_RANGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            color: C.textMuted, pointerEvents: "none", fontSize: 11,
          }}>▼</span>
        </div>
        <div style={s.hint}>
          Updates scoped to: <strong style={{ color: C.text }}>{timeRangeLabel(timeRange)}</strong>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { n: frameworks.length, l: "Total",     color: P[300]    },
          { n: doneCt,            l: "Scanned",   color: C.success },
          { n: newFWs.length,     l: "New Found", color: C.info    },
        ].map(({ n, l, color }) => (
          <div key={l} style={s.statCard}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color }}>{n}</div>
            <div style={{
              fontSize: 9, color: C.textDim,
              fontFamily: "'DM Mono', monospace",
              textTransform: "uppercase", letterSpacing: "1px", marginTop: 3,
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Section 1: Scan Existing Frameworks ── */}
      <div style={{
        background: "rgba(13,10,26,0.3)",
        border: `1px solid ${scanning ? C.warningBorder : C.border}`,
        borderRadius: 10, padding: "14px", marginBottom: 12,
        transition: "border-color 0.2s",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: P[300],
          textTransform: "uppercase", letterSpacing: "1.5px",
          fontFamily: "'DM Mono', monospace", marginBottom: 8,
        }}>
          📋 Scan Existing Frameworks
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
          Fetch updates &amp; changes for frameworks in your uploaded file, scoped
          to <strong style={{ color: C.text }}>{timeRangeLabel(timeRange)}</strong>.
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onExport}
            disabled={doneCt === 0}
            style={{
              padding: "9px 16px",
              background: doneCt === 0 ? "rgba(59,42,128,0.2)" : "rgba(59,42,128,0.4)",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: doneCt === 0 ? C.textDim : C.text,
              cursor: doneCt === 0 ? "not-allowed" : "pointer",
              fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Export CSV
          </button>

          {scanning ? (
            <button
              onClick={onAbortScan}
              style={{
                flex: 1, padding: "9px",
                background: "rgba(248,113,113,0.15)",
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 8, color: C.error,
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              ⏹ Abort Scan
            </button>
          ) : (
            <button
              onClick={onScan}
              disabled={!frameworks.length}
              style={{
                flex: 1, padding: "9px",
                background: !frameworks.length
                  ? "rgba(59,42,128,0.2)"
                  : `linear-gradient(135deg, ${P[600]}, ${P[500]})`,
                border: "none", borderRadius: 8, color: "#fff",
                cursor: !frameworks.length ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                opacity: !frameworks.length ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              🔍 Start Scan
            </button>
          )}
        </div>

        {/* Scan progress bar */}
        {(scanning || progress > 0) && (
          <div style={{
            height: 3, background: "rgba(174,156,242,0.1)",
            borderRadius: 2, overflow: "hidden", marginTop: 12,
          }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: `linear-gradient(90deg, ${P[500]}, ${P[300]})`,
              transition: "width 0.4s ease", borderRadius: 2,
            }} />
          </div>
        )}

        {/* Scan aborted message */}
        {scanAborted && !scanning && (
          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8,
            background: C.errorBg, border: `1px solid ${C.errorBorder}`,
            color: C.error, fontSize: 12,
          }}>
            ⏹ Scan aborted. Results shown up to the point of abort.
          </div>
        )}
      </div>

      {/* ── Section 2: Discover New Frameworks ── */}
      <div style={{
        background: "rgba(13,10,26,0.3)",
        border: `1px solid ${
          discoverStatus === "error"   ? C.errorBorder   :
          discoverStatus === "done"    ? C.successBorder :
          discovering                  ? C.warningBorder :
          C.border
        }`,
        borderRadius: 10, padding: "14px",
        transition: "border-color 0.2s",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.success,
          textTransform: "uppercase", letterSpacing: "1.5px",
          fontFamily: "'DM Mono', monospace", marginBottom: 8,
        }}>
          🌐 Discover New Frameworks
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
          Independently search for brand-new cybersecurity &amp; privacy regulations
          first released in&nbsp;
          <strong style={{ color: C.text }}>{timeRangeLabel(timeRange)}</strong>.
          &nbsp;Requires Tavily API key.
        </div>

        {/* Discover / Abort row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {discovering ? (
            <button
              onClick={onAbortDiscover}
              style={{
                flex: 1, padding: "9px",
                background: "rgba(248,113,113,0.15)",
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 8, color: C.error,
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              ⏹ Abort Discovery
            </button>
          ) : (
            <button
              onClick={onDiscover}
              style={{
                flex: 1, padding: "9px",
                background: "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(52,211,153,0.12))",
                border: `1px solid ${C.successBorder}`,
                borderRadius: 8, color: C.success,
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              🔎 Discover New Regulations
            </button>
          )}

          {/* Status badge */}
          {discoverBadge && (
            <span style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20,
              background: "rgba(13,10,26,0.5)",
              color: discoverBadge.color,
              border: `1px solid ${discoverBadge.color}50`,
              fontFamily: "'DM Mono', monospace",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {discoverBadge.label}
            </span>
          )}
        </div>

        {/* Indeterminate progress bar while discovering */}
        {discovering && (
          <>
            <style>{`
              @keyframes cs-indeterminate {
                0%   { transform: translateX(-100%); }
                100% { transform: translateX(250%);  }
              }
            `}</style>
            <div style={{
              height: 3, background: "rgba(52,211,153,0.1)",
              borderRadius: 2, overflow: "hidden", marginTop: 12,
            }}>
              <div style={{
                height: "100%", width: "40%",
                background: `linear-gradient(90deg, transparent, ${C.success}, transparent)`,
                animation: "cs-indeterminate 1.4s ease-in-out infinite",
                borderRadius: 2,
              }} />
            </div>
          </>
        )}

        {/* Error detail */}
        {discoverStatus === "error" && discoverError && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 8,
            background: C.errorBg, border: `1px solid ${C.errorBorder}`,
            color: C.error, fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1.6, wordBreak: "break-all",
          }}>
            ⚠ {discoverError}
          </div>
        )}

        {/* Empty result */}
        {discoverStatus === "empty" && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 8,
            background: C.warningBg, border: `1px solid ${C.warningBorder}`,
            color: C.warning, fontSize: 12,
          }}>
            No new frameworks found for <strong>{timeRangeLabel(timeRange)}</strong>. Try a wider time range.
          </div>
        )}

        {/* Success summary */}
        {discoverStatus === "done" && newFWs.length > 0 && (
          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8,
            background: C.successBg, border: `1px solid ${C.successBorder}`,
            color: C.success, fontSize: 12,
          }}>
            ✓ Found {newFWs.length} new framework{newFWs.length !== 1 ? "s" : ""} — scroll down to view.
          </div>
        )}

        {/* Discovery aborted message */}
        {discoverAborted && !discovering && (
          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8,
            background: C.errorBg, border: `1px solid ${C.errorBorder}`,
            color: C.error, fontSize: 12,
          }}>
            ⏹ Discovery aborted.
          </div>
        )}

      </div>
    </div>
  );
}
