import { createWorker } from "tesseract.js";

/** Quick image prep (canvas) */
async function toDataURL(file: File): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = url;
  });
  const w = 1400;                                // upscale for cleaner OCR
  const scale = w / img.width;
  const h = Math.round(img.height * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0,0,w,h);     // dark bg
  g.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/png");
}

function parseLegs(text: string){
  // Normalize
  const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);

  // Extract odds and market lines
  const legs: {label:string; odds:number; prob?:number}[] = [];
  const ODDS = /([+\-]\d{2,4})/;
  const OU   = /\b(Over|Under)\s+(\d+(?:\.\d+)?)/i;

  for (let i=0; i<lines.length; i++){
    const L = lines[i];

    // Try to find a market like "Over 3.5" or "Under 39.5"
    const mOU = L.match(OU);
    if (mOU){
      // Try to pair with a player or team line just above it (common on HR)
      const prev = (i>0 ? lines[i-1] : "");
      let label = (prev && prev.length < 60 ? `${prev} — ${mOU[1]} ${mOU[2]}` : `${mOU[1]} ${mOU[2]}`);

      // Odds often appear on same/next line; fall back to -110
      let odds = -110;
      const same = L.match(ODDS) || (lines[i+1] && lines[i+1].match(ODDS)) || (prev && prev.match(ODDS));
      if (same) odds = parseInt(same[1],10);

      legs.push({label, odds});
      continue;
    }

    // Simple winner/side like "Chiefs" line — look for odds on same/next line
    if (/^[A-Z][A-Za-z .'-]{2,}$/.test(L) && !/^(Over|Under)\b/i.test(L)){
      const m = L.match(ODDS) || (lines[i+1] && lines[i+1].match(ODDS));
      if (m){
        legs.push({label: L, odds: parseInt(m[1],10)});
      }
    }
  }

  // De-dup near duplicates
  const uniq: typeof legs = [];
  const seen = new Set<string>();
  for (const x of legs){
    const k = x.label.toLowerCase().replace(/\s+/g," ") + "|" + x.odds;
    if (!seen.has(k)){ seen.add(k); uniq.push(x); }
  }
  return uniq;
}

/** Main: run Tesseract on the screenshot and return legs[] */
export async function ocrExtract(file: File){
  const dataURL = await toDataURL(file);
  const worker = await createWorker("eng", 1, {
    workerPath: undefined, langPath: undefined, corePath: undefined,
  });

  await worker.setParameters({
    tessedit_pageseg_mode: "6", // Assume a block of text
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-.:%/ ",
  });

  const { data } = await worker.recognize(dataURL);
  await worker.terminate();

  const text = (data.text || "").replace(/\u00A0/g," ");
  const legs = parseLegs(text);
  return { ok: true as const, text, legs };
}
