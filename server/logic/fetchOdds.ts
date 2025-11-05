import fetch from "node-fetch";

export type Game = {
  id: string;
  sport: string;
  commenceTime: string;
  home: string;
  away: string;
  bestAmerican: number;
  impliedProb: number;
  book?: string;
};

function americanToImplied(american: number): number {
  if (american >= 100)  return 100 / (american + 100);
  if (american <= -100) return -american / (-american + 100);
  return 0;
}

const SPORTS = [
  "baseball_mlb",
  "basketball_nba",
  "hockey_nhl",
  "americanfootball_nfl",
  "soccer_epl",
  "soccer_uefa_champs_league"
];

export async function fetchHighProbGames(): Promise<Game[]> {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    // Mock high-prob games if no key configured
    return [
      { id:"mock1", sport:"nba", commenceTime:new Date(Date.now()+3600e3).toISOString(), home:"Home Stars", away:"Road Squad", bestAmerican:-600, impliedProb: americanToImplied(-600), book:"MockBook" },
      { id:"mock2", sport:"mlb", commenceTime:new Date(Date.now()+5400e3).toISOString(), home:"Favorites FC", away:"Underdogs FC", bestAmerican:-550, impliedProb: americanToImplied(-550), book:"MockBook" },
    ].filter(g => g.impliedProb >= 0.85);
  }

  const out: Game[] = [];
  for (const s of SPORTS) {
    const url = `https://api.the-odds-api.com/v4/sports/${s}/odds?regions=us&markets=h2h&oddsFormat=american&dateFormat=iso&apiKey=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) continue;
    const rows: any[] = await resp.json();
    for (const row of rows) {
      const home = row.home_team;
      const away = row.away_team;
      let best: { price: number; book?: string } | null = null;

      for (const b of row.bookmakers ?? []) {
        for (const m of b.markets ?? []) {
          for (const o of m.outcomes ?? []) {
            const price = Number(o.price);
            if (Number.isNaN(price)) continue;

            // pick the favorite (most negative; if all +, pick smallest +)
            const better =
              !best ||
              (price < 0 && (best.price >= 0 || price < best.price)) ||
              (price >= 0 && best.price >= 0 && price < best.price);

            if (better) best = { price, book: b.title };
          }
        }
      }

      if (!best) continue;
      const implied = americanToImplied(best.price);
      if (implied >= 0.85) {
        out.push({
          id: row.id,
          sport: s,
          commenceTime: row.commence_time,
          home, away,
          bestAmerican: best.price,
          impliedProb: implied,
          book: best.book,
        });
      }
    }
  }
  return out;
}
