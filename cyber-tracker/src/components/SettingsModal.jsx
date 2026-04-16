import { C, P, s } from "../styles/tokens";

export default function SettingsModal({
  azureEndpoint, setAzureEndpoint,
  azureKey,      setAzureKey,
  deployment,    setDeployment,
  apiVersion,    setApiVersion,
  tavilyKey,     setTavilyKey,
  onSave, onLoad, onClose, savedMsg,
}) {
  const fields = [
    {
      label:       "Azure OpenAI Endpoint",
      val:         azureEndpoint,
      set:         setAzureEndpoint,
      placeholder: "https://your-resource.openai.azure.com/",
    },
    {
      label:       "Azure OpenAI API Key",
      val:         azureKey,
      set:         setAzureKey,
      placeholder: "••••••••••••••••",
    },
    {
      label:       "Deployment Name",
      val:         deployment,
      set:         setDeployment,
      placeholder: "gpt-4o",
    },
    {
      label:       "API Version",
      val:         apiVersion,
      set:         setApiVersion,
      placeholder: "2024-02-01",
    },
    {
      label:       "Tavily API Key",
      val:         tavilyKey,
      set:         setTavilyKey,
      placeholder: "tvly-••••••••••••",
      hint:        "Free at app.tavily.com · no card required",
    },
  ];

  return (
    <div style={s.modalBackdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 18,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
            ⚙️ Settings
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 8, color: C.error,
              width: 32, height: 32, cursor: "pointer",
              fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
          Configure your API credentials. Use <strong style={{ color: C.text }}>Save Configuration</strong> to
          persist settings in your browser across sessions.
        </p>

        {/* Fields */}
        {fields.map(({ label, val, set, placeholder, hint }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            <label style={s.label}>{label}</label>
            <input
              value={val}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              style={s.input}
            />
            {hint && <span style={s.hint}>{hint}</span>}
          </div>
        ))}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onSave}
            style={{
              flex: 1, padding: "10px",
              background: `linear-gradient(135deg, ${P[600]}, ${P[500]})`,
              border: "none", borderRadius: 8,
              color: "#fff", cursor: "pointer",
              fontWeight: 600, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            💾 Save Configuration
          </button>
          <button
            onClick={onLoad}
            style={{
              padding: "10px 16px",
              background: "rgba(59,42,128,0.4)",
              border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text,
              cursor: "pointer", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            📁 Load Saved
          </button>
        </div>

        {/* Save confirmation */}
        {savedMsg && (
          <div style={s.alert("success")}>
            ✓ Configuration saved!
          </div>
        )}

      </div>
    </div>
  );
}