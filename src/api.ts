const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const BASE = `http://${host}:8787`;

export type Leg = { label?: string; odds: number; prob?: number };

export async function apiHealth(){ const r=await fetch(`${BASE}/health`); return r.json(); }

export async function apiSuggest(){
  const r = await fetch(`${BASE}/ai/suggest`);
  if(!r.ok) throw new Error(`Suggest ${r.status}`);
  return r.json();
}

export async function apiParlay(legs: Leg[]){
  const body = { legs: legs.map(l => ({ odds: l.odds, prob: l.prob })) };
  const r = await fetch(`${BASE}/parlay`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if(!r.ok) throw new Error(`Parlay ${r.status}`);
  return r.json();
}

export async function apiOcr(imgBase64:string){
  const r = await fetch(`${BASE}/ocr`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ img: imgBase64 })
  });
  if(!r.ok) throw new Error(`OCR ${r.status}`);
  return r.json();
}
