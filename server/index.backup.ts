import express from "express";
import express from "express";
import cors from "cors";
import cors from "cors";
import multer from "multer";
import multer from "multer";
import Tesseract from "tesseract.js";
import Tesseract from "tesseract.js";


const app = express();
const app = express();
app.use(cors());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));


const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });


type Leg = { label: string; odds: number; prob?: number };
type Leg = { label: string; odds: number; prob?: number };


// --- helpers ---
// --- helpers ---
const parseOdds = (s: string): number[] => {
const parseOdds = (s: string): number[] => {
  const out: number[] = [];
  const out: number[] = [];
  const re = /([+-]\d{2,4})/g;
  const re = /([+-]\d{2,4})/g;
  for (const m of s.matchAll(re)) out.push(parseInt(m[1], 10));
  for (const m of s.matchAll(re)) out.push(parseInt(m[1], 10));
  return out;
  return out;
};
};
const parseLegsFromText = (text: string): Leg[] => {
const parseLegsFromText = (text: string): Leg[] => {
  // naive: one leg per line, attach the first odds on that line
  // naive: one leg per line, attach the first odds on that line
  return text
  return text
    .split(/\r?\n/)
    .split(/\r?\n/)
    .map(l => l.trim())
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => l.length > 0)
    .map(line => {
    .map(line => {
      const odds = parseOdds(line)[0];
      const odds = parseOdds(line)[0];
      if (!odds) return null;
      if (!odds) return null;
      return { label: line.replace(/([+-]\d{2,4}).*$/, "").trim() || line, odds };
      return { label: line.replace(/([+-]\d{2,4}).*$/, "").trim() || line, odds };
    })
    })
    .filter(Boolean) as Leg[];
    .filter(Boolean) as Leg[];
};
};
const impliedProb = (odds: number) => (odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100));
const impliedProb = (odds: number) => (odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100));


// --- routes ---
// --- routes ---
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));


app.post("/api/suggest", async (_req, res) => {
  const picks = [
    { id: "c1", label: "Chiefs – 1H Moneyline", odds: -140, prob: 0.61 },
    { id: "k1", label: "Travis Kelce Over 5.5 Receptions", odds: -115, prob: 0.58 },
    { id: "p1", label: "Isiah Pacheco 40+ Rushing Yards", odds: -120, prob: 0.60 },
    { id: "s1", label: "Steelers +7.5 (Spread)", odds: -110, prob: 0.55 },
    { id: "m1", label: "Mallorca v Levante – Under 2.5", odds: -105, prob: 0.56 },
  ];
  return res.json(picks);
});
});


app.post("/api/parlay", async (req, res) => {
app.post("/api/parlay", async (req, res) => {
  const legs: Leg[] = Array.isArray(req.body?.legs) ? req.body.legs : [];
  const legs: Leg[] = Array.isArray(req.body?.legs) ? req.body.legs : [];
  if (!legs.length) return res.status(400).json({ error: "no legs" });
  if (!legs.length) return res.status(400).json({ error: "no legs" });
  const pWin = legs.reduce((acc, l) => acc * (l.prob ?? impliedProb(l.odds)), 1);
  const pWin = legs.reduce((acc, l) => acc * (l.prob ?? impliedProb(l.odds)), 1);
  const fairDecimal = 1 / pWin;
  const fairDecimal = 1 / pWin;
  const fairAmerican = fairDecimal >= 2 ? Math.round((fairDecimal - 1) * 100) : Math.round(-100 / (fairDecimal - 1));
  const fairAmerican = fairDecimal >= 2 ? Math.round((fairDecimal - 1) * 100) : Math.round(-100 / (fairDecimal - 1));
  res.json({ winPct: pWin, fairDecimal, fairAmerican });
  res.json({ winPct: pWin, fairDecimal, fairAmerican });
});
});


app.post("/api/ocr", upload.any(), async (req, res) => {
  try {
    const f = (req as any).file || ((req as any).files && (req as any).files[0]);
    if (!f) return res.status(400).json({ error: "no file" });
    const Tesseract = await import("tesseract.js");
    const result = await Tesseract.recognize(f.buffer, "eng");
    const text = result.data?.text || "";
    // Very loose line parser -> legs [{label, odds}]
    const legs = [] as { label: string; odds: number }[];
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/\b(over|under|yes|no|ml|moneyline|spread|winner)[^\-\d]*([+\-]\d{2,4})/i);
      if (m) legs.push({ label: line.trim().slice(0,120), odds: Number(m[2]) });
    }
    return res.json({ raw: text, legs });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});if (!req.file) return res.status(400).json({ error: "no file" }); (req as any).files[0]); if(!f) return res.status(400).json({ error: "no file" });
    const f=(req as any).file || ((req as any).files if (!req.file) return res.status(400).json({ error: "no file" });if (!req.file) return res.status(400).json({ error: "no file" }); (req as any).files[0]); if(!f) return res.status(400).json({ error: "no file" });
    const { data } = await Tesseract.recognize(f.buffer, "eng", { logger: () => {} });
    const { data } = await Tesseract.recognize(f.buffer, "eng", { logger: () => {} });
    const text = (data?.text || "").replace(/\u0000/g, "");
    const text = (data?.text || "").replace(/\u0000/g, "");
    let legs = parseLegsFromText(text);
    let legs = parseLegsFromText(text);
    // add simple probability estimate
    // add simple probability estimate
    legs = legs.slice(0, 12).map(l => ({ ...l, prob: impliedProb(l.odds) }));
    legs = legs.slice(0, 12).map(l => ({ ...l, prob: impliedProb(l.odds) }));
    if (!legs.length) return res.status(422).json({ error: "no legs detected", raw: text.slice(0, 500) });
    if (!legs.length) return res.status(422).json({ error: "no legs detected", raw: text.slice(0, 500) });
    res.json({ legs, raw: text.slice(0, 2000) });
    res.json({ legs, raw: text.slice(0, 2000) });
  } catch (e: any) {
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) });
    res.status(500).json({ error: e?.message || String(e) });
  }
  }
});
});


const PORT = Number(process.env.PORT || 8787);
const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => console.log(`[API] listening on ${PORT}`));
app.listen(PORT, () => console.log(`[API] listening on ${PORT}`));
