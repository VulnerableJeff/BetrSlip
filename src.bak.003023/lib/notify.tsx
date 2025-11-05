import { useEffect, useState } from "react";

type Toast = { id: number; type: "info" | "success" | "error"; text: string };
let pushToast: ((t: Toast) => void) | null = null;

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      setToasts((xs) => [...xs, t]);
      setTimeout(() => setToasts((xs) => xs.filter((y) => y.id !== t.id)), 2600);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-3 py-2 rounded-lg text-sm shadow-lg ${
            t.type === "error"
              ? "bg-rose-600"
              : t.type === "success"
              ? "bg-emerald-600"
              : "bg-slate-700"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

function send(type: Toast["type"]) {
  return (text: string) =>
    pushToast?.({ id: Date.now() + Math.random(), type, text });
}

export const notify = {
  info: send("info"),
  success: send("success"),
  error: send("error"),
};
