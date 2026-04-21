export async function callGPT(
  { endpoint, apiKey, deployment, apiVersion },
  system,
  user,
  maxTokens = 4096,
  signal = null        // ← AbortSignal from AbortController
) {
  const url =
    `${endpoint.replace(/\/$/, "")}/openai/deployments/` +
    `${deployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user   },
      ],
      max_tokens:  maxTokens,
      temperature: 0.2,
    }),
    signal,             // ← pass signal to fetch — cancels the request immediately
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}