import React, { useRef, useState } from "react";

export default function UploadButton({
  onAdded,
  setErr,
  disabled
}: {
  onAdded: (legs: {label:string; odds:number; prob?:number}[]) => void;
  setErr: (s: string|null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", f); // <-- field name API expects
      const r = await fetch("/api/ocr", { method: "POST", body: fd });
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await r.text();
        throw new Error(`Expected JSON, got: ${ct} — ${txt.slice(0,120)}…`);
      }
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "OCR failed");
      if (Array.isArray(j.legs)) onAdded(j.legs);
    } catch (err:any) {
      setErr(String(err.message || err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // important: no `capture` attribute, so Android shows gallery picker
        className="hidden"
        onChange={onFile}
      />
      <button
        onClick={pick}
        disabled={busy || disabled}
        className="px-5 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 disabled:opacity-60"
      >
        {busy ? "Analyzing…" : "Upload Screenshot"}
      </button>
    </>
  );
}
