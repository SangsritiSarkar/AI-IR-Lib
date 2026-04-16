// ── General search — used by scanOne for existing framework updates ────────────
export async function tavilySearch(apiKey, query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key:      apiKey,
      query,
      search_depth: "advanced",
      max_results:  10,
      topic:        "general",
    }),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.results ?? [];
}

// ── Cybersecurity-focused news search — used by startDiscover Phase B ─────────
// No domain pinning (avoids recall failure). Excludes social/low-quality sites.
// Uses topic:"news" to surface recent regulatory announcements.
export async function tavilySearchCyber(apiKey, query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key:      apiKey,
      query,
      search_depth: "advanced",
      max_results:  15,
      topic:        "news",
      exclude_domains: [
        "reddit.com",
        "quora.com",
        "medium.com",
        "linkedin.com",
        "facebook.com",
        "twitter.com",
        "x.com",
        "youtube.com",
        "wikipedia.org",
        "stackoverflow.com",
        "pinterest.com",
        "tumblr.com",
        "slideshare.net",
      ],
    }),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.results ?? [];
}
