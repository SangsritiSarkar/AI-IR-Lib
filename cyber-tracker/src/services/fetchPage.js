export async function fetchPage(url) {
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal: AbortSignal.timeout(12000) });
      const json = await res.json();
      const text = json.contents ?? json.body ?? "";
      if (text.length > 100)
        return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 4000);
    } catch (_) {}
  }
  return null;
}