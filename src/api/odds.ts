export type OddsLeg = { league: "NFL"|"NBA"|"MLB"|"UFC"; player?: string; label?: string; market?: string; line?: number|null; odds: number; prob: number };
export async function getOddsAll(): Promise<OddsLeg[]> {
  // demo data so UI always shows something
  return [
    { league:"NFL", player:"P. Mahomes", market:"Passing Yards", line:277.5, odds:-110, prob:0.55 },
    { league:"NBA", player:"L. Doncic",  market:"Pts + Ast",     line:41.5,  odds:-105, prob:0.57 },
    { league:"MLB", player:"A. Judge",   market:"Total Bases",   line:1.5,   odds:120,  prob:0.45 },
    { league:"UFC", label:"Fighter A — ML", market:"ML",         line:null,  odds:-145, prob:0.59 }
  ];
}
