"use client";
import { useEffect, useState } from "react";
import LevelSelect from "./LevelSelect";
import { useApp } from "../lib/app";
import { LEVELS, quizPool } from "../lib/levels";
import { burst } from "../lib/confetti";

const mk = (lv) => [...quizPool(lv)].sort(() => Math.random() - 0.5).slice(0, 8);

function Run({ lv }) {
  const { addXp, addMistake } = useApp();
  const [qs, setQs] = useState(() => mk(lv));
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [sc, setSc] = useState(0);
  const done = i >= qs.length;
  useEffect(() => { if (done && sc > 0) { addXp(sc * 3); if (sc >= 6) burst(); } }, [done]);

  if (done) {
    return (
      <div className="card narrow" style={{ textAlign: "center" }}>
        <div className="big">{sc}/{qs.length}</div>
        <p>{sc >= 6 ? "Excellent! 🎉" : "Keep practising, you will get there 💪"}</p>
        <p className="sm">+{sc * 3} XP earned. Wrong answers are saved in your mistake notebook.</p>
        <button className="b p" onClick={() => { setQs(mk(lv)); setI(0); setSel(null); setSc(0); }}>Play again</button>
      </div>
    );
  }
  const [q, o, a, e] = qs[i];
  return (
    <div className="narrow">
      <div className="sm">Question {i + 1} of {qs.length}</div>
      <div className="bar"><i style={{ width: (i / qs.length) * 100 + "%" }} /></div>
      <div className="card"><div className="en">{q}</div></div>
      {o.map((t, j) => (
        <button key={j} disabled={sel !== null}
          className={"opt" + (sel !== null && j === a ? " ok" : sel === j ? " no" : "")}
          onClick={() => { setSel(j); if (j === a) setSc(sc + 1); else addMistake({ q, o, a, e }); }}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
      ))}
      {sel !== null && (
        <>
          <div className="sm">{e}</div>
          <div className="row"><button className="b p" onClick={() => { setI(i + 1); setSel(null); }}>Next</button></div>
        </>
      )}
    </div>
  );
}

export default function Quiz() {
  const { level } = useApp();
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  return (
    <>
      <div className="phead"><p className="sm">8 questions at your level. Wrong answers go to your mistake notebook.</p><LevelSelect value={lv} onChange={setLv} /></div>
      <Run key={lv} lv={lv} />
    </>
  );
}
