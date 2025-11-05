import React from "react";
export type AISuggestion = {
  label: string;
  odds?: number | string;
  sport?: string;
  confidence?: number;
  source?: "ai" | "ocr" | "manual" | string;
};
export default function AIInsightsPanel({
  items, onUse, onClear
}: { items: AISuggestion[]; onUse:(s:AISuggestion)=>void; onClear?:()=>void }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold">🤖 AI Insights</h3>
        <div className="flex items-center gap-2">
          <span className="text-[12px] opacity-70">{items.length} suggestions</span>
          {onClear && items.length>0 &&
            <button className="text-[12px] px-2 py-1 rounded-md border border-white/10 hover:bg-white/[0.06]" onClick={onClear}>Clear</button>}
        </div>
      </div>
      {items.length===0 ? (
        <p className="text-[13px] opacity-70">No suggestions yet. Upload a slip or tap “AI Suggest”.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s, i)=>(
            <li key={i} className="flex items-center justify-between rounded-lg border border-white/10 p-2">
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium">{s.label}</div>
                <div className="text-[12px] opacity-70">
                  {s.sport ? `${s.sport} · ` : ""}{s.odds!==undefined?`Odds ${s.odds}`:"No odds"}
                  {typeof s.confidence==="number"?` · Conf ${(s.confidence*100).toFixed(0)}%`:""}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.source && <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10">{String(s.source).toUpperCase()}</span>}
                <button className="text-[12px] px-3 py-1 rounded-md border border-white/10 hover:bg-white/[0.06]" onClick={()=>onUse(s)}>Use</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
