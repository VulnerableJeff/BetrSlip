/**
 * parseLegsFromText: extracts bet legs from OCR text (Moneyline, Over/Under)
 */
const americanToProb = (o: number) => (o > 0 ? 100 / (o + 100) : -o / (100 - o));

export type ParsedLeg = { label: string; odds: number; prob: number };

export function parseLegsFromText(text: string): ParsedLeg[] {
  if (!text) return [];
  const lines = text
    .split(/\r?\n/)
    .map(l => l.replace(/[^\S\r\n]+/g, " ").trim())
    .filter(Boolean);

  const out: ParsedLeg[] = [];
  const seen = new Set<string>();

  const push = (label: string, odds: number) => {
    const key = `${label}|${odds}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, odds, prob: americanToProb(odds) });
  };

  for (const line of lines) {
    const l = line.replace(/[–—]/g, "-");

    // 1. Team vs Team — Moneyline +120
    const ml1 = l.match(/^\s*(.+?)\s*(?:vs|v|@)\s*(.+?)\s*-\s*(?:Moneyline|ML)\s*([+\-]\d{2,4})\s*$/i);
    if (ml1) {
      const team = ml1[1].trim();
      const odds = parseInt(ml1[3], 10);
      push(`${team} — Moneyline`, odds);
      continue;
    }

    // 2. Lakers ML -135
    const ml2 = l.match(/^\s*(.+?)\s*(?:Moneyline|ML)\s*([+\-]\d{2,4})\s*$/i);
    if (ml2) {
      const team = ml2[1].trim();
      const odds = parseInt(ml2[2], 10);
      push(`${team} — Moneyline`, odds);
      continue;
    }

    // 3. Over/Under lines
    const ou = l.match(/\b(Over|Under)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:Points|Pts|Goals|Runs|Total)?\s*([+\-]\d{2,4})\b/i);
    if (ou) {
      const side = ou[1];
      const val = ou[2];
      const odds = parseInt(ou[3], 10);
      push(`${side} ${val}`, odds);
      continue;
    }

    // 4. Compact O/U forms: “O 6.5 -110”
    const ou2 = l.match(/\b(O|U)\s*([0-9]+(?:\.[0-9]+)?)\s*([+\-]\d{2,4})\b/i);
    if (ou2) {
      const side = ou2[1].toUpperCase() === "O" ? "Over" : "Under";
      const val = ou2[2];
      const odds = parseInt(ou2[3], 10);
      push(`${side} ${val}`, odds);
      continue;
    }
  }

  return out;
}
