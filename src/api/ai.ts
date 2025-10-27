export type AILeg = { label: string; odds: number; prob: number };

export async function analyzeSlipAI(rawText: string, note: string): Promise<AILeg[] | null> {
  const key = import.meta.env.VITE_OPENAI_KEY as string | undefined;
  if (!key) return null; // optional feature
  const sys = `You convert raw OCR sportsbook text into JSON legs.
Each leg: { "label": string, "odds": number (American), "prob": number (0-1) }.
If unknown, guess conservatively. Only return JSON array.`;

  const user = `OCR TEXT:
${rawText}

USER NOTE (optional):
${note || "(none)"}

Output ONLY JSON array of legs.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  const j = await res.json();
  const content = j.choices?.[0]?.message?.content || "";
  // response_format=json_object gives something like {"legs":[...]}
  try {
    const data = JSON.parse(content);
    const legs = data.legs || data || [];
    // quick sanitize
    return (legs as any[]).slice(0, 10).map(l => ({
      label: String(l.label ?? "Unknown"),
      odds: Number(l.odds ?? 0),
      prob: Math.max(0, Math.min(1, Number(l.prob ?? 0.5))),
    }));
  } catch {
    return null;
  }
}
