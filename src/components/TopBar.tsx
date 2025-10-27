import React from "react";

type Props = {
  live: boolean;
  setLive: (v:boolean)=>void;
  league: string;
  setLeague: (v:string)=>void;
};

const leagues = ["NFL","NBA","MLB","UFC"];

export default function TopBar({ live, setLive, league, setLeague }: Props) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur bg-black/35 border-b border-white/10">
      <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 grid place-content-center font-black text-black">BS</div>
          <div className="text-lg font-extrabold">BetrSlip</div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {leagues.map(l => (
            <button
              key={l}
              onClick={()=>setLeague(l)}
              className={`chip ${league===l ? "ring-2 ring-[var(--accent)]" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Live badge like your old UI */}
        <button
          onClick={()=>setLive(!live)}
          aria-label="Toggle live"
          className="badge select-none"
          style={{ background: "var(--accent)" }}
        >
          Live: <span className="font-black">{live ? "ON" : "OFF"}</span>
        </button>

        {/* Share (kept for parity) */}
        <button className="btn btn-soft">Share</button>
      </div>
    </div>
  );
}
