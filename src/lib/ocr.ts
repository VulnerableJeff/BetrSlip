export type ParsedLeg = {
  label: string;
  odds: number;
  market?: string;
  line?: string;
  sport?: string;
  confidence?: number;
};

const SPORT_WORDS: Record<string,string[]> = {
  Soccer: ["soccer","laliga","premier","serie a","bundesliga","mls","uefa","goal","tie","draw"],
  NBA:    ["nba","basketball","points","rebounds","assists","lakers","celtics"],
  NFL:    ["nfl","football","yards","touchdown","rushing","receiving","patriots","cowboys"],
  MLB:    ["mlb","baseball","hits","runs","homers","dodgers","yankees"],
};

export function guessSport(text: string): string {
  const t = text.toLowerCase();
  for (const [sport, words] of Object.entries(SPORT_WORDS)) {
    if (words.some(w => t.includes(w))) return sport;
  }
  // fallback: if it mentions "tie" with +odds often it's soccer
  if (/\btie\b/i.test(text)) return "Soccer";
  return "Unknown";
}

/** Very forgiving odds/label extractor from OCR text. */
export function parseOcrText(text: string): ParsedLeg[] {
  const lines = text
    .split(/\r?\n/)
    .map(s => s.replace(/[^\w\s+\-.:]/g, " ").replace(/\s+/g," ").trim())
    .filter(Boolean);

  const legs: ParsedLeg[] = [];
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i];

    // Look for American odds on a line (+260, -155, +105, etc.)
    const m = s.match(/([+-]\d{2,4})/);
    if (!m) continue;

    const odds = Number(m[1]);

    // Build a label from this and previous/next line context
    const around = [lines[i-1], s, lines[i+1]]
      .filter(Boolean)
      .join(" ")
      .replace(/([+-]\d{2,4})/g,"")
      .trim();

    const label = (around || s).slice(0, 40);
    if (!Number.isFinite(odds)) continue;

    legs.push({
      label: capitalize(label),
      odds,
      confidence: 0.9, // baseline – you can tune by heuristic later
    });
  }

  // Deduplicate by (label+odds)
  const seen = new Set<string>();
  return legs.filter(l => {
    const k = `${l.label}|${l.odds}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function capitalize(s: string) {
  return s.replace(/\b([a-z])/g, (_,c) => c.toUpperCase());
}
