export function americanToProb(odds: number): number {
  if (!isFinite(odds) || odds === 0) return 0.5;
  return odds > 0 ? 100 / (odds + 100) : -odds / (-odds + 100);
}

export function probToAmerican(prob: number): number {
  const dec = 1 / prob;
  return dec >= 2 ? Math.round((dec - 1) * 100) : Math.round(-100 / (dec - 1));
}

export function kellyFraction(p: number, b: number): number {
  const q = 1 - p;
  const f = (b * p - q) / b;
  return Math.max(0, Math.min(1, f));
}

export function calcParlay(legs: { prob?: number; odds?: number }[]) {
  const probs = legs.map(l =>
    typeof l.prob === "number"
      ? l.prob
      : typeof l.odds === "number"
      ? americanToProb(l.odds)
      : 0.5
  );

  const parlayProb = probs.reduce((a, p) => a * p, 1);
  const fairDecimal = parlayProb > 0 ? 1 / parlayProb : Infinity;
  const fairAmerican = probToAmerican(parlayProb);

  const edge = fairDecimal > 1.1 ? parlayProb * fairDecimal - 1 : 0;
  const stakePct = kellyFraction(parlayProb, fairDecimal - 1);

  return { parlayProb, fairDecimal, fairAmerican, stakePct, edge };
}
