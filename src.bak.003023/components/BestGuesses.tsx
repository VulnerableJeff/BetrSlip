import React from "react";

export default function BestGuesses({guesses}:{guesses:any[]}){
  if(!guesses?.length){
    return <div className="text-[13px] text-[var(--muted)]">Upload above to see matches & favorites.</div>;
  }
  return (
    <div className="grid gap-3">
      {guesses.map((g,idx)=>(
        <div key={idx} className="rounded-2xl border border-[rgba(255,255,255,0.1)] p-3 bg-[var(--panel-2)]">
          <div className="text-[12px] text-[var(--muted)] mb-1">{g.sport}</div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{g.title}</div>
              <div className="text-[13px] text-[var(--muted)]">Odds {g.odds} • Hit ~{g.hit}%</div>
            </div>
            <button className="chip">Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}
