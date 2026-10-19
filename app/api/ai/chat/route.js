import { ask, parseJSON, limited, authorize } from "../../../../lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SC = {
  free: "a casual chat about anything",
  interview: "a job interview (you are the interviewer)",
  restaurant: "a restaurant (you are the waiter)",
  travel: "travel and directions (you are a helpful local)",
};

export async function POST(req) {
  if (limited(req)) return Response.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  if (!(await authorize(req))) return Response.json({ error: "Please log in to use AI features." }, { status: 401 });
  let b;
  try { b = await req.json(); } catch (e) { return Response.json({ error: "Bad request" }, { status: 400 }); }
  const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-12).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 500),
  }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return Response.json({ error: "No message" }, { status: 400 });
  const system = `You are a friendly English speaking partner for an Indian learner (A2-B1 level). Scenario: ${SC[b.scenario] || SC.free}. Reply in simple English, 2-3 short sentences, and end with one question to keep the conversation going. Also check the learner's LAST message for grammar or word-choice mistakes. Output ONLY valid JSON: {"reply":"...","correction":"the learner's last message corrected, or an empty string if it was already fine","tip":"one short tip about the mistake in simple English, then the same tip in Hindi (Devanagari), or an empty string"}`;
  const r = await ask({ system, messages: msgs });
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const j = parseJSON(r.text) || { reply: r.text, correction: "", tip: "" };
  return Response.json({ reply: String(j.reply || ""), correction: String(j.correction || ""), tip: String(j.tip || "") });
}
