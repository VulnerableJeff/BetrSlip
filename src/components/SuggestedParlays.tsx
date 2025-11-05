import React from "react";
import { fetchSuggestedGames, SuggestedGame } from "../api/suggest";

type Props = {
  onAdd: (leg: { label: string; odds?: number; prob?: number }) => void;
};

function americanToProb(american: number): number {
  if (american >= 100)  return 100 / (american + 100);
  if (american <= -100) return -american / (-american + 100);
  return 0;
}

export default function SuggestedParlays({ onAdd }: Props) {
  const [games, setGames] = React.useState<SuggestedGame[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchSuggestedGames();
        setGames(rows);
      } catch (e:any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mt-6 rounded-xl bg-gray-900/60 border border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white/90 font-semibold">AI Suggested Games (85%+)</h3>
        {loading && <span className="text-xs text-white/50">Loading…</span>}
      </div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      <div className="mt-3 space-y-3">
        {games.map(g => (
          <div key={g.id} className="bg-gray-800/60 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-white/90 text-sm">{g.away} @ {g.home}</div>
              <div className="text-white/60 text-xs">
                {new Date(g.commenceTime).toLocaleString()} • {g.sport.toUpperCase()} • {g.book ?? "Book"}
              </div>
              <div className="text-white/70 text-xs mt-1">
                Fav odds: {g.bestAmerican > 0 ? `+${g.bestAmerican}` : g.bestAmerican} •
                Implied: {(g.impliedProb*100).toFixed(1)}%
              </div>
            </div>
            <button
              onClick={() =>
                onAdd({
                  label: `${g.away} @ ${g.home}`,
                  odds: g.bestAmerican,
                  prob: americanToProb(g.bestAmerican),
                })
              }
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              Add to Betslip
            </button>
          </div>
        ))}
        {!loading && games.length === 0 && !error && (
          <div className="text-white/60 text-sm">No 85%+ games available right now.</div>
        )}
      </div>
    </div>
  );
}
