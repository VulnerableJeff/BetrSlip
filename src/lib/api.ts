export async function apiHealth() {
  const r = await fetch("/api/health");
  if (!r.ok) throw new Error(`health ${r.status}`);
  return r.json();
}

export async function apiSuggest() {
  const r = await fetch("/api/suggest", { method: "POST" });
  const txt = await r.text();
  if (!r.ok) throw new Error(`API ${r.status}: ${txt}`);
  return JSON.parse(txt);
}

export async function apiParlay(legs: { label: string; odds: number; prob?: number }[]) {
  const r = await fetch("/api/parlay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legs }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`API ${r.status}: ${txt}`);
  return JSON.parse(txt);
}

export async function apiOcr(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/ocr", { method: "POST", body: fd });
  const txt = await r.text();
  if (!r.ok) throw new Error(`API ${r.status}: ${txt}`);
  return JSON.parse(txt);
}
