export default function ParlayBuilder() {
  return (
    <div className="rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🧩</span>
        <h2 className="font-semibold">Parlay Builder</h2>
        <span className="ml-auto text-[12px] opacity-60">Detected: —</span>
      </div>
      <p className="text-[13px] opacity-70 mt-2">Add/remove legs below; your implied chance updates live.</p>
    </div>
  );
}
