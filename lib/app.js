"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { loadCustom } from "./custom";
import { burst } from "./confetti";
import { GUEST } from "./access";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const init = { xp: 0, streak: 0, last: "", day: "", today: 0, gd: {}, rp: {}, mk: [], sk: false, level: "", ls: false, ar: "", fz: 0, rem: { on: false, time: "19:00" }, lb: false, nick: "", goal: 30, txp: 0, hist: {}, fav: [], ond: false, shadow: false };
const todayISO = () => new Date().toLocaleDateString("en-CA");

// accepts old saved data (single plan) and upgrades it
const norm = (p) => {
  const q = { ...init, ...p, gd: p.gd || {}, rp: { ...(p.rp || {}) }, mk: p.mk || [] };
  if (p.planStart && !q.rp.daily) q.rp.daily = { start: p.planStart, pd: p.pd || {}, round: p.round || 0 };
  if (!q.ar && q.rp.daily) q.ar = "daily";
  delete q.planStart; delete q.pd; delete q.round;
  return q;
};
const mergeRp = (a, b) => {
  const out = {};
  Object.keys({ ...a, ...b }).forEach((k) => {
    const x = a[k], y = b[k];
    if (!x || !y) { out[k] = x || y; return; }
    const rx = x.round || 0, ry = y.round || 0;
    out[k] = rx !== ry ? (rx > ry ? x : y) : { start: [x.start, y.start].filter(Boolean).sort()[0] || "", round: rx, pd: { ...y.pd, ...x.pd } };
  });
  return out;
};
const mergeHist = (a = {}, b = {}) => { const o = { ...b }; Object.keys(a).forEach((k) => { o[k] = Math.max(a[k] || 0, o[k] || 0); }); return o; };
const merge = (a0, b0) => {
  const a = norm(a0), b = norm(b0);
  const base = b.xp >= a.xp ? b : a;
  return {
    ...base, xp: Math.max(a.xp, b.xp), streak: Math.max(a.streak, b.streak),
    gd: { ...b.gd, ...a.gd }, rp: mergeRp(a.rp, b.rp),
    mk: [...a.mk, ...b.mk.filter((x) => !a.mk.some((y) => y.q === x.q))].slice(-50),
    sk: a.sk || b.sk, ls: a.ls || b.ls, level: a.level || b.level, ar: a.ar || b.ar,
    fz: Math.max(a.fz || 0, b.fz || 0), rem: (a.rem && a.rem.on) ? a.rem : (b.rem || a.rem), lb: a.lb || b.lb, nick: a.nick || b.nick,
    ond: a.ond || b.ond, shadow: a.shadow || b.shadow, goal: a.goal || b.goal || 30, hist: mergeHist(a.hist, b.hist), fav: [...new Set([...(a.fav || []), ...(b.fav || [])])],
  };
};
const patchRp = (p, id, fn) => ({ ...p, ar: id, rp: { ...p.rp, [id]: fn(p.rp[id] || { start: "", pd: {}, round: 0 }) } });

