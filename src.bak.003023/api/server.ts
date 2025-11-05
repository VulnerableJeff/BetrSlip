const BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8787";

export async function getSuggest() {
  const res = await fetch(`${BASE}/ai/suggest`);
  if (!res.ok) throw new Error(`Suggest ${res.status}`);
  return res.json();
}

export async function postParlay(legs: Array<{prob?:number; odds?:number}>) {
  const safe = legs.map(l => {
    const odds = Number(l?.odds);
    const prob = Number(l?.prob);
    return {
      odds: Number.isFinite(odds) ? odds : -120,
      prob: Number.isFinite(prob) ? prob : (odds ? (odds>0 ? 100/(odds+100) : Math.abs(odds)/(Math.abs(odds)+100)) : 0.55)
    };
  });
  const res = await fetch(`${BASE}/parlay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legs: safe })
  });
  if (!res.ok) throw new Error(`Parlay ${res.status}`);
  return res.json();
}
