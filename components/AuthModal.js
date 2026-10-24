"use client";
import { useEffect, useState } from "react";
import { useApp } from "../lib/app";
import { supabase } from "../lib/supabase";
import { getTheme, setTheme, getZoom, setZoom } from "../lib/theme";
import { LV } from "../lib/levels";
import { enablePush, disablePush, updatePushTime, pushSupported } from "../lib/push";

const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={"sw" + (on ? " on" : "")} onClick={onChange} />
);
const TITLES = ["Your progress", "Account", "Settings"];

export default function AuthModal() {
  const { authOpen, closeAuth, user, sync, setSkip, level, openLevel, openInfo, s, resetAll, setRem, setLb, setGoal, setOnd, setShadow, recovery, setRecovery, cloud, access, authTab, setLang } = useApp();
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState("in");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [nick, setNick] = useState(s.nick || "");
  const [theme, setT] = useState("light");
  const [zoom, setZ] = useState("1");
  const [adm, setAdm] = useState(false);
  const [bg, setBg] = useState(false);
  const [canInstall, setCan] = useState(false);

  useEffect(() => {
    if (!authOpen) return;
    setT(getTheme()); setZ(getZoom()); setMsg(""); setTab(recovery ? 1 : authTab); setCan(!!window.__installPrompt);
    try { setBg(localStorage.getItem("ed-bg") === "1"); } catch (e) {}
  }, [authOpen]);
  useEffect(() => {
    const h = () => setCan(true);
    window.addEventListener("ed-install", h);
    return () => window.removeEventListener("ed-install", h);
  }, []);
  useEffect(() => {
    if (!supabase || !user) { setAdm(false); return; }
    supabase.from("admins").select("email").maybeSingle().then(({ data }) => setAdm(!!data));
  }, [user]);
  if (!authOpen) return null;

  const rem = s.rem || { on: false, time: "19:00" };
  const m = recovery ? "recovery" : mode;
  const initial = (user && user.email ? user.email[0] : "U").toUpperCase();
  const goal = s.goal || 30;
  const tx = s.day === new Date().toDateString() ? (s.txp || 0) : 0;
  const hist = s.hist || {};
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    return { k: d.toLocaleDateString("en-CA"), l: d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 3) };
  });
  const max = Math.max(goal, ...days.map((x) => hist[x.k] || 0));

  const run = async (e) => {
    e.preventDefault(); setBusy(true); setMsg("");
    if (m === "forgot") {
      const r = await supabase.auth.resetPasswordForEmail(em, { redirectTo: window.location.origin });
      setBusy(false); setMsg(r.error ? r.error.message : "If this email has an account, a reset link is on its way."); return;
    }
    if (m === "recovery") {
      const r = await supabase.auth.updateUser({ password: pw });
      setBusy(false);
      if (r.error) setMsg(r.error.message); else { setRecovery(false); setPw(""); closeAuth(); }
      return;
    }
    const r = m === "in" ? await supabase.auth.signInWithPassword({ email: em, password: pw }) : await supabase.auth.signUp({ email: em, password: pw });
    setBusy(false);
    if (r.error) setMsg(r.error.message);
    else if (m === "up" && !r.data.session) setMsg("A confirmation link was sent to your email. Confirm it, then sign in.");
    else closeAuth();
  };

  const del = async () => {
    if (!window.confirm("Delete your account and cloud data permanently? This cannot be undone.")) return;
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/account/delete", { method: "POST", headers: { Authorization: "Bearer " + (data.session ? data.session.access_token : "") } });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { await supabase.auth.signOut(); closeAuth(); window.alert("Your account was deleted. Progress on this device was kept."); }
    else setMsg(j.error || "Could not delete the account.");
  };

  const toggleRem = async () => {
    if (!rem.on) {
      if (!("Notification" in window)) { setMsg("This browser does not support notifications."); return; }
      const p = await Notification.requestPermission();
      if (p !== "granted") { setMsg("Please allow notifications in your browser to use reminders."); return; }
    }
    setRem({ ...rem, on: !rem.on });
  };
  const toggleBg = async () => {
    setMsg("");
    try {
      if (bg) { await disablePush(); localStorage.setItem("ed-bg", "0"); setBg(false); }
      else { await enablePush(user, rem.time); localStorage.setItem("ed-bg", "1"); setBg(true); setMsg("Background reminder is on."); }
    } catch (e) { setMsg(e.message || "Could not change the background reminder."); }
  };
  const install = async () => {
    const p = window.__installPrompt;
    if (!p) return;
    p.prompt();
    try { await p.userChoice; } catch (e) {}
    window.__installPrompt = null; setCan(false);
  };
  const saveLb = async (on) => {
    const n = nick.trim();
    if (on && (n.length < 2 || n.length > 20)) { setMsg("Choose a nickname of 2 to 20 characters."); return; }
    setLb(on, on ? n : s.nick);
    if (!on && supabase && user) await supabase.from("leaderboard").delete().eq("user_id", user.id);
    setMsg(on ? "Saved. You are on the leaderboard (it updates when your progress syncs)." : "You left the leaderboard.");
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setMsg(error.message);
  };
  const share = async () => {
    const text = "I'm on a " + s.streak + "-day streak with " + s.xp + " XP on English Daily. Learn to speak English a little every day!";
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "English Daily", text, url });
      else { await navigator.clipboard.writeText(text + " " + url); setMsg("Copied to your clipboard."); }
    } catch (e) {}
  };

  return (
    <div className="modal-bg" onClick={closeAuth}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Profile" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-h">
          <div className="en">{tab === 1 && !user && !recovery ? "Welcome" : tab === 1 && recovery ? "New password" : TITLES[tab]}</div>
          <button className="ib sm-ib" onClick={closeAuth} aria-label="Close">✕</button>
        </div>
        <div className="tabs2" role="tablist">
          {[["📊", "Stats"], ["👤", "Account"], ["⚙️", "Settings"]].map(([ic, l], i) => (
            <button key={l} role="tab" aria-selected={tab === i} className={tab === i ? "on" : ""} onClick={() => setTab(i)}><b>{ic}</b>{l}</button>
          ))}
        </div>
        <div className="sheet-b">
          {tab === 0 && (
            <>
              <div className="stats3">
                <button className="st t2" onClick={openInfo}><b>⭐ {s.xp}</b><span>XP points</span></button>
                <button className="st t1" onClick={openInfo}><b>🔥 {s.streak}</b><span>day streak</span></button>
                <button className="st t3 lv" style={{ "--lc": LV[level].c }} onClick={() => { closeAuth(); openLevel(); }}><b>{LV[level].ic}</b><span>{level}</span></button>
              </div>
              <p className="sm">Tap XP or streak to see how they work. Tap your level to change it. ❄️ Streak freezes: {s.fz || 0}</p>
              <button className="b full" onClick={share}>📤 Share my progress</button>
              {access.stats ? (
                <>
              <h3 className="sec-t">Daily goal</h3>
              <div className="rowb"><b>🎯 {Math.min(tx, goal)} / {goal} XP today</b><span className="sm">{tx >= goal ? "Reached! 🎉" : (goal - tx) + " to go"}</span></div>
              <div className="bar"><i style={{ width: Math.min(100, (tx / goal) * 100) + "%" }} /></div>
              <h3 className="sec-t">This week</h3>
              <div className="wk">
                {days.map((x) => { const v = hist[x.k] || 0; return <div key={x.k}><span className="sm">{v || ""}</span><i style={{ height: Math.max(4, (v / max) * 80) + "px" }} /><span className="sm">{x.l}</span></div>; })}
              </div>
                </>
              ) : (
                <div className="notice" style={{ marginTop: 14 }}>
                  <b>🔒 Daily goal and weekly chart</b>
                  <div className="sm">Log in to unlock them. Your progress so far is kept and moves to your account.</div>
                  <button className="b p full" style={{ marginTop: 10 }} onClick={() => setTab(1)}>Log in or sign up</button>
                </div>
              )}
              {cloud && !user && (
                <div className="notice">
                  <b>Save your progress</b>
                  <div className="sm">Log in to keep your XP, streak and roadmaps on every device.</div>
                  <button className="b p full" style={{ marginTop: 10 }} onClick={() => setTab(1)}>Log in or sign up</button>
                </div>
              )}
            </>
          )}

          {tab === 1 && (
            !supabase ? (
              <>
                <div className="benefits"><div>☁️ <span>Cloud login is not set up yet.</span></div></div>
                <p className="sm">Add your Supabase URL and key to .env.local (see the README). Until then, your progress is saved on this device.</p>
              </>
            ) : user ? (
              <>
                <div className="profile">
                  <span className="avatar">{initial}</span>
                  <div><b className="em">{user.email}</b><div className={"sync " + sync}>{sync === "synced" ? "✓ Progress saved to the cloud" : sync === "error" ? "Sync error, will retry" : "Syncing…"}</div></div>
                </div>
                <div className="srow stack">
                  <div><b>🏆 Leaderboard</b><small>Show your nickname and XP to other learners. Optional.</small></div>
                  <input className="inp" value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} placeholder="Nickname (2 to 20 characters)" aria-label="Nickname" />
                  {s.lb ? (
                    <div className="row" style={{ marginTop: 0 }}>
                      <button className="b" onClick={() => saveLb(true)}>Update nickname</button>
                      <button className="b" onClick={() => saveLb(false)}>Leave leaderboard</button>
                    </div>
                  ) : <button className="b p full" onClick={() => saveLb(true)}>Join leaderboard</button>}
                </div>
                <button className="b full" style={{ marginTop: 14 }} onClick={async () => { await supabase.auth.signOut(); closeAuth(); }}>Sign out</button>
                {adm && <a className="b full alink" href="/admin">🛠 Admin panel</a>}
                <details className="danger">
                  <summary>Delete account</summary>
                  <p className="sm">This permanently deletes your account and cloud data. Progress saved on this device stays.</p>
                  <button className="b dng full" onClick={del}>Delete my account</button>
                </details>
              </>
            ) : (
              <>
                {!recovery && (
                  <div className="benefits">
                    <div>☁️ <span>Keep your progress on every device</span></div>
                    <div>🔥 <span>Never lose your streak</span></div>
                    <div>🏆 <span>Join the leaderboard (optional)</span></div>
                  </div>
                )}
                {process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1" && !recovery && (
                  <>
                    <button className="b full" type="button" onClick={google}>🔐 Continue with Google</button>
                    <div className="orline"><span>or use email</span></div>
                  </>
                )}
                {m !== "forgot" && !recovery && (
                  <div className="mode2">
                    <button className={m === "in" ? "on" : ""} onClick={() => setMode("in")}>Sign in</button>
                    <button className={m === "up" ? "on" : ""} onClick={() => setMode("up")}>Create account</button>
                  </div>
                )}
                <form className="form" onSubmit={run}>
                  {m === "forgot" && <p className="sm">Enter your email and we will send you a reset link.</p>}
                  {m !== "recovery" && <label className="fld">Email<input className="inp" type="email" required autoComplete="email" value={em} onChange={(e) => setEm(e.target.value)} placeholder="you@example.com" /></label>}
                  {m !== "forgot" && <label className="fld">{m === "recovery" ? "New password" : "Password"}<input className="inp" type="password" required minLength={6} autoComplete={m === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" /></label>}
                  <button className="b p full" type="submit" disabled={busy}>{busy ? "Please wait…" : m === "in" ? "Sign in" : m === "up" ? "Create account" : m === "forgot" ? "Send reset link" : "Update password"}</button>
                  {m === "in" && <button type="button" className="lnk" onClick={() => setMode("forgot")}>Forgot password?</button>}
                  {m === "forgot" && <button type="button" className="lnk" onClick={() => setMode("in")}>← Back to sign in</button>}
                </form>
                {!recovery && <button className="lnk skip" onClick={() => { setSkip(); closeAuth(); }}>Skip for now</button>}
              </>
            )
          )}

          {tab === 2 && (
            <>
              <div className="srow">
                <div><b>🎨 Appearance</b><small>Light or dark screen</small></div>
                <div className="seg2">
                  <button className={theme === "light" ? "on" : ""} onClick={() => { setTheme("light"); setT("light"); }}>☀️ Light</button>
                  <button className={theme === "dark" ? "on" : ""} onClick={() => { setTheme("dark"); setT("dark"); }}>🌙 Dark</button>
                </div>
              </div>
              <div className="srow">
                <div><b>🌐 Language</b><small>Hindi changes the menus, headings and main buttons.</small></div>
                <div className="seg2">
                  <button className={(s.lang || "en") === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
                  <button className={s.lang === "hi" ? "on" : ""} onClick={() => setLang("hi")}>हिन्दी</button>
                </div>
              </div>
              <div className="srow">
                <div><b>🔠 Text size</b><small>Make everything larger</small></div>
                <div className="seg3">
                  {[["1", "A"], ["1.12", "A+"], ["1.25", "A++"]].map(([z, l]) => (
                    <button key={z} className={zoom === z ? "on" : ""} onClick={() => { setZoom(z); setZ(z); }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="srow">
                <div><b>🔁 Shadowing mode</b><small>After you tap Listen on a phrase, the microphone starts so you can repeat it right away.</small></div>
                <Switch on={!!s.shadow} onChange={() => setShadow(!s.shadow)} label="Shadowing mode" />
              </div>
              <div className="srow">
                <div><b>🧠 On-device AI speech check</b><small>Free. Works in every browser and offline after a one-time download of about 40 MB. Slower than the normal check.</small></div>
                <Switch on={!!s.ond} onChange={() => setOnd(!s.ond)} label="On-device AI speech check" />
              </div>
              <div className="srow">
                <div><b>{LV[level].ic} Level: {level}</b><small>Decides the content you see</small></div>
                <button className="b" onClick={() => { closeAuth(); openLevel(); }}>Change</button>
              </div>
              <div className="srow">
                <div><b>🎯 Daily goal</b><small>XP to earn each day</small></div>
                <select className="seln" value={goal} onChange={(e) => setGoal(+e.target.value)} aria-label="Daily goal in XP">
                  {[20, 30, 50, 100].map((g) => <option key={g} value={g}>{g} XP</option>)}
                </select>
              </div>
              <div className="srow">
                <div><b>⏰ Daily reminder</b><small>Works while English Daily is open in your browser</small></div>
                <Switch on={!!rem.on} onChange={toggleRem} label="Daily reminder" />
              </div>
              <div className="srow">
                <div><b>🔔 Reminder when the app is closed</b><small>{!pushSupported() ? "Not available on this site yet." : user ? "Sends a notification at your reminder time." : "Log in to turn this on."}</small></div>
                {pushSupported() && user ? <Switch on={bg} onChange={toggleBg} label="Background reminder" /> : null}
              </div>
              {(rem.on || bg) && (
                <div className="srow"><div><b>Reminder time</b></div><input type="time" className="inp tm" value={rem.time} onChange={(e) => { setRem({ ...rem, time: e.target.value }); if (bg) updatePushTime(e.target.value); }} aria-label="Reminder time" /></div>
              )}
              <div className="srow">
                <div><b>📲 Install app</b><small>{canInstall ? "Opens like a normal app, even offline." : "Use your browser menu: Add to Home Screen (iPhone: Share, then Add to Home Screen)."}</small></div>
                {canInstall ? <button className="b p" onClick={install}>Install</button> : null}
              </div>
              <div className="srow stack">
                <div><b>🗂️ Your data</b><small>Clears XP, streak, lessons and roadmaps on this device.</small></div>
                <button className="b dng full" onClick={() => { if (window.confirm("Reset all your progress on this device? XP, streak, lessons and roadmaps will be cleared.")) { resetAll(); closeAuth(); } }}>Reset my progress</button>
              </div>
              <p className="sm" style={{ marginTop: 14 }}><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Use</a></p>
            </>
          )}
          {msg && <div className="notice" role="status">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
