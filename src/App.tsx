import React, { useEffect, useState } from "react";
import SmartLogo from "./components/SmartLogo";
import ProcessingOverlay from "./components/ProcessingOverlay";
import { ocrImage } from "./ocr/extract";
import { parseOcrText, guessSport, ParsedLeg } from "./lib/ocr";
import { Toaster, notify } from "./lib/notify";

export default function App() {
  const [legs, setLegs] = useState<ParsedLeg[]>([]);
  const [detectedSport, setDetectedSport] = useState("Unknown");
  const [aiOn, setAiOn] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ---- Bridge: make window.mergeFromText available everywhere
  useEffect(() => {
    (window as any).mergeFromText = (text: string) => {
      try {
        const next = parseOcrText(text);
        const sport = guessSport(text);
        if (sport && sport !== "Unknown") setDetectedSport(sport);
        if (next?.length) setLegs(next);
      } catch (e) {
        console.error("mergeFromText failed:", e);
      }
    };
 
   async function handleUpload(file: File) {
  setProcessing(true);
  try {
    console.log("Picked file:", file?.name, file?.size);
    const text = await ocrImage(file);
    console.log("OCR text preview:", (text || "").slice(0, 200));
    (window as any).mergeFromText(text);
    notify.success("Screenshot processed");
  } catch (err: any) {
    console.error("OCR upload error:", err);
    const msg = typeof err?.message === "string" ? err.message : String(err);
    if (/network|fetch/i.test(msg)) {
      notify.error("OCR failed to download language data. Check internet and try again.");
    } else if (/timeout|slow/i.test(msg)) {
      notify.info("OCR is taking a while… try a smaller screenshot.");
    } else {
      notify.error("Could not read screenshot. Please try another image or retake the screenshot.");
    }
  } finally {
    setProcessing(false);
  }
}
    // quick helper for manual testing
    (window as any).addLeg = (s: any) =>
      setLegs((ls) => [
        ...ls,
        {
          label: String(s.label ?? "Selection"),
          odds: Number(s.odds ?? 0),
          market: s.market ?? "",
          line: s.line ?? "",
          confidence:
            typeof s.confidence === "number" ? s.confidence : 0.8,
          sport: s.sport ?? detectedSport,
        },
      ]);
  }, [detectedSport]);

  // ---- Upload handler → OCR → parse
  async function handleUpload(file: File) {
    setProcessing(true);
    try {
      const text = await ocrImage(file);        // must return raw text
      (window as any).mergeFromText(text);      // reuse the same path
    } catch (err) {
      console.error("OCR upload error:", err);
      notify.error("Could not read screenshot. Please try another image or retake the screenshot.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen
      <Toaster /> bg-[#0b0b0b] text-white px-4 py-6">
      <header className="flex flex-col items-center mb-4">
        <SmartLogo />
        <h1 className="text-xl font-bold text-center mt-2">
          AI Sports Betting Assistant
        </h1>
        <div className="text-sm opacity-80 mt-1">
          AI: {aiOn ? "ON" : "OFF"} · Sport: {detectedSport}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
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
              (window as any).mergeFromText?.(
                "Mallorca +260\nLevante +105\nTie +230\nIK Sirius -155"
              )
            }
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500"
          >
            AI Suggest
          </button>

          <button
            onClick={() =>
              (window as any).addLeg({
                label: "Sample Leg",
                odds: +150,
                sport: detectedSport,
                confidence: 0.82,
              })
            }
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            + Sample Leg
          </button>

          <button
            onClick={() => setLegs([])}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
          >
            Clear
          </button>

          <button
            onClick={() => setAiOn((v) => !v)}
            className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
          >
            Toggle AI
          </button>
        </div>
      </header>

      <main className="space-y-3">
        <div className="p-4 rounded-xl bg-gray-900">
          <h2 className="font-semibold mb-2">Your Betslip</h2>
          {legs.length === 0 ? (
            <p className="text-sm opacity-70">
              No legs yet. Upload a screenshot or click + Sample Leg.
            </p>
          ) : (
            <ul className="space-y-2">
              {legs.map((leg, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg bg-gray-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{leg.label}</div>
                    <div className="text-xs opacity-70">
                      {leg.sport || detectedSport}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {leg.odds > 0 ? `+${leg.odds}` : leg.odds}
                    </span>
                    <span className="text-xs border rounded-full px-2 py-0.5 opacity-80">
                      {Math.round((leg.confidence ?? 0.75) * 100)}%
                    </span>
                    <button
                      onClick={() =>
                        setLegs((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-xs bg-red-700 px-2 py-0.5 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {processing && <ProcessingOverlay text="Reading screenshot..." />}
    </div>
  );
}
