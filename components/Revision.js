"use client";
import { useState } from "react";
import { useApp } from "../lib/app";

export default function Revision() {
  const { s, addXp, removeMistake, markMistake } = useApp();
  const list = s.mk || [];
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  if (!list.length) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div className="big">🎉</div>
        <p>Your mistake notebook is empty. Questions you get wrong in quizzes and grammar practice will appear here.</p>
      </div>
    );
  }
  const q = list[i % list.length];
  const next = () => {
    if (sel === q.a) { if ((q.ok || 0) >= 1) { removeMistake(q.q); addXp(2); } else { markMistake(q.q, 1); setI(i + 1); } } else { markMistake(q.q, 0); setI(i + 1); }
    setSel(null);
  };
  return (
    <>
      <h2>Mistake notebook · {list.length}</h2>
      <div className="card"><div className="en">{q.q}</div></div>
      {q.o.map((t, j) => (
        <button key={j} disabled={sel !== null} className={"opt" + (sel !== null && j === q.a ? " ok" : sel === j ? " no" : "")} onClick={() => setSel(j)}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
      ))}
      {sel !== null && (
        <>
          {q.e && <div className="sm">{q.e}</div>}
          <div className="sm"><b>{sel === q.a ? ((q.ok || 0) >= 1 ? "Right again! Removed from your notebook." : "Right! Answer it correctly once more to remove it.") : "The correct answer is in green. It will come back again."}</b></div>
          <div className="row"><button className="b p" onClick={next}>Next</button></div>
        </>
      )}
    </>
  );
}
