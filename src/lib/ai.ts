export type Leg = { label: string; odds: number; market?: string; line?: string };

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? "";

async function callOpenAI(system: string, user: string) {
  if (!OPENAI_KEY) return { text: "" };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.4
    })
  });
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  return { text };
}

export async function aiSuggest(sport: string, legs: Leg[]) {
  const sys = "You suggest concise, realistic betting legs (1-3 items), neutral tone.";
  const usr = `Sport: ${sport}\nCurrent legs:\n${legs.map(l=>`- ${l.label} (${l.odds})`).join("\n")}\nSuggest additions.`;
  try { const { text } = await callOpenAI(sys, usr); return text || "No suggestions available."; }
  catch { return "AI unavailable."; }
}

export async function aiExplainLeg(leg: Leg) {
  const sys = "Explain a betting leg in one brief paragraph, neutral tone, no guarantees.";
  const usr = JSON.stringify(leg, null, 2);
  try { const { text } = await callOpenAI(sys, usr); return text || "No explanation available."; }
  catch { return "AI unavailable."; }
}
