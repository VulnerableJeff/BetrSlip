import React, { useState } from "react";
import { aiExplain, AI_STATUS } from "../lib/ai";

export default function ParlayAIBar({
  legs, setLegs, note
}:{
  legs:{label:string; odds:number; prob:number; conf?:number}[];
  setLegs:(fn:(x:any)=>any)=>void;
  note:string;
}){
  const [busy, setBusy] = useState<number|null>(null);
  const AI_ON = AI_STATUS.on;

  async function explain(i:number){
    const L = legs[i];
    if(!L) return;
    setBusy(i);
    const why = await aiExplain(L.label, L.odds, note);
    setBusy(null);
    alert(why || "No explanation available.");
  }

  if (!legs?.length) return null;

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-2">
      <div className="text-[12px] opacity-70 mb-1">Parlay AI view</div>
      <div className="flex flex-col gap-1">
        {legs.map((l, i)=>(
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="text-[13px] truncate">
              {l.label} <span className="opacity-60">({l.odds>0?`+${l.odds}`:l.odds})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] opacity-80">
                Hit ~{Math.round((l.prob||0)*100)}%{typeof l.conf==="number" ? ` • Conf ${Math.round((l.conf||0)*100)}%` : ""}
              </span>
              <button
                onClick={()=>explain(i)}
                disabled={!AI_ON || busy!==null}
                className="text-[11px] rounded-md px-2 py-1 border border-white/15"
              >Explain</button>
              <button
                onClick={()=>setLegs((L:any)=>L.filter((_:any,idx:number)=>idx!==i))}
                className="text-[11px] rounded-md px-2 py-1 border border-white/15"
              >Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
