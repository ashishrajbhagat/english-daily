// Server-only. Works with ANY OpenAI-compatible provider, including free tiers (Groq, OpenRouter, Google AI Studio...).
const hits = new Map();
export function limited(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 20; // 20 AI requests per 10 minutes per visitor (best effort)
}
// When the site has cloud login, AI is only for logged-in users (protects the free quota).
export async function authorize(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return true;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
  if (!token) return false;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const { data, error } = await createClient(url, key, { auth: { persistSession: false } }).auth.getUser(token);
    return !error && !!data.user;
  } catch (e) { return false; }
}
export const aiEnabled = () => !!(process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL);

export async function ask({ system, messages, max = 500 }) {
  if (!aiEnabled()) return { error: "AI is not switched on for this site.", status: 503 };
  try {
    const r = await fetch(process.env.AI_BASE_URL.replace(/\/$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + process.env.AI_API_KEY },
      body: JSON.stringify({ model: process.env.AI_MODEL, max_tokens: max, temperature: 0.4, messages: [{ role: "system", content: system }, ...messages] }),
    });
    if (r.status === 429) return { error: "The free AI limit is reached for now. Please try again in a minute.", status: 429 };
    if (!r.ok) return { error: "The AI service did not respond. Please try again.", status: 502 };
    const d = await r.json();
    const text = d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : "";
    return { text: text || "" };
  } catch (e) {
    return { error: "Could not reach the AI service.", status: 502 };
  }
}

export function parseJSON(t) {
  try { return JSON.parse(t.replace(/```json|```/g, "").trim()); } catch (e) {}
  const m = t.match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : null; } catch (e) { return null; }
}
