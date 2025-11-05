export default function SmartLogo({
  size = 280,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const logoUrl = "https://i.imgur.com/4gjOdfZ.png";
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={logoUrl}
        alt="betrslip logo"
        width={size}
        height={size * 0.28}
        className="select-none pointer-events-none object-contain"
        style={{ maxWidth: "90vw" }}
      />
    </div>
  );
}
