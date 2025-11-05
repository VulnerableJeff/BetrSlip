import React from "react";

export function QuickStake({
  stake, setStake
}:{ stake:number; setStake:(v:number)=>void }) {
  const presets = [20,50,100];
  return (
    <div className="rounded-xl border border-white/10 p-3 bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="text-[12px] opacity-70">💵 Wager</div>
        <div className="text-[12px] opacity-70">tap to add</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={()=>setStake(stake + p)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[13px] hover:bg-white/[0.06]"
          >
            ⚡ +${p}
          </button>
        ))}
        <input
          type="number"
          value={stake}
          onChange={(e)=>setStake(parseFloat(e.target.value||"0"))}
          className="ml-auto w-28 rounded-md bg-black/30 border border-white/10 px-2 py-1 outline-none text-[13px]"
          placeholder="0.00"
        />
      </div>

      {/* keypad */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[1,2,3,4,5,6,7,8,9,"←",0,"C"].map((k:any, i:number)=>(
          <button
            key={i}
            onClick={()=>{
              if(k==="C") return setStake(0);
              if(k==="←"){
                const s=String(Math.floor(stake*100));
                const trimmed=s.slice(0,-1) || "0";
                return setStake(parseFloat(trimmed)/100);
              }
              const s=String(Math.floor(stake*100))+String(k);
              setStake(parseFloat(s)/100);
            }}
            className="rounded-lg border border-white/10 py-3 text-[16px] bg-white/[0.02] active:scale-[0.99]"
            aria-label={"key-"+k}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
