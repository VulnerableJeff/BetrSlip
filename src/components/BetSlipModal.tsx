import React from "react";

export function BetSlipModal({
  open, onClose, stake, legs, payoutX
}:{ open:boolean; onClose:()=>void; stake:number; legs:{label:string; odds:number; prob:number}[]; payoutX:number }) {
  if(!open) return null;
  const potential = +(stake * payoutX).toFixed(2);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 backdrop-blur-sm">
      <div className="w-[92%] max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] opacity-70">🎟️ One-Click Betslip</div>
          <button onClick={onClose} className="text-[18px] px-2">✖</button>
        </div>
        <div className="mt-2 space-y-2 max-h-[45vh] overflow-auto">
          {legs.length===0 && <div className="text-[13px] opacity-70">No legs selected yet — add from suggester/best guesses.</div>}
          {legs.map((l,i)=>(
            <div key={i} className="rounded-xl border border-white/10 p-3 bg-white/[0.03]">
              <div className="text-[12px] opacity-70">{l.odds>0?`+${l.odds}`:l.odds} • Hit ~{Math.round(l.prob*100)}%</div>
              <div className="font-medium">{l.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/10 p-3 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="text-[13px]">💵 Stake</div>
            <div className="text-[13px] font-semibold">${stake.toFixed(2)}</div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-[13px]">💰 Potential Payout</div>
            <div className="text-[13px] font-semibold">${potential.toFixed(2)} <span className="opacity-60">({payoutX.toFixed(2)}x)</span></div>
          </div>
        </div>
        <button
          className="mt-3 w-full rounded-xl bg-emerald-500 text-black py-2 font-semibold active:scale-[0.99]"
          onClick={()=>{ alert("Demo: would deep-link to book with slip prefilled."); onClose(); }}
        >
          Straight to Betslip →
        </button>
      </div>
    </div>
  );
}
