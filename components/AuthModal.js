"use client";
import { useEffect, useState } from "react";
import { useApp } from "../lib/app";
import { supabase } from "../lib/supabase";
import { getTheme, setTheme } from "../lib/theme";
import { LV } from "../lib/levels";
import { enablePush, disablePush, updatePushTime, pushSupported } from "../lib/push";

const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={"sw" + (on ? " on" : "")} onClick={onChange} />
);

export default function AuthModal() {
  const { authOpen, closeAuth, user, sync, setSkip, level, openLevel, s, resetAll, setRem, setLb, recovery, setRecovery } = useApp();
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState("in");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [nick, setNick] = useState(s.nick || "");
  const [theme, setT] = useState("light");
  const [adm, setAdm] = useState(false);
  const [bg, setBg] = useState(false);
  useEffect(() => {
    if (!supabase || !user) { setAdm(false); return; }
    supabase.from("admins").select("email").maybeSingle().then(({ data }) => setAdm(!!data));
  }, [user]);
  useEffect(() => { try { setBg(localStorage.getItem("ed-bg") === "1"); } catch (e) {} }, [authOpen]);
  useEffect(() => { if (authOpen) { setT(getTheme()); setMsg(""); } }, [authOpen]);
  if (!authOpen) return null;

  const rem = s.rem || { on: false, time: "19:00" };
  const m = recovery ? "recovery" : mode;
  const initial = (user && user.email ? user.email[0] : "U").toUpperCase();

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

  const saveLb = async (on) => {
    const n = nick.trim();
    if (on && (n.length < 2 || n.length > 20)) { setMsg("Choose a nickname of 2 to 20 characters."); return; }
    setLb(on, on ? n : s.nick);
    if (!on && supabase && user) await supabase.from("leaderboard").delete().eq("user_id", user.id);
    setMsg(on ? "Saved. You are on the leaderboard (it updates when your progress syncs)." : "You left the leaderboard.");
  };

  return (
    <div className="modal-bg" onClick={closeAuth}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Account and settings" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-h">
          <div className="en">{tab === 0 ? (user ? "Your account" : recovery ? "New password" : "Welcome") : "Settings"}</div>
          <button className="ib sm-ib" onClick={closeAuth} aria-label="Close">✕</button>
        </div>
        <div className="tabs2" role="tablist">
          <button role="tab" aria-selected={tab === 0} className={tab === 0 ? "on" : ""} onClick={() => setTab(0)}>👤 Account</button>
          <button role="tab" aria-selected={tab === 1} className={tab === 1 ? "on" : ""} onClick={() => setTab(1)}>⚙️ Settings</button>
        </div>
        <div className="sheet-b">
          {tab === 0 && (
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
          {tab === 1 && (
            <>
              <div className="srow">
                <div><b>Appearance</b><small>Light or dark screen</small></div>
                <div className="seg2">
                  <button className={theme === "light" ? "on" : ""} onClick={() => { setTheme("light"); setT("light"); }}>☀️ Light</button>
                  <button className={theme === "dark" ? "on" : ""} onClick={() => { setTheme("dark"); setT("dark"); }}>🌙 Dark</button>
                </div>
              </div>
              <div className="srow">
                <div><b>{LV[level].ic} Level: {level}</b><small>Decides the content you see</small></div>
                <button className="b" onClick={() => { closeAuth(); openLevel(); }}>Change</button>
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
              <div className="srow stack">
                <div><b>Your data</b><small>Clears XP, streak, lessons and roadmaps on this device.</small></div>
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
