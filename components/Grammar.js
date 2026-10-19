"use client";
import { useEffect, useState } from "react";
import Seg from "./Seg";
import Line from "./Line";
import PageHead from "./PageHead";
import LevelSelect from "./LevelSelect";
import { useApp } from "../lib/app";
import { DATA } from "../lib/content";
import { LEVELS, LV } from "../lib/levels";
import { burst } from "../lib/confetti";


function Lesson({ i, onBack }) {
  const g = DATA.GC[i];
  const { s, addXp, doneLesson, addMistake } = useApp();
  const [ans, setAns] = useState({});
  const qs = g[5];
  const n = Object.keys(ans).length;
  const ok = Object.keys(ans).filter((k) => ans[k] === qs[k][2]).length;
  const fin = n === qs.length;
  useEffect(() => {
    if (fin && ok === qs.length && !s.gd[i]) { doneLesson(i); addXp(20); burst(); }
  }, [fin]);
  return (
    <div className="narrow">
      <button className="b" onClick={onBack}>◀ Back to course</button>
      <div className="sm" style={{ marginTop: 14 }}>{LV[g[0]].ic} {g[0]}</div>
      <h2 style={{ marginTop: 4 }}>{g[1]}</h2>
      <div className="card">{g[2]}</div>
      {g[6] && <div className="card" style={{ background: "var(--t3)" }}><div className="sm">हिंदी में</div><div>{g[6]}</div></div>}
      <div className="card" style={{ background: "var(--t2)" }}><div className="sm">Formula</div><div className="en">{g[3]}</div></div>
      <div className="sm">Examples: listen, then say them yourself</div>
      {g[4].map((t) => <Line key={t} t={t} />)}
      <h2>Practice</h2>
      {qs.map(([q, o, a], k) => (
        <div className="card" key={k}>
          <div className="en">{q}</div>
          {o.map((t, j) => (
            <button key={j} disabled={ans[k] !== undefined}
              className={"opt" + (ans[k] !== undefined && j === a ? " ok" : ans[k] === j ? " no" : "")}
              onClick={() => { setAns({ ...ans, [k]: j }); if (j !== a) addMistake({ q, o, a }); }}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
          ))}
        </div>
      ))}
      {fin && (ok === qs.length
        ? <div className="card hero"><h2>🎉 Lesson complete! +20 XP</h2><div className="row"><button className="b" onClick={onBack}>Back to course</button></div></div>
        : <div className="res">Keep practising. <button className="b p" onClick={() => setAns({})}>Try again</button></div>)}
    </div>
  );
}

export default function Grammar({ sub }) {
  const { s, level } = useApp();
  const [m, setM] = useState(sub || 0);
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  const [open, setOpen] = useState(null);
  if (open !== null) return <Lesson key={open} i={open} onBack={() => setOpen(null)} />;
  const items = DATA.GC.map((g, i) => [g, i]).filter(([g]) => g[0] === LEVELS[lv]);
  const ld = items.filter(([, i]) => s.gd[i]).length;
  const total = Object.keys(s.gd).length;
  return (
    <>
      <PageHead title="Grammar Course" sub={"Short lessons with a Hindi note, examples to say aloud and 2 practice questions. " + total + " of " + DATA.GC.length + " lessons complete."} right={m === 0 ? <LevelSelect value={lv} onChange={setLv} /> : null} />
      <Seg items={["Course", "Quick tips"]} value={m} onChange={setM} />
      {m === 0 && (
        <>
          <div className="card"><b>{LV[LEVELS[lv]].ic} {LEVELS[lv]}: {ld}/{items.length} lessons</b>
            <div className="bar" style={{ marginTop: 8 }}><i style={{ width: (ld / items.length) * 100 + "%" }} /></div>
          </div>
          <div className="cols">
            {items.map(([g, i], k) => (
              <button key={i} className="lesson" style={{ "--lc": LV[g[0]].c }} onClick={() => setOpen(i)}>
                <span className="ln">{s.gd[i] ? "✓" : k + 1}</span>
                <span><b>{g[1]}</b><small>2 practice questions · +20 XP</small></span>
              </button>
            ))}
          </div>
        </>
      )}
      {m === 1 && <div className="cols">{DATA.GR.map((g) => <details key={g[0]}><summary>{g[0]}</summary><p>{g[1]}</p></details>)}</div>}
    </>
  );
}
