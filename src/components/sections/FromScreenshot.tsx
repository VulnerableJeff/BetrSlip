export default function FromScreenshot() {
  return (
    <div className="rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🖼️</span>
        <h2 className="font-semibold">From Screenshot — Best Guesses</h2>
        <button className="ml-auto text-[12px] opacity-70">Hide</button>
      </div>
      <p className="text-[13px] opacity-70 mt-2">Upload a slip or scoreboard; we’ll show detected legs and sport.</p>
    </div>
  );
}
