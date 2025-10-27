export default function Logo({ dark }: { dark: boolean }) {
  return (
    <img
      src={dark ?  "/logo-dark.png" :  "/logo-dark.png"}
      alt="BetrSlip"
      className="h-8 w-8 rounded-xl border border-white/15 shrink-0"
    />
  );
}
