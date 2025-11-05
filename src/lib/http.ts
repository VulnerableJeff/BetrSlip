export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";
export async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}
