import { ask, parseJSON, limited, authorize } from "../../../../lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WRITING = `You are a kind English writing coach for an Indian learner. Given the TASK and the learner's TEXT, output ONLY valid JSON: {"score":number from 1 to 10,"corrected":"the text with mistakes fixed, keeping the learner's meaning","notes":[{"issue":"short explanation in simple English","hindi":"the same tip in Hindi (Devanagari), one short sentence"}],"praise":"one short encouraging sentence"}. Give at most 4 notes.`;
const PRON = `You are an English pronunciation coach for a Hindi-speaking learner. You get TARGET (what the learner should say) and HEARD (what speech recognition heard; it can be imperfect). Output ONLY valid JSON: {"ipa":"IPA of the whole TARGET in American English","words":[{"w":"word","ipa":"/ipa/","ok":true,"tip":""}],"overall":"1-2 encouraging lines in simple English, then a short Hindi line","focus":"the main sound to practise, for example th, v/w, schwa"}. Mark ok=false if the word is missing or different in HEARD and give a short tip (mouth or tongue position, a similar Hindi sound). If HEARD is empty, set ok=true for all words and only give tips for sounds that Hindi speakers find hard.`;

export async function POST(req) {
  if (limited(req)) return Response.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  if (!(await authorize(req))) return Response.json({ error: "Please log in to use AI features." }, { status: 401 });
  let b;
  try { b = await req.json(); } catch (e) { return Response.json({ error: "Bad request" }, { status: 400 }); }
  let system, content;
  if (b.kind === "writing") {
    const text = String(b.text || "").slice(0, 1500);
    if (text.trim().length < 10) return Response.json({ error: "Write a little more first." }, { status: 400 });
    system = WRITING; content = "TASK: " + String(b.task || "").slice(0, 300) + "\nTEXT: " + text;
  } else if (b.kind === "pron") {
    const target = String(b.target || "").slice(0, 300);
    if (!target) return Response.json({ error: "No text" }, { status: 400 });
    system = PRON; content = "TARGET: " + target + "\nHEARD: " + String(b.heard || "").slice(0, 300);
  } else return Response.json({ error: "Unknown request" }, { status: 400 });
  const r = await ask({ system, messages: [{ role: "user", content }], max: 900 });
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const j = parseJSON(r.text);
  if (!j) return Response.json({ error: "Could not read the AI answer. Please try again." }, { status: 502 });
  return Response.json(j);
}
