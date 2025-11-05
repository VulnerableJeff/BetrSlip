#!/usr/bin/env bash
set -euo pipefail

echo "➡️  Fix & Run (betrslip)…"

# --- sanity: be in project root
if [ ! -d "src" ]; then
  echo "Run this inside your project root (where src/ and package.json are)."
  exit 1
fi

# --- 0) deps needed
# (tsx to run TS directly, express/cors for API, concurrently to run both)
pnpm add -D tsx concurrently >/dev/null 2>&1 || pnpm add -D tsx concurrently
pnpm add express cors >/dev/null 2>&1 || pnpm add express cors

# --- 1) write a clean ESM TS server (no body-parser, no CommonJS)
mkdir -p server
cat > server/index.ts <<'TS'
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Simple odds -> implied probability
function probFromAmerican(odds: number): number {
  if (!Number.isFinite(odds)) return 0.5;
  return odds >= 0 ? 100 / (odds + 100) : (-odds) / ((-odds) + 100);
}

app.get("/ai/suggest", (_req, res) => {
  const picks = [
    { id: "A", label: "Value Pick A", prob: 0.62, odds: -120, league: "NBA" },
    { id: "B", label: "Value Pick B", prob: 0.58, odds: 130, league: "NFL" },
    { id: "C", label: "Value Pick C", prob: 0.65, odds: -110, league: "MLB" },
  ];
  res.json({ ok: true, picks });
});

app.post("/ocr", (req, res) => {
  // stub: return two lines using any odds we see; otherwise defaults
  const oddsA = Number(req.body?.oddsA ?? -120);
  const oddsB = Number(req.body?.oddsB ?? 140);
  res.json({
    ok: true,
    legs: [
      { label: "OCR: " + oddsA, odds: oddsA, prob: probFromAmerican(oddsA) },
      { label: "OCR: " + oddsB, odds: oddsB, prob: probFromAmerican(oddsB) },
    ],
  });
});

app.post("/parlay", (req, res) => {
  // expects: { legs: [{ odds?:number, prob?:number }, ...] }
  const legs = Array.isArray(req.body?.legs) ? req.body.legs : [];
  const legProbs = legs.map((l: any) =>
    Number.isFinite(l?.prob) ? Number(l.prob) : probFromAmerican(Number(l?.odds ?? 0))
  );

  const win = legProbs.reduce((acc, p) => acc * (p > 0 && p < 1 ? p : 0.5), 1);
  const winPercent = Math.round(win * 10000) / 100;
  const fairDecimal = win > 0 ? Math.round((1 / win) * 100) / 100 : 0;
  const fairAmerican = fairDecimal >= 2 ? Math.round((fairDecimal - 1) * 100) : Math.round(-100 / (fairDecimal - 1));
  const kelly = 0; // left 0 until bankroll/price is provided

  res.json({
    ok: true,
    winPct: winPercent,
    winPercent,
    fairDecimal,
    fairAmerican,
    kelly,
    edgePct: 0,
  });
});

const PORT = Number(process.env.PORT ?? 8787);
app.listen(PORT, () => console.log("API listening on", PORT));
TS

# --- 2) Vite proxy: back up existing, then write a minimal working config
if [ -f vite.config.ts ]; then cp vite.config.ts vite.config.ts.bak; fi
cat > vite.config.ts <<'VITE'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/ai": "http://localhost:8787",
      "/ocr": "http://localhost:8787",
      "/parlay": "http://localhost:8787",
      "/health": "http://localhost:8787",
    },
  },
});
VITE

# --- 3) Patch the two buttons so JSX compiles and handlers work
#     - Clear button
sed -i 's#<button[^>]*>Clear</button>#<button className="btn btn-danger" onClick={() => { setLegs([]); setSuggest([]); setError(null); }}>Clear</button>#' src/App.tsx || true
#     - Upload (stub) button
sed -i 's#<button[^>]*>Upload Screenshot[^<]*</button>#<button className="btn" onClick={() => handleUploadStub(addLeg, setError)}>Upload Screenshot (stub)</button>#' src/App.tsx || true

# --- 4) ensure scripts in package.json for convenience
node - <<'NODE'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts ||= {};
pkg.scripts.api = 'NODE_OPTIONS=--enable-source-maps tsx server/index.ts';
pkg.scripts.web = 'vite --host';
pkg.scripts.dev = 'concurrently -k -n API,WEB "pnpm run api" "pnpm run web"';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Updated package.json scripts.');
NODE

# --- 5) kill old processes that might hold ports
pkill -f "vite|server/index.ts|server/dist|node .*5173|node .*8787" 2>/dev/null || true

# --- 6) start both
echo "🚀 Starting API (8787) + Web (Vite)…"
pnpm run dev
