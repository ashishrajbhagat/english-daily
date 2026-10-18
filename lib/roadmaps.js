import { DATA } from "./content";
import { pools } from "./levels";

export const ROADMAPS = [
  { id: "quick", name: "Quick Start", emoji: "⚡", days: 15, per: 3, time: "about 15 min a day", desc: "A short sprint to build the habit: speak phrases, learn words and do a grammar lesson each day.", for: "Busy learners, or anyone who wants to try first.", stage: 5 },
  { id: "daily", name: "Daily Habit", emoji: "🗓", days: 30, per: 5, time: "about 25 min a day", desc: "The complete routine: speaking, vocabulary, grammar, a dialogue and free talk, with a review quiz every 5th day.", for: "Most learners. The best all-round plan.", stage: 7 },
  { id: "deep", name: "Deep Fluency", emoji: "🚀", days: 60, per: 5, time: "about 35 min a day", desc: "Two months of steady practice with a checkpoint quiz every week, built for lasting confidence.", for: "Serious learners who want real fluency.", stage: 7 },
];
export const STAGES = ["Foundations", "Build Speed", "Real Conversations", "Confidence", "Fluency", "Mastery", "Polish", "Graduation"];
export const stageCount = (r) => Math.ceil(r.days / r.stage);

export function curDay(rp, r) {
  if (!rp || !rp.start) return 0;
  const st = new Date(rp.start + "T00:00:00").getTime();
  const n = Math.floor((new Date().setHours(0, 0, 0, 0) - st) / 864e5) + 1;
  return Math.max(1, Math.min(r.days, n));
}

export function dayTasks(r, d, level, round = 0) {
  const P = pools(level);
  const i = d - 1;
  const j = i + round * 7;
  const pick = (a, n) => Array.from({ length: n }, (_, k) => a[(j * n + k) % a.length]);
  const L = P.gc.length;
  let gs = P.gc.slice(Math.floor((i * L) / r.days), Math.floor(((i + 1) * L) / r.days)).slice(0, 2);
  if (!gs.length) gs = [P.gc[Math.min(L - 1, Math.floor((i * L) / r.days))]];
  const quizDay = r.id === "deep" ? d % 7 === 0 : d % 5 === 0;
  const ph = { k: "ph", tab: "speak:0", t: "Speak 5 phrases", d: pick(P.ph, 5).map((p) => p[1]) };
  const vo = { k: "vo", tab: "learn:0", t: "Learn 3 words and 1 phrasal verb", d: [...pick(P.vo, 3).map((v) => v[0]), pick(P.pv, 1)[0][0]] };
  const gr = { k: "gr", tab: "grammar:0", t: "Grammar: " + gs.map((x) => DATA.GC[x][1]).join(" + ") };
  const dl = { k: "dl", tab: "speak:1", t: "Practise a dialogue: " + pick(P.dl, 1)[0].t };
  const last = quizDay ? { k: "qz", tab: "test:0", t: "Review quiz" } : { k: "tk", tab: "speak:6", t: "1-minute Free Talk: " + pick(P.tk, 1)[0] };
  return r.per === 3 ? [ph, vo, quizDay ? last : gr] : [ph, vo, gr, dl, last];
}
