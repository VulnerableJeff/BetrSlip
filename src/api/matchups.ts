export type Matchup = { league:"NFL"|"NBA"|"MLB"|"UFC"; home:string; away:string; favTeam:string; favProb:number; favOdds:number };
export async function getAllMatchups(): Promise<Matchup[]> {
  return [
    { league:"NBA", home:"Cavaliers", away:"Bulls", favTeam:"Cavaliers", favProb:0.89, favOdds:-135 },
    { league:"NBA", home:"Warriors",  away:"Lakers", favTeam:"Warriors", favProb:0.55, favOdds:-120 },
    { league:"NFL", home:"Eagles",    away:"Cowboys", favTeam:"Eagles", favProb:0.59, favOdds:-145 },
    { league:"MLB", home:"Yankees",   away:"Red Sox", favTeam:"Yankees", favProb:0.57, favOdds:-135 },
    { league:"UFC", home:"Fighter A", away:"Fighter B", favTeam:"Fighter A", favProb:0.60, favOdds:-140 }
  ];
}
