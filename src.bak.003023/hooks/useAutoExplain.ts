import { useEffect, useState } from "react";
import type { ParsedLeg } from "../lib/ocr";
import { aiExplainLeg } from "../lib/ai";

export function useAutoExplain(legs: ParsedLeg[], enabled = true) {
  const [insights, setInsights] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!enabled || !legs.length) { setInsights([]); return; }
      setLoading(true);
      try {
        const out: string[][] = [];
        for (const leg of legs) {
          const lines = await aiExplainLeg(leg);
          out.push(lines);
        }
        if (!cancelled) setInsights(out);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [JSON.stringify(legs), enabled]);

  return { insights, loading };
}
