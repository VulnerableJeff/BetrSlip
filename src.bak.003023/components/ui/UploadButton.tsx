import { useRef } from "react";

export default function UploadButton({
  onChange,
  disabled = false,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function click() {
    const el = ref.current;
    if (!el) return;
    // Clear the value to ensure the same file can trigger "change" again
    el.value = "";
    el.click();
  }

  return (
    <div className="inline-flex">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        // capture helps on mobile (opens camera by default, still lets you pick gallery)
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={click}
        disabled={disabled}
        className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
      >
        Upload Screenshot
      </button>
    </div>
  );
}
