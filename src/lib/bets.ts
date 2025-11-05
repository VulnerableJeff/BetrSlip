export type BookLine = { label: string; odds: number; book?: string };
export async function getOdds(sport = "soccer") {
  const r = await fetch(`/api/odds?sport=${encodeURIComponent(sport)}`);
  return r.json();
}
export async function findValue(lines: BookLine[], myProb?: number) {
  const r = await fetch(`/api/value`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines, myProb })});
  return r.json();
}
export async function findArb(outcomes: BookLine[]) {
  const r = await fetch(`/api/arbs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcomes })});
  return r.json();
}
