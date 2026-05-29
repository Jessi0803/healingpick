const STORAGE_KEY = "hp-anon-id";

function generate(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Fallback: random hex string
  let s = "";
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

/** Stable per-browser id. Lazily created and persisted in localStorage. */
export function getAnonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generate();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
