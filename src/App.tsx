import React, { useState, useCallback } from "react";
import logo from "./assets/betrslip-logo.png";
import { apiHealth, apiOcr, apiSuggest, apiParlay } from "./lib/api";
import LegCard from "./components/LegCard";
import UploadButton from "./components/UploadButton";

type Leg = { label: string; odds: number; prob?: number };
type PickT = { id: string; label: string; prob: number; odds: number; league?: string };
type Scan = { id: string; name: string; url: string; legs?: Leg[] };

const safePct = (n?: number) => (Number.isFinite(n) ? `${(100 * n!).toFixed(0)}%` : "—");
const safeNum = (n?: number, d = 2) => (Number.isFinite(n as number) ? (n as number).toFixed(d) : "—");
const safeAm  = (n?: number) => (Number.isFinite(n as number) ? ((n as number) > 0 ? `+${n}` : `${n}`) : "—");
const impliedProb = (odds: number) => (odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100));

const Brand = () => (
  <div className="flex items-center gap-3">
    <img src={logo} alt="BetrSlip" className="w-9 h-9 rounded-xl shadow-lg" />
    <div className="font-semibold tracking-wide text-white text-xl">BetrSlip</div>
  </div>
);

const ProviderPills = ({ active, setActive }: { active: string; setActive: (s: string)=>void }) => {
  const items = ["Hard Rock", "DraftKings", "FanDuel"];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const on = active === it;
        return (
          <button
            key={it}
            onClick={() => setActive(it)}
            className={`px-4 py-2 rounded-full text-sm transition ${on ? "bg-white/10 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
};

export default function App() {
  // tabs: home, scans, edge, help
  const [tab, setTab] = useState("home" as "home"|"scans"|"edge"|"help");
  const [busy, setBusy] = useState(null as null | "health" | "ocr" | "suggest" | "parlay");
  const [err, setErr] = useState(null as string | null);
  const [legs, setLegs] = useState([] as Leg[]);
  const [provider, setProvider] = useState("Hard Rock");

  const onHealth = useCallback(async () => {
    try {
      setBusy("health"); setErr(null);
      await apiHealth();
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(null); }
  }, []);

  const onSuggest = useCallback(async () => {
    try {
      setBusy("suggest"); setErr(null);
      const picks: PickT[] = await apiSuggest();
      const newLegs: Leg[] = picks.map(p => ({ label: p.label, odds: p.odds, prob: p.prob }));
      setLegs(xs => [...xs, ...newLegs]);
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(null); }
  }, []);

  const onParlay = useCallback(async () => {
    try {
      setBusy("parlay"); setErr(null);
      await apiParlay(legs);
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(null); }
  }, [legs]);

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Brand />
            <button
              onClick={onHealth}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15"
              disabled={busy === "health"}
            >
              Health
            </button>
          </div>

          <div className="rounded-2xl p-5 bg-gradient-to-b from-indigo-900/40 to-slate-900/40 border border-white/10 space-y-4">
            <div className="text-3xl font-extrabold">Upload a Screenshot of Your Bet Slip</div>
            <p className="text-slate-300">
              We’ll parse odds and compute a fair price, win % and Kelly stake.
            </p>

            <ProviderPills active={provider} setActive={setProvider} />

            <div className="flex gap-3">
              <UploadButton
                onAdded={(newLegs) => setLegs((xs) => [...xs, ...newLegs])}
                setErr={setErr}
                disabled={busy === "ocr"}
              />
              <button
                onClick={onSuggest}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                disabled={busy === "suggest"}
              >
                AI Suggest
              </button>
              <button
                onClick={() => setLegs([])}
                className="px-4 py-3 rounded-xl bg-rose-600/80 hover:bg-rose-600"
              >
                Clear
              </button>
            </div>

            {err && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700/40 text-rose-200 text-sm">
                {err}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5 bg-white/5 border border-white/10 space-y-3">
            <div className="text-xl font-semibold">Your Betslip</div>
            {legs.length === 0 ? (
              <div className="text-slate-400">No legs yet. Upload or Suggest.</div>
            ) : (
              <ul className="space-y-2">
                {legs.map((leg, i) => (
          <LegCard
            key={i}
            leg={leg}
            onRemove={() =>
              setLegs((xs) => xs.filter((_, j) => j !== i))
            }
          />
        ))}
              </ul>
            )}
            <div className="pt-2">
              <button
                onClick={onParlay}
                className="w-full px-4 py-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600"
                disabled={busy === "parlay" || legs.length === 0}
              >
                Recompute with API
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
