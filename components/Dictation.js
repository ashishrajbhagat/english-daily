"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { say, norm } from "../lib/speech";
import { pools } from "../lib/levels";

const pick = (lv) => { const a = pools(lv).ph; return a[Math.floor(Math.random() * a.length)][1]; };

export default function Dictation() {
  const { rate, addXp, level } = useApp();
  const [t, setT] = useState(() => pick(level));
  const [v, setV] = useState("");
  const [r, setR] = useState(null);
  const check = () => {
    const typed = norm(v);
    const words = t.split(/\s+/).filter((w) => norm(w).length);
    const marks = words.map((w) => typed.includes(norm(w)[0]));
    const p = Math.round((marks.filter(Boolean).length / words.length) * 100);
    setR({ words, marks, p });
    if (p >= 80) addXp(5);
  };
  const next = () => { setT(pick(level)); setV(""); setR(null); };
  return (
    <div className="card">
      <div className="en">🎧 Listen and write</div>
      <div className="sm">Listen to the sentence and type exactly what you hear.</div>
      <div className="row">
        <button className="b p" onClick={() => say(t, rate)}>🔊 Play</button>
        <button className="b" onClick={() => say(t, 0.6)}>🐢 Slow</button>
      </div>
      <div className="row">
        <input className="inp" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="Type what you hear…" />
      </div>
      <div className="row">
        <button className="b p" onClick={check}>Check</button>
        <button className="b" onClick={next}>Next ▶</button>
      </div>
      {r && (
        <div className="res">
          {r.words.map((w, i) => <span key={i} className={r.marks[i] ? "g" : "r"}>{w} </span>)}
          <div>{r.p >= 80 ? "🎉 Well done! " : "🔁 Listen again. "}{r.p}% correct</div>
        </div>
      )}
    </div>
  );
}
