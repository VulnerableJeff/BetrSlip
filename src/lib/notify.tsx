import React, { useEffect, useState } from "react";

type Toast = {
  id: number;
  text: string;
  kind: "success" | "error" | "info";
  ttl?: number;
};

let pushToast: ((t: Omit<Toast, "id">) => void) | null = null;
let ctr = 1;

export const notify = {
  success(text: string, ttl = 3500) { pushToast?.({ text, kind: "success", ttl }); },
  error(text: string, ttl = 5000) { pushToast?.({ text, kind: "error", ttl }); },
  info(text: string, ttl = 3500) { pushToast?.({ text, kind: "info", ttl }); },
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    pushToast = (t) => {
      const toast: Toast = { id: ctr++, ...t };
      setItems((xs) => [toast, ...xs]);
      if (t.ttl !== 0) {
        const ttl = t.ttl ?? 4000;
        setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== toast.id)), ttl);
      }
    };
    return () => { pushToast = null; };
  }, []);

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-[9999] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto max-w-[90vw] sm:max-w-sm px-3 py-2 rounded-md shadow-lg text-sm",
            "border backdrop-blur bg-opacity-70",
            t.kind === "success" ? "bg-emerald-600/30 border-emerald-500 text-emerald-100" :
            t.kind === "error"   ? "bg-rose-600/30 border-rose-500 text-rose-100" :
                                   "bg-slate-600/30 border-slate-500 text-slate-100",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            <span className="mt-[2px]">
              {t.kind === "success" ? "✅" : t.kind === "error" ? "⚠️" : "ℹ️"}
            </span>
            <span className="whitespace-pre-wrap">{t.text}</span>
            <button
              className="ml-auto opacity-70 hover:opacity-100"
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
