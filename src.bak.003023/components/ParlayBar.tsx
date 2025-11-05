import React from "react";
import { calcParlay, type ParlayResponse } from "../api/parlay";

type Leg = { label?: string; odds?: number; prob?: number; league?: string };

function fmtPct(x?: number) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${Math.round(x * 100)}%`;
}
function fmtAmerican(x?: number) {
  if (x == null || Number.isNaN(x)) return "—";
  const s = x > 0 ? `+${Math.round(x)}` : `${Math.round(x)}`;
  return s;
}
function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function ParlayBar({ legs }: { legs: Leg[] }) {
  const [data, setData] = React.useState<ParlayResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Debounce so we don't spam the server while user is editing
  const debouncedLegs = useDebounce(legs, 250);

  React.useEffect(() => {
    let canceled = false;

    async function run() {
      if (!debouncedLegs?.length) {
        setData(null);
        setErr(null);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const minimal = debouncedLegs.map((l) => ({
          odds: typeof l.odds === "number" ? l.odds : undefined,
          prob: typeof l.prob === "number" ? l.prob : undefined,
        }));
        const out = await calcParlay(minimal);
        if (!canceled) setData(out);
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "Failed to fetch parlay.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [debouncedLegs]);

  return (
    <div className="mt-3 rounded-xl bg-gray-900/70 border border-gray-800 px-4 py-3 text-sm text-white/90">
      <div className="flex items-center gap-3 justify-between">
        <div className="font-semibold">AI Parlay Probability</div>

        <div className="flex items-center gap-3">
          <Badge label="Win %" value={fmtPct(data?.parlayProb)} loading={loading} />
          <Badge label="Fair" value={fmtAmerican(data?.fairAmerican)} loading={loading} />
          <Badge label="Kelly" value={fmtPct(data?.stakePct)} loading={loading} />
          <Badge
            label="Edge"
            value={data ? `${Math.round((data.edge ?? 0) * 100)}%` : "—"}
            loading={loading}
          />
        </div>
      </div>

      {err && (
        <div className="mt-2 text-red-400 text-xs">
          {err}
        </div>
      )}

      {!err && !loading && !data && (
        <div className="mt-2 text-white/70 text-xs">
          Add legs with odds or model probabilities to compute the parlay.
        </div>
      )}
    </div>
  );
}

function Badge({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div
      className={cls(
        "rounded-md px-2 py-1 border",
        loading ? "opacity-60" : "opacity-100",
        "border-gray-700 bg-gray-800/70"
      )}
      title={label}
    >
      <span className="text-[11px] text-white/60 mr-1">{label}</span>
      <span className="font-semibold">{loading ? "…" : value}</span>
    </div>
  );
}

function useDebounce<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
