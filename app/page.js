"use client";
import { useEffect, useState } from "react";
import { AppProvider, useApp } from "../lib/app";
import { LV } from "../lib/levels";
import { initTheme, initZoom } from "../lib/theme";
import AuthModal from "../components/AuthModal";
import LevelPicker from "../components/LevelPicker";
import InfoModal from "../components/InfoModal";
import Home from "../components/Home";
import Roadmaps from "../components/Roadmaps";
import Practice from "../components/Practice";
import Learn from "../components/Learn";
import Grammar from "../components/Grammar";
import Test from "../components/Test";

const TABS = [["home", "🏠", "Home"], ["roadmap", "🗺", "Roadmap"], ["speak", "🎤", "Speak"], ["learn", "📚", "Learn"], ["grammar", "📘", "Grammar"], ["test", "✅", "Quiz"]];
const VIEW = { home: Home, roadmap: Roadmaps, speak: Practice, learn: Learn, grammar: Grammar, test: Test };

function Legal() {
  const mail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return <><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>{mail ? <> · <a href={"mailto:" + mail}>Feedback</a></> : null}</>;
}

function Shell() {
  const { s, user, level, ready, openAuth, openLevel, openInfo } = useApp();
  const [nav, setNav] = useState({ tab: "home", sub: 0 });
  const [date, setDate] = useState("");
  useEffect(() => {
    initTheme();
    const dl = new URLSearchParams(window.location.search).get("tab");
    if (dl) go(dl);
    initZoom();
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); window.__installPrompt = e; window.dispatchEvent(new Event("ed-install")); });
    setDate(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => { if (ready && !s.level && !s.ls) openLevel(); }, [ready]);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, [nav]);
  // daily reminder (works while the app is open)
  useEffect(() => {
    const r = s.rem;
    if (!r || !r.on || typeof Notification === "undefined") return;
    const id = setInterval(() => {
      const n = new Date();
      const hm = String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0");
      const key = "ed-rem-" + n.toDateString();
      if (hm === r.time && Notification.permission === "granted" && !localStorage.getItem(key) && s.day !== n.toDateString()) {
        localStorage.setItem(key, "1");
        new Notification("English Daily", { body: "Time for your daily English practice! 🦉" });
      }
    }, 20000);
    return () => clearInterval(id);
  }, [s.rem, s.day]);
  const go = (id) => { const [t, sb] = id.split(":"); setNav({ tab: t, sub: +sb || 0 }); };
  const View = VIEW[nav.tab];
  const xp = <button className="chip" onClick={openInfo} aria-label="What is XP?">⭐ {s.xp} XP</button>;
  const st = <button className="chip" onClick={openInfo} aria-label="What is a streak?">🔥 {s.streak} {s.streak === 1 ? "day" : "days"}</button>;
  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="side">
        <div className="logo" onClick={() => go("home")}>English<span>Daily</span></div>
        {TABS.map(([id, ic, l]) => (
          <button key={id} className={"nv" + (id === nav.tab ? " on" : "")} onClick={() => go(id)}><span>{ic}</span>{l}</button>
        ))}
        <div className="side-bot">
          <button className="sidecard" style={{ "--lc": LV[level].c }} onClick={openLevel}>
            <span className="lvic">{LV[level].ic}</span><span><b>{level}</b><small>Your level · tap to change</small></span>
          </button>
          <div className="row">{xp}{st}</div>
          <hr className="hr" />
          <p className="sm">English speaking practice for Hindi speakers. A little every day, no fear.</p>
          <p className="sm"><Legal /></p>
          <p className="sm">© {new Date().getFullYear()} English Daily · Progress {user ? "saved in the cloud" : "saved on this device"}</p>
        </div>
      </aside>
      <div className="col">
        <header className="topbar">
          <div className="logo" onClick={() => go("home")}>English<span>Daily</span></div>
          <div className="date">{date}</div>
          <div className="top">
            <button className="ib prof" onClick={openAuth} aria-label="Account and settings" title="Account and settings">
              {user ? <span className="av">{(user.email || "U")[0].toUpperCase()}</span> : "👤"}
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1} key={nav.tab + ":" + nav.sub}><View go={go} sub={nav.sub} /></main>
        <footer className="foot">
          <div className="logo">English<span>Daily</span></div>
          <p className="sm">English speaking practice for Hindi speakers. A little every day, no fear.</p>
          <p className="sm"><Legal /></p>
          <p className="sm">© {new Date().getFullYear()} English Daily · Progress {user ? "saved in the cloud" : "saved on this device"}</p>
        </footer>
      </div>
      <nav className="tabs">
        {TABS.map(([id, ic, l]) => (
          <button key={id} className={id === nav.tab ? "on" : ""} onClick={() => go(id)}><b>{ic}</b>{l}</button>
        ))}
      </nav>
      <AuthModal />
      <LevelPicker />
      <InfoModal />
    </div>
  );
}

export default function Page() {
  return <AppProvider><Shell /></AppProvider>;
}
