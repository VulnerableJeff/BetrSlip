export default function ParlayBlueprint({ pct }: { pct: number | null }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">📐</span>
        <h2 className="font-semibold">Parlay Blueprint</h2>
        <button className="ml-auto text-[12px] opacity-70">Hide</button>
      </div>
      <p className="text-[13px] opacity-70 mt-2">
        Implied win chance (rough): {pct==null ? "—" : `${pct}%`}. Add or remove legs to adjust your blueprint.
      </p>
    </div>
  );
}
