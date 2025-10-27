import React, { useState } from "react";
import { aiSuggest, aiExplain, AI_STATUS, type AISuggestion } from "../lib/ai";

export default function AITools({
  legs, setLegs, note, ocrText, detectedLeague, onSuggestions
}:{
  legs:{label:string; odds:number; prob:number; conf?:number}[];
  setLegs:(next:any)=>void;
  note:string;
  ocrText:string;
  detectedLeague: string|null;
  onSuggestions?:(s:AISuggestion[])=>void;
}){
  const [busy, setBusy] = useState(false);
  const [sug, setSug] = useState<AISuggestion[]>([]);
  const AI_ON = AI_STATUS.on;

  async function runSuggest(){
    setBusy(true);
    const out = await aiSuggest({ ocrText, note, league: detectedLeague });
    setSug(out || []);
    if (onSuggestions) onSuggestions(out || []);
    setBusy(false);
  }

  async function explainLeg(label:string, odds:number){
    if(!AI_ON) return alert("AI is OFF (missing key).");
    setBusy(true);
    const why = await aiExplain(label, odds, note);
    setBusy(false);
    alert(why || "No explanation available.");
  }

  function addAll(){
    setLegs((L:any)=>[
      ...L,
      ...sug.map(s=>({ label:s.label, odds:s.odds, prob:Math.max(0,Math.min(1,s.prob||0.5)), conf:s.conf }))
    ]);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mt-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold">🧠 AI Tools</div>
        <span className={"text-[11px] px-2 py-0.5 rounded-full border "+(AI_ON?"border-emerald-400 text-emerald-300":"border-red-400 text-red-300")}>
          AI: {AI_ON?"ON":"OFF"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={runSuggest}
          disabled={!AI_ON||busy}
          className="rounded-lg px-3 py-1.5 text-[13px] bg-[var(--accent,rgba(99,102,241,0.2))] border border-white/10 disabled:opacity-50"
        >AI Suggest</button>

        {sug.length>0 && (
          <button
            onClick={addAll}
            className="rounded-lg px-3 py-1.5 text-[13px] border border-white/15"
          >Add All</button>
        )}
      </div>

      {sug.length>0 && (
        <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sug.map((s,i)=>(
            <div key={i} className="rounded-lg border border-white/10 p-3">
              <div className="font-medium text-[14px]">{s.label}</div>
              <div className="text-[12px] opacity-75 mt-0.5">
                Odds {s.odds>0?`+${s.odds}`:s.odds} • Hit ~{Math.round((s.prob||0)*100)}% • Conf {Math.round((s.conf||0)*100)}%
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={()=>setLegs((L:any)=>[...L, {label:s.label, odds:s.odds, prob:Math.max(0,Math.min(1,s.prob||0.5)), conf:s.conf}])}
                  className="rounded-md px-3 py-1.5 text-[13px] border border-white/15"
                >Add</button>
                <button
                  onClick={()=>explainLeg(s.label, s.odds)}
                  className="rounded-md px-3 py-1.5 text-[13px] border border-white/15"
                  disabled={!AI_ON||busy}
                >Explain</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!AI_ON && <p className="text-[12px] opacity-60 mt-2">Add your key to <code>.env</code> as <code>VITE_OPENAI_API_KEY=sk-...</code> then reload.</p>}
    </div>
  );
}
