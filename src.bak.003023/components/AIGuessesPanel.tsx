import React from "react";

export default function AIGuessesPanel({ lines }: { lines: string[] }) {
  if (!lines?.length) return null;
  return (
    <div className="mt-2 space-y-1">
      {lines.map((line, i) => (
        <div key={i} className="text-[13px] text-emerald-300/90 flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center w-4 h-4">
            <span className="absolute inline-flex w-4 h-4 rounded-full animate-ping bg-emerald-400/30" />
            <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-400/80" />
          </span>
          <span className="flex-1">{line}</span>
        </div>
      ))}
    </div>
  );
}
