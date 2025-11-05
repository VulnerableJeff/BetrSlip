import express from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// --- Helper functions ---
const parseOdds = (s: string): number[] => {
  const out: number[] = [];
  const re = /([+-]\d{2,4})/g;
  for (const m of s.matchAll(re)) out.push(parseInt(m[1], 10));
  return out;
};

const parseLegsFromText = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const odds = parseOdds(line)[0];
      if (!odds) return null;
      return { label: line.replace(/([+-]\d{2,4}).*$/, "").trim(), odds };
    })
    .filter(Boolean);

const impliedProb = (odds: number) =>
  odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);

// --- Routes ---
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.post("/api/suggest", async (_req, res) => {
  const picks = [
    { id: "kc1h", label: "Chiefs – 1H Moneyline", odds: -140, prob: 0.61 },
    { id: "kelce5_5", label: "Travis Kelce Over 5.5 Receptions", odds: -115, prob: 0.58 },
    { id: "pach40", label: "Isiah Pacheco 40+ Rushing Yards", odds: -120, prob: 0.60 },
    { id: "pit7_5", label: "Steelers +7.5 (Spread)", odds: -110, prob: 0.55 },
    { id: "under2_5", label: "Mallorca v Levante — Under 2.5", odds: -105, prob: 0.56 },
  ];
  res.json(picks);
});

app.post("/api/parlay", async (req, res) => {
  const legs = Array.isArray(req.body?.legs) ? req.body.legs : [];
  if (!legs.length) return res.status(400).json({ error: "no legs" });
  const pWin = legs.reduce((acc, l) => acc * (l.prob ?? impliedProb(l.odds)), 1);
  const fairDecimal = 1 / pWin;
  const fairAmerican = fairDecimal >= 2
    ? Math.round((fairDecimal - 1) * 100)
    : Math.round(-100 / (fairDecimal - 1));
  res.json({ winPct: pWin, fairDecimal, fairAmerican });
});

app.post("/api/ocr", upload.any(), async (req, res) => {
  try {
    const f = (req as any).file || ((req as any).files && (req as any).files[0]);
    if (!f) return res.status(400).json({ error: "no file" });

    const result = await Tesseract.recognize(f.buffer, "eng");
    const text = (result.data?.text || "").replace(/\u0000/g, "");
    const legs = parseLegsFromText(text).map((l) => ({
      ...l,
      prob: impliedProb(l.odds),
    }));
    if (!legs.length) return res.status(422).json({ error: "no legs detected", raw: text.slice(0, 300) });
    res.json({ legs, raw: text.slice(0, 1000) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => console.log(`[API] listening on ${PORT}`));
