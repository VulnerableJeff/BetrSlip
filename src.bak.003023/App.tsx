import { api } from './lib/api';
import React, { useEffect, useMemo, useState } from "react";
import { getSuggest, postOCR, postParlay, type Leg } from "./lib/api";

function americanToProb(odds: number) {
  return odds < 0 ? (-odds)/((-odds)+100) : 100/(odds+100);
}

export default function App() {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [aiOn, setAiOn] = useState(true);
  const [suggest, setSuggest] = useState<Leg[]>([]);
  const [parlay, setParlay] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // recompute parlay on legs change
  useEffect(() => {
    if (!legs.length) { setParlay(null); return; }
    (async () => {
      try {
        const p = await postParlay(legs);
        setParlay(p);
      } catch (e:any) { setError(e.message); }
    })();
  }, [legs]);

  const onAiSuggest = async () => {
    try {
      const { picks } = await getSuggest();
      setSuggest(picks);
    } catch (e:any) {
      setError(e.message);
    }
  };

  const onAddPick = (l: Leg) => setLegs(prev => [...prev, l]);

  const onUpload = async (file: File) => {
    setError(null);
    const b64 = await fileToBase64(file);
    try {
      const { legs: ocrLegs } = await postOCR(b64);
      if (Array.isArray(ocrLegs) && ocrLegs.length) setLegs(prev => [...prev, ...ocrLegs]);
    } catch (e:any) {
      setError(e.message);
    }
  };

  const onClear = () => { setLegs([]); setSuggest([]); setParlay(null); setError(null); };

  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"24px", color:"#e6e6ec", fontFamily:"ui-sans-serif,system-ui"}}>
      <header style={{display:"flex", gap:12, alignItems:"center", marginBottom:16}}>
        <img src="/logo.svg" alt="logo" width={28} height={28}/>
        <div style={{opacity:.85}}>AI: <b style={{color:"#22c55e"}}>{aiOn? "ON":"OFF"}</b> · Sport: Unknown</div>
      </header>

      <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
        <button onClick={()=>pickAndUpload(onUpload)} style={btnDark}>Upload Screenshot</button>
        <button onClick={onClear} style={btnDanger}>Clear</button>
        <button onClick={()=>onAddPick({label:"Value Pick A", prob:0.62, odds:+140})} style={btnPrimary} className="col-span-2">+ Sample Leg</button>
        <button onClick={()=>setAiOn(v=>!v)} style={btnDark}>Toggle AI</button>
        <div></div>
      </div>

      <Card title="Your Betslip">
        {legs.length===0 && <div>No legs yet. Upload a screenshot or click + Sample Leg.</div>}
        {legs.map((l, i)=>(
          <Row key={i}
               left={<div>{l.label ?? "Leg"} {l.prob ? `(${Math.round(l.prob*100)}%)` : (l.odds!==undefined ? `(odds ${l.odds})`:"")}</div>}
               right={<button style={pill} onClick={()=>setLegs(prev=>prev.filter((_,idx)=>idx!==i))}>Remove</button>}
          />
        ))}
      </Card>

      <Card title="AI Tools" action={<button style={btnPurple} onClick={onAiSuggest}>AI Suggest</button>}>
        {suggest.length===0 && <div>Run “AI Suggest”.</div>}
        {suggest.map((l, i)=>(
          <Row key={i}
               left={<div>{l.label} ({Math.round((l.prob ?? americanToProb(l.odds ?? -110))*100)}%)</div>}
               right={<button style={pillBlue} onClick={()=>onAddPick(l)}>Add to Betslip</button>}
          />
        ))}
      </Card>

      <Card title="Parlay Summary">
        {!parlay && <div>Add at least one leg to see parlay probability.</div>}
        {parlay && (
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:12}}>
            <Stat label="Win %" value={`${parlay.winPct}%`}/>
            <Stat label="Fair Decimal" value={parlay.fairDecimal}/>
            <Stat label="Fair American" value={parlay.fairAmerican > 0 ? `+${parlay.fairAmerican}` : parlay.fairAmerican}/>
            <Stat label="Kelly %" value={`${parlay.kellyPct}%`}/>
          </div>
        )}
      </Card>

      {error && <div style={{marginTop:12, color:"#fda4af"}}>Error: {error}</div>}
    </div>
  );
}

function Card({title, action, children}:{title:string; action?:React.ReactNode; children:React.ReactNode}) {
  return (
    <div style={{background:"#10131a", borderRadius:14, padding:16, marginTop:16, border:"1px solid #232838"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
        <div style={{fontWeight:700, fontSize:20}}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}
function Row({left, right}:{left:React.ReactNode; right:React.ReactNode}) {
  return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0b0e14", border:"1px solid #232838", borderRadius:12, padding:"12px 14px", margin:"8px 0"}}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
function Stat({label, value}:{label:string; value:any}) {
  return (
    <div style={{background:"#0b0e14", border:"1px solid #232838", borderRadius:12, padding:"14px 16px"}}>
      <div style={{opacity:.7, fontSize:12, marginBottom:6}}>{label}</div>
      <div style={{fontSize:22, fontWeight:800}}>{value}</div>
    </div>
  );
}

// --- UI helpers ---
const btnBase: React.CSSProperties = {padding:"14px 16px", borderRadius:12, border:"1px solid #232838", fontWeight:700, textAlign:"center"};
const btnDark: React.CSSProperties = {...btnBase, background:"#0b0e14"};
const btnDanger: React.CSSProperties = {...btnBase, background:"#7f1d1d"};
const btnPrimary: React.CSSProperties = {...btnBase, background:"#1e40af", gridColumn:"1 / -1"};
const btnPurple: React.CSSProperties = {...btnBase, background:"#7c3aed"};
const pill: React.CSSProperties = {padding:"6px 10px", borderRadius:999, background:"#1f2937", border:"1px solid #334155"};
const pillBlue: React.CSSProperties = {padding:"6px 10px", borderRadius:999, background:"#1d4ed8", border:"1px solid #334155", color:"white"};

function pickAndUpload(cb:(f:File)=>void) {
  const i = document.createElement("input");
  i.type = "file";
  i.accept = "image/*";
  i.onchange = () => {
    const f = i.files?.[0]; if (f) cb(f);
  };
  i.click();
}
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
