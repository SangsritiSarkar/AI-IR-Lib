const KEY = "cyberscan_config";

export function saveConfig(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch (_) {
    return {};
  }
}