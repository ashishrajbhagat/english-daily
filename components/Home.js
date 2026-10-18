"use client";
import { useEffect, useState } from "react";
import { useApp } from "../lib/app";
import { say } from "../lib/speech";
import { pools } from "../lib/levels";
import { ROADMAPS, curDay, dayTasks } from "../lib/roadmaps";
import Badges from "./Badges";
import Leaderboard from "./Leaderboard";

const QUICK = [["🎤", "Speak a phrase", "Practise out loud", "speak:0"], ["🗣", "Free talk", "60 seconds", "speak:6"], ["🎧", "Dictation", "Listen and type", "speak:5"], ["✅", "Quick quiz", "8 questions", "test:0"]];

function Ring({ pct }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(23,20,15,.18)" strokeWidth="10" />
        <circle cx="52" cy="52" r={r} fill="none" stroke="#17140f" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <b>{pct}%</b>
    </div>
  );
}

export default function Home({ go }) {
  const { s, rate, level, cloud, user, openAuth, openInfo } = useApp();
  const [w, setW] = useState(null);
  useEffect(() => { const v = pools(level).vo; setW(v[Math.floor(Date.now() / 864e5) % v.length]); }, [level]);
  const r = ROADMAPS.find((x) => x.id === s.ar);
  const rp = r && s.rp[r.id];
  const d = rp ? curDay(rp, r) : 0;
  const tasks = rp ? dayTasks(r, d, level, rp.round || 0) : [];
  const n = tasks.filter((t) => rp.pd[d + "-" + t.k]).length;
  const all = rp && n === tasks.length;
  const msg = !rp ? "Hi! I'm Hoot. I will guide you step by step." : all ? "Great work today!" : s.streak > 1 ? s.streak + " days in a row. Keep it up!" : "Small steps every day make you fluent.";
  return (
    <>
      <section className="hero2">
        <div className="hero-t">
          <div className="mascot"><span>🦉</span><p>{msg}</p></div>
          <div className="kick">{rp ? r.name + " · Day " + d + " of " + r.days : "Get started"}</div>
          <h2>{rp ? (all ? "Today is complete! 🎉" : "Today's tasks are waiting") : "Pick a roadmap and start speaking"}</h2>
          <button className="b" onClick={() => go("roadmap")}>{rp ? (all ? "Review today" : "Continue Day " + d) : "Choose a roadmap"} →</button>
        </div>
        {rp && <Ring pct={Math.round((n / tasks.length) * 100)} />}
      </section>
      {s.xp < 60 && (
        <div className="card">
          <div className="en">How it works</div>
          <div className="step"><i>1</i><div><b>Choose your level and a roadmap.</b><div className="sm">Each day has a few small tasks.</div></div></div>
          <div className="step"><i>2</i><div><b>Finish tasks to earn XP ⭐ and grow your streak 🔥.</b><div className="sm"><button className="lnk" onClick={openInfo}>What are XP and streaks?</button></div></div></div>
          <div className="step"><i>3</i><div><b>Fix your mistakes in the notebook.</b><div className="sm">Wrong answers and words you want to review are saved there.</div></div></div>
        </div>
      )}
      <h3 className="sec-t">Quick practice</h3>
      <div className="quick">
        {QUICK.map(([ic, t, sub, to]) => <button key={to} className="q" onClick={() => go(to)}><span>{ic}</span>{t}<small>{sub}</small></button>)}
      </div>
      {w && (
        <>
          <h3 className="sec-t">Word of the day</h3>
          <div className="card">
            <div className="en">{w[0]}</div><div className="hi">{w[1]}</div><div className="sm">{w[2]}</div>
            <div className="row"><button className="b" onClick={() => say(w[0] + ". " + w[2], rate)}>🔊 Listen</button></div>
          </div>
        </>
      )}
      {cloud && !user && !s.sk && (
        <div className="card nudge">☁️ <b>Want to save your progress?</b> Log in to continue on any device.
          <div className="row"><button className="b p" onClick={openAuth}>Login / Sign up</button></div>
        </div>
      )}
      <Badges s={s} />
      <Leaderboard />
    </>
  );
}
