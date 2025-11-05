const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:8787";

async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}

async function postJSON<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}

export const api = {
  health: () => getJSON("/health"),
  suggest: () => getJSON("/ai/suggest"),
  parlay: (legs: {prob?: number; odds?: number}[]) =>
    postJSON("/parlay", { legs }),
  // For now server /ocr returns toy legs; we post a stub and use the response.
  ocr: (_file?: File) => postJSON("/ocr", { img: "stub" }),
};
