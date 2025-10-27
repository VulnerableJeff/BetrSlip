import React from "react";

export default function BrandLogo({ dark=true }: { dark?: boolean }) {
  const src = dark ? "/logo-dark.png" : "/logo-light.png";
  return (
    <img
      src={src}
      alt="BetrSlip"
      className="h-8 sm:h-9 w-auto rounded-lg"
      onError={(e) => {
        // Fallback to the other one if one is missing
        const img = e.currentTarget as HTMLImageElement;
        img.src = dark ? "/logo-light.png" : "/logo-dark.png";
      }}
    />
  );
}
