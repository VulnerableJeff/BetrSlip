export async function aiSuggest(sport: string, legs: any[]) {
  try {
    const res = await fetch("http://localhost:3000/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport, legs }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json(); // { ok: boolean, suggestion?: {...}, error?: string }
  } catch (err) {
    console.error("aiSuggest error:", err);
    return { ok: false, error: String(err) };
  }
}
