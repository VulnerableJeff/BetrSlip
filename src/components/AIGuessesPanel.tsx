import React from "react";
import { aiExplain, AI_STATUS } from "../lib/ai";

export type AIGuess = { label:string; odds:number; prob?:number; conf?:number };

export default function AIGuessesPanel({
  suggestions, onAdd, note
}:{
  suggestions: AIGuess[];
  onAdd: (g:AIGuess)=>void;
  note: string;
}){
  const AI_ON = AI_STATUS.on;
  if (!suggestions?.length) return null;

  async function explain(s:AIGuess){
    const why = await aiExplain(s.label, s.odds, note);
    alert(why || "No explanation available.");
  }

  return (
    <section className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">🤖 AI Best Guesses</h3>
        <span className={"text-[11px] px-2 py-0.5 rounded-full border "+(AI_ON?"border-emerald-400 text-emerald-300":"border-red-400 text-red-300")}>
          AI: {AI_ON ? "ON" : "OFF"}
        </span>
      </div>

      <div className="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {suggestions.map((s, i)=>(
          <div key={i} className="rounded-lg border border-white/10 p-3">
            <div className="font-medium text-[14px]">{s.label}</div>
            <div className="text-[12px] opacity-75 mt-0.5">
              Odds {s.odds>0?`+${s.odds}`:s.odds}
              {typeof s.prob==="number" ? ` • Hit ~${Math.round((s.prob||0)*100)}%` : ""}
              {typeof s.conf==="number" ? ` • Conf ${Math.round((s.conf||0)*100)}%` : ""}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={()=>onAdd(s)} className="rounded-md px-3 py-1.5 text-[13px] border border-white/15">Add</button>
              <button onClick={()=>explain(s)} className="rounded-md px-3 py-1.5 text-[13px] border border-white/15">Explain</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