export function AppProvider({ children }) {
  const [s, setS] = useState(init);
  const [ready, setReady] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [sync, setSync] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [authTab, setAuthTab] = useState(0);
  const [cv, setCv] = useState(0);
  useEffect(() => { loadCustom().then((ch) => { if (ch) setCv((v) => v + 1); }); }, []);
  const [toast, setToast] = useState("");
  const [ai, setAi] = useState(false);
  useEffect(() => { fetch("/api/ai/status").then((r) => r.json()).then((j) => setAi(!!j.enabled)).catch(() => {}); }, []);
  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 3200); }, []);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("ed") || localStorage.getItem("fp") || localStorage.getItem("su") || "{}");
      setS(norm(v));
    } catch (e) {}
    setReady(true);
  }, []);

  const upd = useCallback((fn) => setS((p) => {
    const n = fn(p);
    try { localStorage.setItem("ed", JSON.stringify(n)); } catch (e) {}
    return n;
  }), []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session ? data.session.user : null));
    const { data } = supabase.auth.onAuthStateChange((ev, ses) => {
      setUser(ses ? ses.user : null);
      if (ev === "PASSWORD_RECOVERY") { setRecovery(true); setAuthOpen(true); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (!user) { setLoaded(false); setSync(""); return; }
    supabase.from("progress").select("data").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data && data.data) upd((p) => merge(p, data.data));
      setLoaded(true);
    });
  }, [user, upd]);

  useEffect(() => {
    if (!supabase || !user || !loaded) return;
    setSync("syncing");
    const t = setTimeout(() => {
      supabase.from("progress").upsert({ user_id: user.id, data: s, updated_at: new Date().toISOString() })
        .then(async ({ error }) => {
          setSync(error ? "error" : "synced");
          if (!error && s.lb && s.nick) await supabase.from("leaderboard").upsert({ user_id: user.id, nick: s.nick, xp: s.xp, updated_at: new Date().toISOString() });
        });
    }, 1200);
    return () => clearTimeout(t);
  }, [s, user, loaded]);

  const addXp = useCallback((n) => upd((p) => {
    const t = new Date().toDateString();
    const q = { ...p };
    if (q.day !== t) { q.day = t; q.today = 0; q.txp = 0; }
    if (q.last !== t) {
      const y = new Date(Date.now() - 864e5).toDateString();
      const y2 = new Date(Date.now() - 2 * 864e5).toDateString();
      if (q.last === y) q.streak += 1;
      else if (q.last === y2 && (q.fz || 0) > 0) { q.fz -= 1; q.streak += 1; }
      else q.streak = 1;
      q.last = t;
      if (q.streak > 0 && q.streak % 7 === 0) q.fz = Math.min(2, (q.fz || 0) + 1);
    }
    q.xp += n; q.today += 1; q.txp = (q.txp || 0) + n;
    const iso = todayISO();
    const h = { ...(q.hist || {}) };
    h[iso] = (h[iso] || 0) + n;
    const keys = Object.keys(h).sort();
    while (keys.length > 30) delete h[keys.shift()];
    q.hist = h;
    return q;
  }), [upd]);

  const doneLesson = useCallback((i) => upd((p) => (p.gd[i] ? p : { ...p, gd: { ...p.gd, [i]: 1 } })), [upd]);
  const startRoadmap = useCallback((id) => upd((p) => patchRp(p, id, () => ({ start: todayISO(), pd: {}, round: 0 }))), [upd]);
  const nextRound = useCallback((id) => upd((p) => patchRp(p, id, (r) => ({ start: todayISO(), pd: {}, round: (r.round || 0) + 1 }))), [upd]);
  const toggleTask = useCallback((id, key) => upd((p) => patchRp(p, id, (r) => {
    const pd = { ...r.pd };
    if (pd[key]) delete pd[key]; else pd[key] = 1;
    return { ...r, pd };
  })), [upd]);
  const resetRoadmap = useCallback((id) => upd((p) => { const rp = { ...p.rp }; delete rp[id]; return { ...p, rp, ar: p.ar === id ? "" : p.ar }; }), [upd]);
  const setLevel = useCallback((l) => upd((p) => ({ ...p, level: l, ls: true })), [upd]);
  const setLevelSkip = useCallback(() => upd((p) => ({ ...p, ls: true })), [upd]);
  const setSkip = useCallback(() => upd((p) => ({ ...p, sk: true })), [upd]);
  const addMistake = useCallback((it) => upd((p) => (p.mk.some((x) => x.q === it.q) ? p : { ...p, mk: [...p.mk, it].slice(-50) })), [upd]);
  const removeMistake = useCallback((q) => upd((p) => ({ ...p, mk: p.mk.filter((x) => x.q !== q) })), [upd]);

  useEffect(() => {
    if (!ready || s.day !== new Date().toDateString() || !(s.txp > 0) || s.txp < (s.goal || 30)) return;
    const key = "ed-goal-" + new Date().toDateString();
    try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch (e) {}
    burst(); notify("🎯 Daily goal reached. Well done!");
  }, [s.txp, s.goal, s.day, ready, notify]);
  const setShadow = useCallback((v) => upd((p) => ({ ...p, shadow: v })), [upd]);
  const setOnd = useCallback((v) => upd((p) => ({ ...p, ond: v })), [upd]);
  const setGoal = useCallback((n) => upd((p) => ({ ...p, goal: n })), [upd]);
  const toggleFav = useCallback((t) => upd((p) => { const f = p.fav || []; return { ...p, fav: f.includes(t) ? f.filter((x) => x !== t) : [...f, t] }; }), [upd]);
  const markMistake = useCallback((q, ok) => upd((p) => ({ ...p, mk: p.mk.map((x) => (x.q === q ? { ...x, ok } : x)) })), [upd]);
  const resetAll = useCallback(() => upd((p) => ({ ...init, level: p.level, ls: true, sk: p.sk, lb: p.lb, nick: p.nick, rem: p.rem, goal: p.goal, fav: p.fav, ond: p.ond, shadow: p.shadow })), [upd]);
  const setRem = useCallback((rem) => upd((p) => ({ ...p, rem })), [upd]);
  const setLb = useCallback((lb, nick) => upd((p) => ({ ...p, lb, nick })), [upd]);

  const guest = !!supabase && !user;
  const access = {
    guest,
    roadmap: (id) => !guest || GUEST.roadmaps.includes(id),
    stats: !guest || GUEST.statsDetail,
    goal: !guest || GUEST.dailyGoal,
    ai: !guest || GUEST.ai,
    certificate: !guest || GUEST.certificate,
  };

  const value = {
    s, ready, level: s.level || "Beginner", addXp, doneLesson, startRoadmap, nextRound, toggleTask, resetRoadmap,
    setLevel, setLevelSkip, setSkip, addMistake, removeMistake, rate, setRate, user, sync, cloud: !!supabase, resetAll, setRem, setLb, recovery, setRecovery, cv, setGoal, toggleFav, markMistake, notify, setOnd, setShadow, ai,
    access, authTab, authOpen, openAuth: (t) => { setAuthTab(typeof t === "number" ? t : 0); setAuthOpen(true); }, closeAuth: () => setAuthOpen(false),
    levelOpen, openLevel: () => setLevelOpen(true), closeLevel: () => setLevelOpen(false),
    infoOpen, openInfo: () => setInfoOpen(true), closeInfo: () => setInfoOpen(false),
  };
  return <Ctx.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}</div>}</Ctx.Provider>;
}
