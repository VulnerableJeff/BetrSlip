export default function OneClick() {
  return (
    <div className="rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚀</span>
        <h2 className="font-semibold">One-Click (Upload → Stake → Go)</h2>
        <span className="ml-auto text-[12px] opacity-60">auto-detects sport</span>
      </div>
      <p className="text-[13px] opacity-70 mt-2">Use the Upload button in the header. We’ll parse your slip and fill suggestions.</p>
    </div>
  );
}
