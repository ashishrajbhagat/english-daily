"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { norm, say } from "../lib/speech";
import { pools } from "../lib/levels";

const pick = (level) => { const a = pools(level).ph; return a[Math.floor(Math.random() * a.length)]; };

export default function Translate({ level }) {
  const { addXp, rate } = useApp();
  const [p, setP] = useState(() => pick(level));
  const [v, setV] = useState("");
  const [res, setRes] = useState(null);
  const check = () => {
    const typed = norm(v);
    const words = p[1].split(/\s+/).filter((w) => norm(w).length);
    const marks = words.map((w) => typed.includes(norm(w)[0]));
    const pct = Math.round((marks.filter(Boolean).length / words.length) * 100);
    setRes({ words, marks, pct });
    if (pct >= 70) addXp(5);
  };
  const next = () => { setP(pick(level)); setV(""); setRes(null); };
  return (
    <div className="narrow">
      <div className="card">
        <div className="sm">Translate into English</div>
        <div className="en" style={{ fontSize: 22 }}>{p[2]}</div>
        <div className="row"><input className="inp" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="Type the English sentence…" /></div>
        <div className="row"><button className="b p" onClick={check}>Check</button><button className="b" onClick={next}>Skip / Next ▶</button></div>
        {res && (
          <div className="res">
            <div>Model answer: {res.words.map((w, i) => <span key={i} className={res.marks[i] ? "g" : "r"}>{w} </span>)}</div>
            <div>{res.pct >= 70 ? "🎉 Great! +5 XP. " : "🔁 Close, try the next one. "}{res.pct}% of the words matched.</div>
            <div className="row"><button className="b" onClick={() => say(p[1], rate)}>🔊 Hear it</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
