import { s, C } from "../styles/tokens";

export default function CredentialsCard({
  azureEndpoint, setAzureEndpoint, azureKey, setAzureKey,
  deployment, setDeployment, apiVersion, setApiVersion,
  tavilyKey, setTavilyKey,
}) {
  const fields = [
    { label: "Azure OpenAI Endpoint", val: azureEndpoint, set: setAzureEndpoint, placeholder: "https://your-resource.openai.azure.com/", span: 2 },
    { label: "Azure OpenAI API Key", val: azureKey, set: setAzureKey, placeholder: "••••••••••••••••" },
    { label: "Deployment Name", val: deployment, set: setDeployment, placeholder: "gpt-4o" },
    { label: "API Version", val: apiVersion, set: setApiVersion, placeholder: "2024-02-01" },
    { label: "Tavily API Key", val: tavilyKey, set: setTavilyKey, placeholder: "tvly-••••••••••••", hint: "Free at app.tavily.com · no card required" },
  ];

  return (
    <div style={s.card}>
      <div style={s.cardTitle}><span style={s.dot()} />API Credentials</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {fields.map(({ label, val, set, placeholder, hint, span }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6, ...(span ? { gridColumn: `span ${span}` } : {}) }}>
            <label style={s.label}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={s.input} />
            {hint && <span style={s.hint}>{hint}</span>}
          </div>
        ))}
      </div>
      <div style={{ ...s.alert("warning"), marginTop: 14, fontSize: 11 }}>
        💡 Use the ⚙️ Settings button (top right) to save your configuration across sessions.
      </div>
    </div>
  );
}