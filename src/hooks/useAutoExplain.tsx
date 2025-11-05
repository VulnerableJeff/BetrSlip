import { useEffect, useState } from "react";
import { aiExplainLeg } from "../lib/ai";

export type AnyLeg = { label: string; odds?: number | string } & Record<string, any>;

export function useAutoExplain(legs: AnyLeg[]) {
  const [insights, setInsights] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    legs.forEach((leg, i) => {
      if (!leg?.label) return;
      if (insights[i] || loading[i]) return;

      setLoading((m) => ({ ...m, [i]: true }));
      Promise.resolve(
        aiExplainLeg({ label: String(leg.label), odds: Number(leg.odds ?? 0) } as any)
      )
        .then((txt: any) => {
          if (!txt) return;
          const s = typeof txt === "string" ? txt : txt?.explanation || txt?.reason || "";
          if (!s) return;
          setInsights((m) => ({ ...m, [i]: s }));
        })
        .catch(() => {})
        .finally(() => setLoading((m) => ({ ...m, [i]: false })));
    });
  }, [legs, insights, loading]);

  return { insights, loading };
}
