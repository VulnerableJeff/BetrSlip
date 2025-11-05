import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// Allow the Vite dev app
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());

// ---- helpers
const americanToDecimal = (a) => (a >= 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a));
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// ---- POST /api/parlay/price
// body: { stake:number, legs:[{ odds:number }] }
app.post("/api/parlay/price", (req, res) => {
  const S = z.object({
    stake: z.number().positive(),
    legs: z.array(z.object({ odds: z.number() })).min(1)
  });
  const parsed = S.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const { stake, legs } = parsed.data;

  const productDecimal = legs.reduce((m, l) => m * americanToDecimal(l.odds), 1);
  const parlayDecimal = productDecimal;
  const potentialReturn = stake * parlayDecimal; // total back
  const profit = potentialReturn - stake;

  res.json({
    decimal: parlayDecimal,
    potentialReturn,
    profit
  });
});

// ---- POST /api/parlay/prob
// body: { legs:[{ prob:number }], correlation?: number }
// correlation is optional (-0.5..0.5). 0 = independent.
app.post("/api/parlay/prob", (req, res) => {
  const S = z.object({
    legs: z.array(z.object({ prob: z.number().min(0).max(1) })).min(1),
    correlation: z.number().min(-0.5).max(0.5).optional()
  });
  const parsed = S.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const { legs, correlation = 0 } = parsed.data;

  // Basic independence baseline
  let p = legs.reduce((m, l) => m * clamp01(l.prob), 1);

  // Simple correlation adjustment: shrink toward min(prob)
  // (not perfect, but better than naive independence)
  const minP = Math.min(...legs.map(l => l.prob));
  p = clamp01(p + correlation * (minP - p));

  res.json({ prob: p });
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`BetrSlip server running on http://localhost:${PORT}`);
});
