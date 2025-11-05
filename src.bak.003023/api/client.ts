const BACKEND = "http://localhost:8787";

export type ParlayPriceReq = { stake: number; legs: { odds: number }[] };
export type ParlayPriceRes = { decimal: number; potentialReturn: number; profit: number };

export type ParlayProbReq = { legs: { prob: number }[]; correlation?: number };
export type ParlayProbRes = { prob: number };

export async function getParlayPrice(body: ParlayPriceReq): Promise<ParlayPriceRes> {
  const r = await fetch(`${BACKEND}/api/parlay/price`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error("price failed");
  return r.json();
}

export async function getParlayProb(body: ParlayProbReq): Promise<ParlayProbRes> {
  const r = await fetch(`${BACKEND}/api/parlay/prob`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error("prob failed");
  return r.json();
}
