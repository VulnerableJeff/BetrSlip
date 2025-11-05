import React from "react";
import { suggestStakeForLegs } from "../lib/suggestion";

type Leg = { odds?: number; prob?: number; label?: string };

export default function LegCard({ leg, priorLegs }: { leg: Leg; priorLegs: Leg[] }) {
  const [suggestion, setSuggestion] = React.useState<{ stakePct: number; edge: number; fairAmerican: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      const legs = [...priorLegs, leg];
      const s = await suggestStakeForLegs(legs);
      setSuggestion(s);
    })();
  }, [leg, priorLegs]);

  return (
    <div className="leg-card">
      <div>{leg.label}</div>
      <div>Odds: {leg.odds ?? "—"}</div>
      <div>Model Prob: {leg.prob != null ? `${(leg.prob*100).toFixed(1)}%` : "—"}</div>
      {suggestion && (
        <div className="suggestion bg-gray-800 text-white p-2 rounded">
          Suggested stake: {(suggestion.stakePct*100).toFixed(1)}%  
          Fair odds: {suggestion.fairAmerican > 0 ? `+${suggestion.fairAmerican}` : suggestion.fairAmerican}  
          Edge: {(suggestion.edge*100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
