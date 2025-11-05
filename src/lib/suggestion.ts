import { calcParlay } from "../api/parlay";

export async function suggestStakeForLegs(legs: { odds?: number; prob?: number }[]) {
  const result = await calcParlay(legs);
  // Simple rule: if stakePct > 0.1 then suggest it
  return {
    stakePct: result.stakePct,
    edge: result.edge,
    fairAmerican: result.fairAmerican,
  };
}
