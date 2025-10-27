import SmartLogo from "./SmartLogo";

export function Header({
  sport, aiOn, processing, message,
  onUploadChange, onPaste, onAiSuggest, onSample, onClear, onToggleAI
}: {
  sport: string; aiOn: boolean; processing: boolean; message: string|null;
  onUploadChange: (e: React.ChangeEvent<HTMLInputElement>)=>void;
  onPaste: ()=>void; onAiSuggest: ()=>void; onSample: ()=>void; onClear: ()=>void; onToggleAI: ()=>void;
}) {
  return (
    <header className="px-4 py-4 border-b border-neutral-800">
      <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-3">
          <SmartLogo className="w-9 h-9" />
          <div>
            <h1 className="text-[18px] font-semibold">AI Sports Betting Assistant</h1>
            <div className="text-[11px] opacity-70">{aiOn ? "AI: ON" : "AI: OFF"} • Sport: {sport}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={onUploadChange} />
            Upload Screenshot
          </label>
          <button onClick={onPaste} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">Paste</button>
          <button onClick={onAiSuggest} disabled={!aiOn} className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50">AI Suggest</button>
          <button onClick={onSample} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">+ Sample Leg</button>
          <button onClick={onClear} className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500">Clear</button>
          <button onClick={onToggleAI} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">Toggle AI</button>
        </div>
      </div>
      {processing && <div className="mt-3 text-[12px] opacity-70">Processing…</div>}
      {message && <div className="mt-2 text-[12px] text-neutral-300">{message}</div>}
    </header>
  );
}
