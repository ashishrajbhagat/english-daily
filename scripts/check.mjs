// Content + roadmap integrity checks. Run: npm test
import fs from "fs";
const src = (f) => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
const strip = (t) => t.replace(/^import .*$/gm, "").replace(/^export (const|function) /gm, "$1 ");
const code = strip(src("lib/content.js")) + strip(src("lib/levels.js")) + strip(src("lib/roadmaps.js")) +
  "\nreturn { DATA, LEVELS, pools, quizPool, placementQs, placeResult, ROADMAPS, dayTasks, phLevel, voOf, pvOf };";
const { DATA, LEVELS, pools, quizPool, placementQs, placeResult, ROADMAPS, dayTasks, phLevel, voOf, pvOf } = new Function(code)();
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
console.log(fails ? fails + " check(s) failed" : "All content and roadmap checks passed");
process.exit(fails ? 1 : 0);
