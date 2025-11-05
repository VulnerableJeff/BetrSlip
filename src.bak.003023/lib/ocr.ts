import Tesseract from "tesseract.js";

export type ParsedLeg = { label: string; odds?: number; prob?: number; league?: string };

function preprocess(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const data = d.data;
  // simple contrast + grayscale
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
    const v = g > 180 ? 255 : g > 140 ? 220 : g > 100 ? 170 : g > 60 ? 120 : 80;
    data[i]=data[i+1]=data[i+2]=v;
  }
  ctx.putImageData(d, 0, 0);
  return c;
}

export async function ocrImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const canvas = preprocess(img);
    const { data } = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 +-:.@/%",
    } as any);
    return (data?.text || "").trim();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Parse common sportsbook lines like:
 *  "Team Name +140", "Team Name -200", "LAL -3.5 -110", "Over 44.5 -105", "Under 44.5 -115"
 */
export function parseOcrText(text: string): ParsedLeg[] {
  const out: ParsedLeg[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;

    // Spread/total with odds at end
    let m = line.match(/^(.*?)(Over|Under)?\s*(-?\d+(?:\.\d+)?)\s+([+-]\d{3,4})$/i);
    if (m) {
      const label = (m[2] ? `${m[2]} ${m[3]} — ${m[1]}` : `${m[1]} ${m[3]}`).trim();
      out.push({ label, odds: parseInt(m[4], 10) });
      continue;
    }

    // Moneyline at end: "Team +145"
    m = line.match(/^(.*?)\s+([+-]\d{3,4})$/);
    if (m) {
      out.push({ label: m[1].trim(), odds: parseInt(m[2], 10) });
      continue;
    }

    // Totals keyword first: "Over 44.5 -110"
    m = line.match(/^(Over|Under)\s+(\d+(?:\.\d+)?)\s+([+-]\d{3,4})$/i);
    if (m) {
      out.push({ label: `${m[1]} ${m[2]}`, odds: parseInt(m[3], 10) });
      continue;
    }

    // Fallback: keep the text as label (no odds detected)
    out.push({ label: line });
  }
  return out;
}
