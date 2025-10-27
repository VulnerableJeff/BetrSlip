import React, { useRef, useState } from "react";
import { ocrImage, quickParse } from "../lib/ocr";
import Modal from "./Modal";

export default function OneClick({
  league, live, onOCR
}:{league:string; live:boolean; onOCR:(rows:any[])=>void;}){

  const [wager,setWager]=useState("50");
  const [file,setFile]=useState<File|null>(null);
  const [open,setOpen]=useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [legs,setLegs]=useState<any[]>([]);

  const keypad = ["1","2","3","4","5","6","7","8","9","←","0","C"];

  async function run(){
    let rows:any[]=[];
    if(file){
      const text = await ocrImage(file).catch(()=> "");
      rows = quickParse(text || "");
      onOCR(rows);
    }else{
      rows = quickParse(""); // demo
      onOCR(rows);
    }
    // demo legs
    setLegs(rows.slice(0,2).map(r=>({ label:r.title, odds:r.odds })));
    setOpen(true);
  }

  function tapKey(k:string){
    if(k==="C") return setWager("");
    if(k==="←") return setWager(wager.slice(0,-1));
    setWager((wager||"")+k);
  }

  const addAmounts=[20,50,100];

  return (
    <>
      <div className="border border-[rgba(255,255,255,0.1)] rounded-2xl p-3 mb-4">
        <div className="text-sm mb-2">🖼️ Upload a slip or tap Paste</div>
        <div className="flex gap-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
                 onChange={e=>setFile(e.target.files?.[0]||null)}/>
          <button className="btn" onClick={()=>inputRef.current?.click()}>Upload</button>
          <div className="chip">{file? file.name : "No file"}</div>
        </div>
      </div>

      <div>
        <div className="text-sm mb-2">🟩 Wager <span className="text-[var(--muted)]">tap to add</span></div>
        <div className="flex gap-2 mb-2">
          {addAmounts.map(a=>(
            <button key={a} className="chip" onClick={()=>setWager(String(Number(wager||0)+a))}>⚡ +${a}</button>
          ))}
          <input className="input w-24 text-center" value={wager} onChange={e=>setWager(e.target.value)}/>
        </div>

        <div className="kb mb-4">
          {["1","2","3","4","5","6","7","8","9","←","0","C"].map(k=>(
            <button key={k} onClick={()=>tapKey(k)}>{k}</button>
          ))}
        </div>

        <button className="btn-primary" onClick={run}>
          Straight to Betslip →
        </button>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)}>
        <div className="space-y-3">
          {legs.map((l,i)=>(
            <div key={i} className="rounded-xl border border-[rgba(255,255,255,0.1)] p-3 bg-[var(--panel-2)]">
              <div className="text-[13px] text-[var(--muted)]">-105 • Hit ~57%</div>
              <div className="font-semibold">{l.label}</div>
            </div>
          ))}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-3 bg-[var(--panel-2)]">
            <div className="text-[13px] text-[var(--muted)]">🟩 Stake</div>
            <div className="font-semibold">${Number(wager||0).toFixed(2)}</div>
            <div className="text-[13px] text-[var(--muted)] mt-1">💰 Potential Payout <span className="font-semibold">${
              (Number(wager||0)*2.19).toFixed(2)
            } (2.19x)</span></div>
          </div>
          <button className="btn-primary" onClick={()=>setOpen(false)}>Straight to Betslip →</button>
        </div>
      </Modal>
    </>
  );
}
