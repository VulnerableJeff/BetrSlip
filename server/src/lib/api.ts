export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:8787";

export async function fetchSuggestions(sport: string) {
  const url = `${API_BASE}/ai/suggest?sport=${encodeURIComponent(sport || "Unknown")}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Suggest HTTP ${r.status}`);
  return (await r.json()).items as Array<{
    id: string; league: string; title: string; odds: number; rating: number; note: string; implied: number;
  }>;
}
