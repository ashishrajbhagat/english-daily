"use client";
import { useState } from "react";
import Seg from "./Seg";
import Line from "./Line";
import PageHead from "./PageHead";
import LevelSelect from "./LevelSelect";
import Dictation from "./Dictation";
import Talk from "./Talk";
import AIPartner from "./AIPartner";
import Sounds from "./Sounds";
import Numbers from "./Numbers";
import { useApp } from "../lib/app";
import { DATA } from "../lib/content";
import { LEVELS, pool, phLevel, dlOf, twLevel } from "../lib/levels";

export default function Practice({ sub }) {
  const { rate, setRate, level, s } = useApp();
  const [m, setM] = useState(sub || 0);
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  const [c, setC] = useState(0);
  const [q, setQ] = useState("");
  const ph = pool(DATA.PH, phLevel, lv);
  const cats = ["All", ...new Set(ph.map((p) => p[0]))];
  const lvl = m < 3;
  return (
    <>
      <PageHead title="Speak" sub="Listen, then say it out loud. The app checks what it hears." right={lvl ? <LevelSelect value={lv} onChange={(i) => { setLv(i); setC(0); }} /> : null} />
      <Seg items={["Phrases", "Dialogues", "Tongue twisters", "Sounds", "Numbers", "Dictation", "Free Talk", "Saved", "AI Partner"]} value={m} onChange={setM} />
      {lvl && <div className="sm speed">Voice speed 🐢 <input type="range" min="0.5" max="1.2" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Voice speed" /> 🐇</div>}
      {m === 0 && (
        <>
          <input className="inp" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phrases (English or Hindi)…" aria-label="Search phrases" />
          <Seg items={cats} value={c} onChange={setC} />
          <div className="cols">
            {ph.filter((p) => (c === 0 || p[0] === cats[c]) && (!q.trim() || p[1].toLowerCase().includes(q.trim().toLowerCase()) || p[2].includes(q.trim()))).map((p) => <Line key={p[1]} t={p[1]} hi={p[2]} />)}
          </div>
        </>
      )}
      {m === 1 && pool(DATA.DL, dlOf, lv).map((d) => (
        <div key={d.t}>
          <h3 className="sec-t">🎭 {d.t}</h3>
          <div className="cols">
            {d.l.map(([who, t], i) => <Line key={i} t={t} hi={who} listenOnly={who !== "You"} you={who === "You"} />)}
          </div>
        </div>
      ))}
      {m === 2 && <div className="cols">{pool(DATA.TW, (x, i) => twLevel(i), lv).map((t) => <Line key={t} t={t} hi="Say it slowly first, then faster" />)}</div>}
      {m === 3 && <Sounds />}
      {m === 4 && <Numbers />}
      {m === 5 && <div className="narrow"><Dictation /></div>}
      {m === 6 && <div className="narrow"><Talk /></div>}
      {m === 8 && <div className="narrow"><AIPartner /></div>}
      {m === 7 && ((s.fav || []).length ? <div className="cols">{s.fav.map((t) => { const p = DATA.PH.find((x) => x[1] === t); return <Line key={t} t={t} hi={p ? p[2] : ""} />; })}</div> : <div className="card narrow"><p>No saved phrases yet. Tap ☆ on any phrase to save it here.</p></div>)}
    </>
  );
}
