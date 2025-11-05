import React, { useEffect, useState } from "react";
import type { ParsedLeg } from "../lib/ocr";
import { post } from "../lib/api";

export default function KellyWidget({ legs }: { legs: ParsedLeg[] }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!legs.length) return;
    (async () => {
      const res = await post("/parlay", { legs });
      setData(res);
    })();
  }, [legs]);

  if (!data) return null;
  const pct = (data.stakePct * 100).toFixed(2);
  const edge = (data.edge * 100).toFixed(2);
  const prob = (data.parlayProb * 100).toFixed(1);

  return (
    <div className="rounded-xl bg-gray-900/70 border border-gray-800 p-4 text-sm mt-4">
      <div>💡 <b>Kelly Stake:</b> {pct}% of bankroll</div>
      <div>📈 <b>Edge:</b> {edge}%</div>
      <div>🎯 <b>Win Probability:</b> {prob}%</div>
      <div>💰 <b>Fair Odds:</b> {data.fairAmerican > 0 ? `+${data.fairAmerican}` : data.fairAmerican}</div>
    </div>
  );
}
