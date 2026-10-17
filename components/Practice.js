"use client";
import { useState } from "react";
import Seg from "./Seg";
import Line from "./Line";
import Dictation from "./Dictation";
import Talk from "./Talk";
import { useApp } from "../lib/app";
import { DATA } from "../lib/content";
import { LEVELS, LV, pool, phLevel, dlLevel, twLevel } from "../lib/levels";

const LVL = LEVELS.map((l) => LV[l].ic + " " + l);

export default function Practice({ sub }) {
  const { rate, setRate, level } = useApp();
  const [m, setM] = useState(sub || 0);
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  const [c, setC] = useState(0);
  const ph = pool(DATA.PH, phLevel, lv);
  const cats = ["All", ...new Set(ph.map((p) => p[0]))];
  return (
    <>
      <h2>Speak</h2>
      <p className="sm">Listen, then say it out loud. The app checks what it hears.</p>
      <Seg items={["Phrases", "Dialogues", "Tongue twisters", "Dictation", "Free Talk"]} value={m} onChange={setM} />
      {m < 3 && (
        <>
          <Seg items={LVL} value={lv} onChange={(i) => { setLv(i); setC(0); }} />
          <div className="sm speed">Speed 🐢 <input type="range" min="0.5" max="1.2" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} /> 🐇</div>
        </>
      )}
      {m === 0 && (
        <>
          <Seg items={cats} value={c} onChange={setC} />
          <div className="cols">
            {ph.filter((p) => c === 0 || p[0] === cats[c]).map((p) => <Line key={p[1]} t={p[1]} hi={p[2]} />)}
          </div>
        </>
      )}
      {m === 1 && pool(DATA.DL, (d) => dlLevel(d.t), lv).map((d) => (
        <div key={d.t}>
          <h2>🎭 {d.t}</h2>
          <div className="cols">
            {d.l.map(([who, t], i) => <Line key={i} t={t} hi={who} listenOnly={who !== "You"} you={who === "You"} />)}
          </div>
        </div>
      ))}
      {m === 2 && <div className="cols">{pool(DATA.TW, (x, i) => twLevel(i), lv).map((t) => <Line key={t} t={t} hi="Say it slowly first, then faster" />)}</div>}
      {m === 3 && <Dictation />}
      {m === 4 && <Talk />}
    </>
  );
}
