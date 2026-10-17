"use client";
import { useEffect, useState } from "react";
import { AppProvider, useApp } from "../lib/app";
import { LV } from "../lib/levels";
import { toggleTheme } from "../lib/theme";
import AuthModal from "../components/AuthModal";
import LevelPicker from "../components/LevelPicker";
import InfoModal from "../components/InfoModal";
import Home from "../components/Home";
import Roadmaps from "../components/Roadmaps";
import Practice from "../components/Practice";
import Words from "../components/Words";
import Grammar from "../components/Grammar";
import Test from "../components/Test";

const TABS = [["home", "🏠", "Home"], ["roadmap", "🗺", "Roadmap"], ["speak", "🎤", "Speak"], ["words", "📚", "Words"], ["grammar", "📘", "Grammar"], ["test", "✅", "Quiz"]];
const VIEW = { home: Home, roadmap: Roadmaps, speak: Practice, words: Words, grammar: Grammar, test: Test };

function Shell() {
  const { s, user, level, ready, openAuth, openLevel, openInfo } = useApp();
  const [nav, setNav] = useState({ tab: "home", sub: 0 });
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => { if (ready && !s.level && !s.ls) openLevel(); }, [ready]);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, [nav]);
  const go = (id) => { const [t, sb] = id.split(":"); setNav({ tab: t, sub: +sb || 0 }); };
  const View = VIEW[nav.tab];
  const xp = <button className="chip" onClick={openInfo} aria-label="What is XP?">⭐ {s.xp}<span className="lbl"> XP</span></button>;
  const st = <button className="chip" onClick={openInfo} aria-label="What is a streak?">🔥 {s.streak}<span className="lbl"> {s.streak === 1 ? "day" : "days"}</span></button>;
  return (
    <div className="app">
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
          <button className="b" onClick={toggleTheme}>🌓 Light / Dark</button>
          <p className="sm">English speaking practice for Hindi speakers. A little every day, no fear.</p>
          <p className="sm">© {new Date().getFullYear()} English Daily · Progress {user ? "saved in the cloud" : "saved on this device"}</p>
        </div>
      </aside>
      <div className="col">
        <header className="topbar">
          <div className="logo" onClick={() => go("home")}>English<span>Daily</span></div>
          <div className="date">{date}</div>
          <div className="top">
            {xp}{st}
            <button className="acct" onClick={openAuth} aria-label="Account and settings">
              {user ? <span className="av">{(user.email || "U")[0].toUpperCase()}</span> : "Login"}
            </button>
          </div>
        </header>
        <main key={nav.tab + ":" + nav.sub}><View go={go} sub={nav.sub} /></main>
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
