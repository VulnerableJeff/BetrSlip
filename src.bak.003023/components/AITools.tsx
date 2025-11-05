import React from "react";
import type { ParsedLeg } from "../lib/ocr";
import { aiSuggest, aiExplainLeg, type AISuggestion } from "../lib/ai";
import { notify } from "../lib/notify";

type Props = {
  legs: ParsedLeg[];
  league: string;
  onAdd: (l: ParsedLeg) => void;
};

export default function AITools({ legs, league, onAdd }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<AISuggestion[]>([]);

  async function runSuggest() {
    try {
      setLoading(true);
      const out = await aiSuggest(league || "Mixed", legs);
      setItems(out);
      notify.success(`AI found ${out.length} ideas`);
    } catch (e) {
      console.error(e);
      notify.error("AI suggestion failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-gray-900 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AI Tools</h3>
        <button onClick={runSuggest} className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500">
          {loading ? "Thinking…" : "AI Suggest"}
        </button>
      </div>

      {!items.length ? (
        <p className="text-sm opacity-70">Run “AI Suggest” to see value leans.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s, i) => (
            <li key={i} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">{s.label}</div>
                <div className="opacity-70">
                  Odds {s.odds>0?`+${s.odds}`:s.odds} • Hit ~{Math.round((s.prob||0)*100)}%
                </div>
                {s.rationale && <div className="text-xs mt-1 opacity-70">{s.rationale}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAdd({ label: s.label, odds: s.odds, confidence: s.prob, sport: league })}
                  className="text-xs px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600"
                >
                  Add to Betslip
                </button>
                <button
                  onClick={async () => {
                    const lines = await aiExplainLeg({ label: s.label, odds: s.odds, confidence: s.prob, sport: league });
                    // Show a short toast; details already appear under each leg from auto-explain
                    if (lines?.length) notify.success(lines.join(" • "));
                  }}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Explain
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
