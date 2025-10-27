import React from "react";
export default function ProcessingOverlay({ active=false, message="Working..." }:{active?:boolean; message?:string}) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur">
      <div className="rounded-xl border border-white/10 bg-neutral-900 px-5 py-4 text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        <div className="mt-2 text-white/90 text-sm">{message}</div>
      </div>
    </div>
  );
}
