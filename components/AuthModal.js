"use client";
import { useState } from "react";
import Seg from "./Seg";
import { useApp } from "../lib/app";
import { supabase } from "../lib/supabase";
import { toggleTheme } from "../lib/theme";

export default function AuthModal() {
  const { authOpen, closeAuth, user, sync, setSkip, level, openLevel } = useApp();
  const [mode, setMode] = useState("in");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!authOpen) return null;

  const run = async (e) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email: em, password: pw })
      : await supabase.auth.signUp({ email: em, password: pw });
    setBusy(false);
    if (error) setMsg(error.message);
    else if (mode === "up" && !data.session) setMsg("A confirmation link was sent to your email. Confirm it, then sign in.");
    else closeAuth();
  };

  return (
    <div className="modal-bg" onClick={closeAuth}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <button className="ib" style={{ float: "right" }} onClick={closeAuth} aria-label="Close">✕</button>
        <div className="en">Account and settings</div>
        <div className="row"><button className="b" onClick={toggleTheme}>🌓 Light / Dark</button><button className="b" onClick={() => { closeAuth(); openLevel(); }}>🎯 Level: {level}</button></div>
        <hr className="hr" />
        {!supabase ? (
          <>
            <div className="en">☁️ Cloud login is not set up yet</div>
            <p className="sm">Add your Supabase URL and key to .env.local (see the README). Until then, progress is saved on this device.</p>
          </>
        ) : user ? (
          <>
            <div className="en" style={{ fontSize: 17 }}>👤 {user.email}</div>
            <p className="sm">{sync === "synced" ? "Progress saved to the cloud ✓" : sync === "error" ? "Sync error, will retry" : "Syncing…"}</p>
            <div className="row"><button className="b" onClick={async () => { await supabase.auth.signOut(); closeAuth(); }}>Sign out</button></div>
          </>
        ) : (
          <form onSubmit={run}>
            <div className="en">☁️ Save your progress</div>
            <p className="sm">Log in to get your plan, XP and streak on any device.</p>
            <Seg items={["Sign in", "Sign up"]} value={mode === "in" ? 0 : 1} onChange={(i) => setMode(i ? "up" : "in")} />
            <div className="row">
              <input className="inp" type="email" required placeholder="Email" value={em} onChange={(e) => setEm(e.target.value)} />
              <input className="inp" type="password" required minLength={6} placeholder="Password (min 6)" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div className="row">
              <button className="b p" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
              <button className="b" type="button" onClick={() => { setSkip(); closeAuth(); }}>Skip for now</button>
            </div>
            {msg && <div className="res">{msg}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
