import React from "react";
export default function Modal({open,onClose,children}:{open:boolean;onClose:()=>void;children:React.ReactNode;}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md card p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold">One-Click Betslip</div>
          <button onClick={onClose} className="chip">✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}
