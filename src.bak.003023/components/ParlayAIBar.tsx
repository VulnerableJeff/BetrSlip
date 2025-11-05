import { useEffect, useState } from "react";
import { fetchSuggestions } from "../lib/api";

type Props = {
  sport: string;
  onAdd?: (leg: { label: string; odds: number; prob?: number; league?: string }) => void;
};

export default function ParlayAIBar({ sport, onAdd }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);
    fetchSuggestions(sport)
      .then((data) => mounted && setItems(data))
      .catch((e) => mounted && setErr(e.message || "failed"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [sport]);

  return (
    <section className="mt-6 rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">AI Suggestions</h3>
        {loading && <span className="text-xs text-white/60">loading…</span>}
      </div>

      {err && <div className="text-sm text-red-400">Error: {err}</div>}

      {!loading && !err && items.length === 0 && (
        <div className="text-white/70 text-sm">No suggestions right now. Try “AI Suggest”.</div>
      )}

      <div className="grid gap-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/70">{it.league}</div>
                <div className="text-base font-semibold">{it.title}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700">
                  {it.odds > 0 ? `+${it.odds}` : it.odds}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 border border-emerald-700">
                  Rating {Math.round(it.rating * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-white/70 mt-2">{it.note}</div>

            {onAdd && (
              <button
                onClick={() =>
                  onAdd({
                    label: `${it.league} · ${it.title}`,
                    odds: it.odds,
                    prob: it.implied, // we can refine later
                    league: it.league,
                  })
                }
                className="mt-3 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5"
              >
                Add to Betslip
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
