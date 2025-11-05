export const fmtPct = (p?: number, d = 0) =>
  Number.isFinite(p as number) ? `${(100 * (p as number)).toFixed(d)}%` : "—";
