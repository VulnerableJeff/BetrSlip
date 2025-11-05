import React, { useState } from "react";

type Leg = {
  label: string;
  odds: number;
  prob?: number;
};

type LegCardProps = {
  leg: Leg;
  onRemove: () => void;
};

const formatOdds = (odds: number) => (odds > 0 ? `+${odds}` : odds.toString());
const formatWinPct = (prob?: number) =>
  typeof prob === "number" && Number.isFinite(prob)
    ? `${(prob * 100).toFixed(0)}%`
    : "–";

const LegCard: React.FC<LegCardProps> = ({ leg, onRemove }) => {
  const [open, setOpen] = useState(false);

  const oddsText = formatOdds(leg.odds);
  const winText = formatWinPct(leg.prob);

  return (
    <>
      {/* Main card row */}
      <div
        className="rounded-3xl bg-slate-800/90 border border-slate-700/60 px-4 py-3 flex items-center gap-3 shadow-sm hover:border-purple-400/70 hover:shadow-lg transition cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="w-2 h-2 rounded-full bg-purple-400" />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-50 truncate">
            {leg.label}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-200 tracking-wide">
              ODDS {oddsText}
            </span>
            {leg.prob !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold tracking-wide">
                WIN % {winText}
              </span>
            )}
          </div>
        </div>

        <button
          className="ml-3 px-3 py-1.5 rounded-full bg-slate-900/80 text-slate-200 text-xs font-medium hover:bg-slate-700 transition shrink-0 whitespace-nowrap"
          onClick={(e) => {
            e.stopPropagation(); // don't open the details sheet
            onRemove();
          }}
        >
          Remove
        </button>
      </div>

      {/* Bottom sheet details */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setOpen(false)} // click backdrop to close
        >
          <div
            className="w-full sm:max-w-md bg-slate-900/90 backdrop-blur-xl p-5 rounded-t-3xl sm:rounded-3xl shadow-xl"
            onClick={(e) => e.stopPropagation()} // clicks inside do NOT close
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-50">
                Leg details
              </h3>
              <button
                className="text-sm text-slate-400 hover:text-slate-200"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mb-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                Selection
              </p>
              <p className="text-base text-slate-50">{leg.label}</p>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Odds
                </p>
                <p className="text-base font-semibold text-slate-50">
                  {oddsText}
                </p>
              </div>

              {leg.prob !== undefined && (
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    Win probability
                  </p>
                  <p className="text-base font-semibold text-emerald-400">
                    {winText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegCard;
