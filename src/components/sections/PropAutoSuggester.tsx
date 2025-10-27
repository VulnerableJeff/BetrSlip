export default function PropAutoSuggester({ blurb }: { blurb: string | null }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="font-semibold">Prop Auto-Suggester</h2>
        <button className="ml-auto text-[12px] opacity-70">Hide</button>
      </div>
      <div className="text-[13px] mt-2 whitespace-pre-wrap">{blurb ?? "Tap AI Suggest to generate ideas."}</div>
    </div>
  );
}
