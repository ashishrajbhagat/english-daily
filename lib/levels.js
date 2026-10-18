import { DATA } from "./content";

export const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const LV = {
  Beginner: { ic: "🌱", c: "#1f9d6b", d: "I know basic words but find it hard to build sentences." },
  Intermediate: { ic: "🚀", c: "#2f6bff", d: "I can chat about simple topics but make mistakes." },
  Advanced: { ic: "🔥", c: "#7c4dff", d: "I speak fairly well and want to sound more natural." },
  Expert: { ic: "👑", c: "#f08a00", d: "I am fluent and want polish, nuance and formal English." },
};

const PHL = { Greetings: 0, Daily: 0, Outside: 0, Phone: 0, Travel: 0, Social: 0, Health: 0, Work: 1, Office: 1, Opinions: 1, Idioms: 2, Fluency: 2, Expert: 3 };
export const phLevel = (p) => (p[3] !== undefined ? p[3] : PHL[p[0]] === undefined ? 1 : PHL[p[0]]);
export const voLevel = (i) => Math.min(3, Math.floor(i / 12));
export const pvLevel = (i) => (i < 12 ? 0 : i < 24 ? 1 : 3);
export const voOf = (x, i) => (x[3] !== undefined ? x[3] : voLevel(i));
export const pvOf = (x, i) => (x[3] !== undefined ? x[3] : pvLevel(i));
export const twLevel = (i) => (i < 4 ? 0 : i < 8 ? 1 : 2);
export const tpLevel = (i) => Math.min(3, Math.floor(i / 6));
export const qzLevel = (i) => Math.min(2, Math.floor(i / 10));
const DLL = { Introduction: 0, Restaurant: 0, Shopping: 0, "Doctor Visit": 0, "Phone Call": 1, Airport: 1, Interview: 2, "Job Offer": 2, Complaint: 2, Negotiation: 3, "Presentation Q&A": 3 };
export const dlLevel = (t) => (DLL[t] === undefined ? 1 : DLL[t]);

// items at level L; if too few, borrow from lower levels; never empty
export function pool(list, f, L) {
  let out = list.filter((x, i) => f(x, i) === L);
  for (let k = 1; k <= 3 && out.length < 12; k++) {
    if (L - k < 0) break;
    out = out.concat(list.filter((x, i) => f(x, i) === L - k));
  }
  return out.length ? out : list;
}

export function pools(level) {
  const L = Math.max(0, LEVELS.indexOf(level));
  const lv = (i) => LEVELS.indexOf(DATA.GC[i][0]);
  return {
    ph: pool(DATA.PH, phLevel, L),
    vo: pool(DATA.VO, voOf, L),
    pv: pool(DATA.PV, pvOf, L),
    dl: pool(DATA.DL, (d) => dlLevel(d.t), L),
    tk: pool(DATA.TP, (x, i) => tpLevel(i), L),
    gc: DATA.GC.map((g, i) => i).filter((i) => lv(i) >= L).sort((a, b) => lv(a) - lv(b) || a - b),
  };
}

export function quizPool(L) {
  const grammar = (lvl) => DATA.GC.filter((g) => g[0] === LEVELS[lvl]).flatMap((g) => g[5].map((q) => [q[0], q[1], q[2], g[2]]));
  let out = DATA.QZ.filter((x, i) => (x[4] !== undefined ? x[4] : qzLevel(i)) === L).concat(grammar(L));
  for (let k = 1; k <= 3 && out.length < 8; k++) if (L - k >= 0) out = out.concat(grammar(L - k));
  return out;
}

export function placementQs() {
  const out = [];
  LEVELS.forEach((lv, L) => {
    const qs = DATA.GC.filter((g) => g[0] === lv).flatMap((g) => g[5].map((q) => ({ q: q[0], o: q[1], a: q[2], L })));
    qs.sort(() => Math.random() - 0.5);
    out.push(...qs.slice(0, 3));
  });
  return out;
}

export function placeResult(qs, ans) {
  const ok = [0, 0, 0, 0];
  qs.forEach((q, i) => { if (ans[i] === q.a) ok[q.L]++; });
  let L = 0;
  while (L < 3 && ok[L] >= 2) L++;
  return LEVELS[L];
}
