/** American odds ↔ prob/decimal + parlay + Kelly helpers */

export function americanToDecimal(odds: number): number {
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
}

export function americanToProb(odds: number): number {
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}

/** Combine independent legs into a parlay win probability */
export function parlayProb(legs: { odds: number; confidence?: number }[]): number {
  if (!legs.length) return 0;
  return legs.reduce((acc, l) => {
    // Use confidence (0..1) if given, otherwise implied market prob
    const p = typeof l.confidence === "number" ? clamp01(l.confidence) : americanToProb(l.odds);
    return acc * p;
  }, 1);
}

/** Kelly fraction sized to an edge between true p and market odds */
export function kellyFraction(pTrue: number, american: number): number {
  const b = americanToDecimal(american) - 1; // net multiplier
  const q = 1 - pTrue;
  const f = (b * pTrue - q) / b;
  return Math.max(0, Math.min(1, f));
}

/** Suggest unit size using Kelly and bankroll (in dollars) */
export function kellyStake(bankroll: number, pTrue: number, american: number, kellyScale = 0.25): number {
  const f = kellyFraction(pTrue, american) * kellyScale; // quarter Kelly by default
  return round2(bankroll * f);
}

export function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
export function round2(n: number) { return Math.round(n * 100) / 100; }
