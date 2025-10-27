export default function SmartLogo({ className="" }: { className?: string }) {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true;
  const src = prefersDark ? "/logo-dark.png" : "/logo-light.png";
  return <img src={src} alt="BetrSlip" className={className+" rounded"} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/logo-dark.png";}}/>;
}
