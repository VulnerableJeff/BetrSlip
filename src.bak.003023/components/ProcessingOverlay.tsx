export default function ProcessingOverlay(
  { active = true, message = "Working..." }:
  { active?: boolean; message?: string }
){
  if (!active) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm
                    flex items-center justify-center z-40">
      <div className="rounded-xl bg-slate-900/90 px-5 py-4 text-sm">
        {message}
      </div>
    </div>
  );
}
