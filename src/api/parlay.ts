import { API_BASE } from "../lib/config";

export type ParlayInputLeg = { odds?: number; prob?: number };

export type ParlayResponse = {
  parlayProb: number;       // 0..1
  fairDecimal: number;
  fairAmerican: number;
  stakePct: number;         // 0..1 (Kelly fraction)
  edge: number;             // e.g. +0.08 = 8% edge
};

export async function calcParlay(legs: ParlayInputLeg[]): Promise<ParlayResponse> {
  const res = await fetch(`${API_BASE}/parlay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legs }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Parlay API ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}
