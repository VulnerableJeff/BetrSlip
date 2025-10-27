import { useEffect } from "react";

/** Listen for window CustomEvent("BETRSLIP_ADD_LEG", { detail: {...} }) and add a leg via setLegs */
export function useLegBus(setLegs: (updater: any) => void) {
  useEffect(() => {
    const ADD_LEG_EVT = "BETRSLIP_ADD_LEG";
    const onAdd = (ev: any) => {
      const s = (ev && ev.detail) || {};
      const leg = {
        label: String(s.label ?? ""),
        odds: Number(s.odds ?? 0),
        market: s.market ? String(s.market) : "",
        line: s.line ? String(s.line) : "",
      };
      setLegs((ls: any[]) => [...ls, leg]);
    };
    window.addEventListener(ADD_LEG_EVT, onAdd as any);
    return () => window.removeEventListener(ADD_LEG_EVT, onAdd as any);
  }, [setLegs]);
}
