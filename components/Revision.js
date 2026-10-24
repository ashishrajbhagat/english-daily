"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { DAYS, isDue, nextDue } from "../lib/srs";

const when = (ms) => {
  const h = Math.max(1, Math.round((ms - Date.now()) / 36e5));
  if (h < 24) return "about " + h + (h === 1 ? " hour" : " hours");
  const d = Math.round(h / 24);
  return "about " + d + (d === 1 ? " day" : " days");
};

export default function Revision() {
  const { s, addXp, reviewMistake } = useApp();
  const [sel, setSel] = useState(null);
  const [any, setAny] = useState(false);
  const all = [...(s.mk || [])].sort((a, b) => (a.due || 0) - (b.due || 0));
  const due = all.filter((m) => isDue(m));
  const list = any ? all : due;

  if (!all.length) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div className="big">🎉</div>
        <p>Your mistake notebook is empty. Questions you get wrong, and words you mark &quot;Review later&quot;, will appear here and come back at the right time.</p>
      </div>
    );
  }
  if (!list.length) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div className="big">✅</div>
        <p>Nothing is due right now. Your next review is in {when(nextDue(all))}.</p>
        <p className="sm">Spaced review: a correct answer brings the question back after 1, 3 and then 7 days.</p>
        <button className="b" onClick={() => setAny(true)}>Practise anyway</button>
      </div>
    );
  }
  const q = list[0];
  const box = q.box || 0;
  const learned = box + 1 > DAYS.length;
  const next = () => {
    const correct = sel === q.a;
    reviewMistake(q.q, correct);
    if (correct) addXp(2);
    setSel(null);
  };
  return (
    <>
      <h2>Mistake notebook · {due.length} due · {all.length} total</h2>
      <div className="narrow">
        <div className="card"><div className="en">{q.q}</div></div>
        {q.o.map((t, j) => (
          <button key={j} disabled={sel !== null} className={"opt" + (sel !== null && j === q.a ? " ok" : sel === j ? " no" : "")} onClick={() => setSel(j)}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
        ))}
        {sel !== null && (
          <>
            {q.e && <div className="sm">{q.e}</div>}
            <div className="sm"><b>{sel === q.a ? (learned ? "Right! You have learned this one. It leaves your notebook." : "Right! You will see it again in " + DAYS[box] + (DAYS[box] === 1 ? " day." : " days.")) : "The correct answer is in green. You will see it again soon."}</b></div>
            <div className="row"><button className="b p" onClick={next}>Next</button></div>
          </>
        )}
      </div>
    </>
  );
}
