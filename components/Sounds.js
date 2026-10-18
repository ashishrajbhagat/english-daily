"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { say } from "../lib/speech";
import { DATA } from "../lib/content";

const round = () => ({ p: DATA.SP[Math.floor(Math.random() * DATA.SP.length)], w: Math.random() < 0.5 ? 0 : 1 });

export default function Sounds() {
  const { rate, addXp } = useApp();
  const [g, setG] = useState(round);
  const [pick, setPick] = useState(null);
  const answer = (j) => { setPick(j); if (j === g.w) addXp(2); };
  return (
    <>
      <div className="card">
        <div className="en">🎧 Which word did you hear?</div>
        <div className="sm">Many Hindi speakers mix up these pairs. Train your ears first.</div>
        <div className="row"><button className="b p" onClick={() => say(g.p[g.w * 2], rate)}>🔊 Play a word</button></div>
        <div className="row">
          {[0, 1].map((j) => (
            <button key={j} disabled={pick !== null} onClick={() => answer(j)}
              className={"b" + (pick !== null && j === g.w ? " p" : "")}>{g.p[j * 2]}</button>
          ))}
        </div>
        {pick !== null && (
          <div className="res">
            <span className={pick === g.w ? "g" : "r"}>{pick === g.w ? "Correct! +2 XP" : "Not quite."}</span> It was <b>{g.p[g.w * 2]}</b> {g.p[g.w * 2 + 1]}.
            <div className="row"><button className="b" onClick={() => { setG(round()); setPick(null); }}>Next pair ▶</button></div>
          </div>
        )}
      </div>
      <h3 className="sec-t">All sound pairs</h3>
      <div className="cols">
        {DATA.SP.map((p) => (
          <div className="card" key={p[0]}>
            <div className="pair">
              {[0, 2].map((k) => (
                <button key={k} className="b" onClick={() => say(p[k], rate)}><b>{p[k]}</b> <span className="sm">{p[k + 1]}</span> 🔊</button>
              ))}
            </div>
            <div className="sm" style={{ marginTop: 8 }}>💡 {p[4]}</div>
          </div>
        ))}
      </div>
    </>
  );
}
