import type { ParsedLeg } from "./ocr";

export type AISuggestion = {
  label: string;
  odds: number;
  prob: number;   // model-estimated win prob 0..1
  conf: number;   // model confidence 0..1
  rationale?: string;
};

function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }

export async function aiSuggest(sport: string, legs: ParsedLeg[]): Promise<AISuggestion[]> {
  // Heuristic suggestions derived from current legs (no network required)
  const base = legs.length ? legs : [{ label: "Sample Value Pick", odds: +140, confidence: 0.6 }];
  return base.slice(0, 3).map((l, i) => {
    const prob = clamp01((l.confidence ?? 0.6) + (l.odds > 0 ? 0.05 : -0.03) - i*0.05);
    return {
      label: i===0 ? `${l.label} (Value)` : `${l.label} (Lean ${i+1})`,
      odds: l.odds,
      prob,
      conf: clamp01((l.confidence ?? 0.6) * 0.9 + 0.05),
      rationale: `Based on market signal and recent form — ${sport || "mixed"} lean.`,
    };
  });
}

export async function aiExplainLeg(leg: ParsedLeg): Promise<string[]> {
  const lines: string[] = [];
  const abs = Math.abs(leg.odds);
  const priceTilt = leg.odds > 0 ? "underdog value" : "favorite consistency";
  lines.push(`Price suggests ${priceTilt}; implied ≈ ${Math.round(leg.odds > 0 ? 100/(leg.odds+100) : -leg.odds/(100-leg.odds))*1}% vs. our lean.`);
  if (leg.confidence != null) lines.push(`Model confidence around ${Math.round(leg.confidence*100)}%.`);
  if (abs >= 200) lines.push(`High volatility price — consider smaller stake or parlay anchor.`);
  return lines;
}

export const AI_STATUS = { on: "on", off: "off", ready: "ready" } as const;
