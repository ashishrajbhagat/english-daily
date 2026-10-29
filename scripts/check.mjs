// Content + roadmap integrity checks. Run: npm test
import fs from "fs";
const src = (f) => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
const strip = (t) => t.replace(/^import .*$/gm, "").replace(/^export (const|function) /gm, "$1 ");
const code = strip(src("lib/content.js")) + strip(src("lib/levels.js")) + strip(src("lib/roadmaps.js")) + strip(src("lib/srs.js")) + strip(src("lib/week.js")) + strip(src("lib/i18n.js")) +
  "\nreturn { DATA, LEVELS, pools, quizPool, placementQs, placeResult, ROADMAPS, dayTasks, phLevel, voOf, pvOf, isDue, answered, DAYS_SRS: DAYS, weekStart, weekXp, HI, dlOf, trString };";
const { DATA, LEVELS, pools, quizPool, placementQs, placeResult, ROADMAPS, dayTasks, phLevel, voOf, pvOf, isDue, answered, DAYS_SRS, weekStart, weekXp, HI, dlOf, trString } = new Function(code)();
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL:", m); } };
const mcq = (q, where) => ok(Array.isArray(q[1]) && q[1].length >= 2 && q[2] >= 0 && q[2] < q[1].length, "bad answer index in " + where + ": " + q[0]);
const deva = /[\u0900-\u097F]/;

DATA.GC.forEach((g) => { ok(g.length === 7, "lesson shape " + g[1]); ok(deva.test(g[6] || ""), "missing Hindi note " + g[1]); g[5].forEach((q) => mcq(q, g[1])); });
DATA.QZ.forEach((q) => mcq(q, "QZ"));
DATA.RD.forEach((r) => r[3].forEach((q) => mcq(q, "RD " + r[1])));
DATA.WR.forEach((w) => ok(w.length === 5 && w[3].length === 3, "WR shape " + w[1]));
DATA.SP.forEach((p) => ok(p.length === 5, "SP shape " + p[0]));
LEVELS.forEach((lv, L) => {
  const P = pools(lv);
  ["ph", "vo", "pv", "dl", "tk", "gc"].forEach((k) => ok(P[k].length > 0, "empty pool " + k + " @" + lv));
  ok(quizPool(L).length >= 8, "quiz pool too small @" + lv);
  ok(DATA.RD.some((r) => r[0] === L) && DATA.WR.some((w) => w[0] === L), "no reading/writing @" + lv);
  ROADMAPS.forEach((r) => {
    for (let d = 1; d <= r.days; d++) {
      const t = dayTasks(r, d, lv, 0);
      ok(t.length === r.per, "task count " + r.id + " d" + d + " @" + lv);
      t.forEach((x) => ok(x.t && !/undefined/.test(JSON.stringify(x)), "bad task " + r.id + " d" + d + " @" + lv + " " + JSON.stringify(x)));
    }
  });
});
const pq = placementQs();
ok(pq.length === 12, "placement has 12 questions");
ok(placeResult(pq, pq.map((q) => q.a)) === "Expert", "all correct -> Expert");
ok(placeResult(pq, pq.map((q) => (q.a + 1) % q.o.length)) === "Beginner", "all wrong -> Beginner");
ok(phLevel(["Custom", "x", "y", 2]) === 2, "phrase level override");
ok(voOf(["w", "h", "e", 1], 0) === 1 && voOf(["w", "h", "e"], 0) === 0 && voOf(["w", "h", "e"], 40) === 3, "word level override and buckets");
ok(pvOf(["w", "h", "e", 2], 0) === 2, "phrasal level override");
DATA.QZ.push(["Custom Q?", ["a", "b"], 0, "e", 3]);
ok(quizPool(3).some((q) => q[0] === "Custom Q?"), "custom quiz appears at its level");
DATA.QZ.pop();
DATA.GR.forEach((g) => ok(g.length === 2 && g[0] && g[1], "quick tip shape " + g[0]));
DATA.PH.forEach((p) => ok(p.length >= 3 && (p[3] === undefined || (p[3] >= 0 && p[3] <= 3)), "phrase shape " + p[1]));
DATA.PV.concat(DATA.VO).forEach((w) => ok(w.length >= 3 && (w[3] === undefined || (w[3] >= 0 && w[3] <= 3)), "word shape " + w[0]));
ok(new Set(DATA.PH.map((p) => p[1])).size === DATA.PH.length, "phrase texts are unique (they are used as keys)");
DATA.DL.forEach((d) => ok(d.l.length >= 2 && d.l.every((x) => x[0] && x[1]), "dialogue shape " + d.t));
// spaced repetition
{
  const t0 = 1e12, day = 864e5;
  let m = { q: "x", o: ["a", "b"], a: 0 };
  ok(isDue(m, t0), "new mistake is due now");
  m = answered(m, true, t0); ok(m.box === 1 && m.due === t0 + day && !isDue(m, t0), "1st correct: back in 1 day");
  m = answered(m, true, t0); ok(m.box === 2 && m.due === t0 + 3 * day, "2nd correct: back in 3 days");
  m = answered(m, true, t0); ok(m.box === 3 && m.due === t0 + 7 * day, "3rd correct: back in 7 days");
  ok(answered(m, false, t0).box === 0 && isDue(answered(m, false, t0), t0), "wrong answer resets the box");
  ok(answered(m, true, t0) === null, "4th correct: learned");
}
// weekly leaderboard helpers
ok(weekStart(new Date(2026, 9, 21)) === "2026-10-19", "week starts on Monday");
ok(weekStart(new Date(2026, 9, 25)) === "2026-10-19" && weekStart(new Date(2026, 9, 26)) === "2026-10-26", "Sunday belongs to the previous Monday's week");
ok(weekXp({ "2026-10-18": 50, "2026-10-19": 20, "2026-10-21": 30 }, "2026-10-19") === 50, "weekly XP counts only the current week");
// Hindi mode
Object.entries(HI).forEach(([k, v]) => ok(v && (deva.test(v) || !/[A-Za-z\u0900-\u097F]/.test(v)), "Hindi text missing for: " + k));
ok(trString("Quiz") === "क्विज़" && trString("  Quiz ") === "  क्विज़ " && trString("Continue Day ") === "जारी रखें, दिन ", "translator: exact and padded matches");
ok(trString("Day 3 of 30") === "दिन 3 / 30" && trString("Mistake notebook (2 due)") === "गलतियों की कॉपी (2 बाकी)", "translator: number patterns");
ok(trString("A phrase that is learning content") === null && trString("   ") === null, "translator: unknown text is left alone");
ok(dlOf({ t: "Custom", l: [], lv: 3 }) === 3 && dlOf({ t: "Airport" }) === 1, "dialogue level override");
console.log(fails ? fails + " check(s) failed" : "All content and roadmap checks passed");
process.exit(fails ? 1 : 0);
