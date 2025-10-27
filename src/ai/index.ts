import { aiChatJSON } from "./api";
import { parseLegsFromText, type ParsedLeg } from "../ocr/parse";

/** Read Blob/File to base64 data URL for Vision */
async function blobToDataURL(b: Blob): Promise<string> {
  const ab = await b.arrayBuffer();
  const bin = btoa(String.fromCharCode(...new Uint8Array(ab)));
  const mime = b.type || "image/png";
  return `data:${mime};base64,${bin}`;
}

/** Vision fallback: returns normalized legs (Moneyline + Totals) */
export async function aiAssistFromFile(file: Blob): Promise<ParsedLeg[]> {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!key) return [];
  const image_url = await blobToDataURL(file);
  const sys = `You extract sports bet legs (Moneyline, Over/Under) from images.
Return JSON: {"legs":[{"label":"<string>","odds":<int>}]}.
Avoid duplicates. Do not invent.`;
  const user = [
    { type:"input_text", text:"Parse Moneyline and Over/Under with American odds (+120/-130)." },
    { type:"input_image", image_url }
  ];
  const out = await aiChatJSON(sys, user, 0.2);
  const legs = Array.isArray(out?.legs) ? out.legs : [];
  return (legs as any[]).flatMap(l=>{
    const s = `${l?.label ?? ""} ${l?.odds ?? ""}`.trim();
    try { return parseLegsFromText(s); } catch { return []; }
  });
}

/** AI suggester: given league & optional note, return 3 ideas */
export async function aiSuggestLegs(league: string, note=""): Promise<ParsedLeg[]> {
  const sys = `You propose 1-3 value betting legs for ${league}.
Return JSON: {"legs":[{"label":"<string>","odds":<int>}]}.
Only Moneyline or Over/Under. Use plausible prices. No spreads.`;
  const user = `Context: ${note || "none"}.`;
  const out = await aiChatJSON(sys, user, 0.3);
  const legs = Array.isArray(out?.legs) ? out.legs : [];
  return (legs as any[]).flatMap(l=>{
    const s = `${l?.label ?? ""} ${l?.odds ?? ""}`.trim();
    try { return parseLegsFromText(s); } catch { return []; }
  });
}

/** AI explainer for a single leg */
export async function aiExplainLeg(label: string, odds: number, note=""): Promise<string> {
  const sys = `Explain this pick in <=100 words, neutral tone, no guarantees.`;
  const user = `Leg: ${label} (${odds > 0 ? "+"+odds : odds}). Context: ${note || "none"}.`;
  const out = await aiChatJSON(sys, user, 0.3);
  return out?.reason || out?.explanation || JSON.stringify(out);
}
