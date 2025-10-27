import React from "react";
import AIInsightsPanel, { AISuggestion } from "./AIInsightsPanel";

const dedupe = (arr: AISuggestion[]) => {
  const seen = new Set<string>();
  return arr.filter(x=>{
    const k = (x.label||"")+"|"+(x.odds??"")+"|"+(x.sport??"");
    if(seen.has(k)) return false; seen.add(k); return true;
  });
};

export default function AIBridge({ onUse }: { onUse: (s: AISuggestion)=>void }) {
  const [items, setItems] = React.useState<AISuggestion[]>([]);
  React.useEffect(()=>{
    const onMany = (e:any)=>{ const a = Array.isArray(e.detail)? e.detail : []; setItems(p=>dedupe([...p, ...a])); };
    const onOne  = (e:any)=>{ const s = e.detail; if(!s) return; setItems(p=>dedupe([...p, s])); };
    window.addEventListener("ai:insights", onMany as any);
    window.addEventListener("ai:insight",  onOne  as any);
    return ()=>{ window.removeEventListener("ai:insights", onMany as any); window.removeEventListener("ai:insight", onOne as any); }
  },[]);
  return (
    <AIInsightsPanel
      items={items}
      onUse={onUse}
      onClear={()=>setItems([])}
    />
  );
}
