import React, { useEffect, useState } from "react";
import SmartLogo from "./components/SmartLogo";
import ProcessingOverlay from "./components/ProcessingOverlay";
import { ocrImage } from "./ocr/extract";
import { americanToProb, kellyFraction } from "./lib/math";
import { Toaster, notify } from "./lib/notify";

type ParsedLeg = {
  label: string;
  odds: number;
  sport?: string;
  confidence?: number;
};

function Card({title, right, children}:{title:string; right?:React.ReactNode; children:React.ReactNode}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        {right}
      </div>
      <div className="text-sm opacity-80">{children}</div>
    </div>
  );
}

export default function App() {
  const [legs, setLegs] = useState<ParsedLeg[]>([]);
  const [detectedSport, setDetectedSport] = useState("Unknown");
  const [aiOn, setAiOn] = useState(true);
  const [processing, setProcessing] = useState(false);

  // expose quick test helper
  useEffect(() => {
    (window as any).addLeg = (s: any) =>
      setLegs((ls) => [
        ...ls,
        {
          label: String(s.label ?? "Selection"),
          odds: Number(s.odds ?? 0),
          sport: s.sport ?? detectedSport,
          confidence: typeof s.confidence === "number" ? s.confidence : 0.9,
        },
      ]);
  }, [detectedSport]);

  async function handleUpload(file: File) {
    setProcessing(true);
    try {
      const text = await ocrImage(file);
      if (!text) return notify.info("I couldn't read that image. Try another or retake clearer.");

      const guessSport = /NBA|basketball|soccer|mls|prem/i.test(text)
        ? (/NBA|basketball/i.test(text) ? "NBA" : "Soccer")
        : "Unknown";
      if (guessSport !== "Unknown") setDetectedSport(guessSport);

      const newLegs: ParsedLeg[] = [];
      const lineRe = /([A-Za-z][A-Za-z .'-]{1,30})\s+([+-]\d{2,4})/g;
      let m: RegExpExecArray | null;
      while ((m = lineRe.exec(text))) {
        newLegs.push({
          label: m[1].trim(),
          odds: parseInt(m[2], 10),
          sport: guessSport,
          confidence: 0.9,
        });
      }
      if (newLegs.length) setLegs(newLegs);
      else notify.info("No odds found in the screenshot.");
    } catch (e) {
      console.error(e);
      notify.error("Could not read screenshot.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-4 py-6">
      <Toaster />

      {/* Hero / Logo */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <SmartLogo />
        <h1 className="text-3xl font-extrabold text-center">AI Sports Betting Assistant</h1>
        <div className="text-sm opacity-80">AI: {aiOn ? "ON" : "OFF"} · Sport: {detectedSport}</div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <label className="bg-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-600">
            Upload Screenshot
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            onClick={() =>
              (window as any).addLeg({
                label: "Sample Leg",
                odds: +230,
                sport: detectedSport,
                confidence: 0.9,
              })
            }
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            + Sample Leg
          </button>

          <button onClick={() => setLegs([])} className="bg-red-600 px-4 py-2 rounded hover:bg-red-500">
            Clear
          </button>

          <button onClick={() => setAiOn((v) => !v)} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">
            Toggle AI
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-3">
        <Card title="🚀 One-Click (Upload → Stake → Go)" right={<span className="opacity-70 text-xs">auto-detects sport</span>}>
          Use the Upload button above. We’ll parse your slip and fill suggestions.
        </Card>

        <Card title="🧩 Parlay Builder" right={<span className="opacity-70 text-xs">Detected: {legs.length ? detectedSport : "—"}</span>}>
          Add/remove legs below; your implied chance updates live.
        </Card>

        <Card title="🤖 Prop Auto-Suggester" right={<button className="text-xs underline opacity-80" onClick={() => notify.info("Coming soon")}>Hide</button>}>
          Tap AI later to generate ideas tailored to your current legs.
        </Card>
      </div>

      {/* Betslip */}
      <div className="p-4 rounded-2xl bg-slate-900 mt-4">
        <h2 className="font-semibold mb-2">Your Betslip</h2>
        {legs.length === 0 ? (
          <p className="text-sm opacity-70">
            No legs yet. Upload a screenshot or click + Sample Leg.
          </p>
        ) : (
          <ul className="space-y-3">
            {legs.map((leg, i) => {
              const p = americanToProb(leg.odds);
              const k = kellyFraction(p, leg.odds);
              return (
                <li key={i} className="p-3 rounded-lg bg-gray-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{leg.label}</div>
                    <div className="text-xs opacity-70">{leg.sport || detectedSport}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{leg.odds > 0 ? `+${leg.odds}` : leg.odds}</span>
                    <span className="text-xs border rounded-full px-2 py-0.5 opacity-80">{Math.round(p * 100)}%</span>
                    <span className="text-[10px] border rounded px-1.5 py-0.5 opacity-70">Kelly {Math.round(k * 100)}%</span>
                    <button
                      onClick={() => setLegs((xs) => xs.filter((_, idx) => idx !== i))}
                      className="text-xs bg-rose-700 px-2 py-0.5 rounded hover:bg-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {processing && <ProcessingOverlay message="Reading screenshot..." />}
    </div>
  );
}
