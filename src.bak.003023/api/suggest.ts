import { getJSON } from "../lib/http";

export type SuggestedGame = {
  id: string;
  sport: string;
  commenceTime: string;
  home: string;
  away: string;
  bestAmerican: number;
  impliedProb: number;
  book?: string;
};

export async function fetchSuggestedGames(): Promise<SuggestedGame[]> {
  const data = await getJSON<{ ok:boolean; games: SuggestedGame[] }>("/suggest-games");
  if (!data.ok) throw new Error("API error");
  return data.games;
}
