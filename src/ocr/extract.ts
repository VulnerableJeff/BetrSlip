import { createWorker } from "tesseract.js";

/**
 * OCR the given image File and return raw text.
 * Uses CDN paths so it works reliably in Vite/Termux.
 */
export async function ocrImage(file: File): Promise<string> {
  // Downscale very large images to speed up OCR
  const imgUrl = URL.createObjectURL(file);
  const scaledUrl = await downscaleIfLarge(imgUrl, 2000); // max 2000px

  const worker = await createWorker({
    logger: m => console.log("[tesseract]", m),
    workerPath: "https://unpkg.com/tesseract.js@5/dist/worker.min.js",
    langPath: "https://unpkg.com/tesseract.js-core@5.0.2",
    corePath: "https://unpkg.com/tesseract.js-core@5.0.2/tesseract-core.wasm.js",
  });

  try {
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data: { text } } = await worker.recognize(scaledUrl);
    return text;
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(imgUrl);
    if (scaledUrl !== imgUrl) URL.revokeObjectURL(scaledUrl);
  }
}

/** Downscale long edge to maxPx (keeps aspect); returns a blob URL. */
async function downscaleIfLarge(url: string, maxPx: number): Promise<string> {
  const img = await loadImage(url);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const longEdge = Math.max(w, h);
  if (longEdge <= maxPx) return url;

  const scale = maxPx / longEdge;
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, cw, ch);

  const blob: Blob = await new Promise((res) => canvas.toBlob(b => res(b!), "image/jpeg", 0.9)!);
  return URL.createObjectURL(blob);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
