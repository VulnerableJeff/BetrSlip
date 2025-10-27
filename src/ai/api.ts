const MODEL = import.meta.env.VITE_AI_MODEL || "gpt-4o-mini";
const KEY   = import.meta.env.VITE_OPENAI_API_KEY;

export async function aiChatJSON(system: string, user: any, temperature=0.2): Promise<any> {
  if (!KEY) throw new Error("Missing VITE_OPENAI_API_KEY");
  const body = {
    model: MODEL,
    temperature,
    response_format: { type: "json_object" },
    messages: [{ role:"system", content: system }, { role:"user", content: user }]
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${KEY}` },
    body: JSON.stringify(body)
  });
  if(!res.ok) throw new Error(`AI ${res.status}`);
  const data = await res.json();
  const txt = data?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(txt); } catch { return {}; }
}
