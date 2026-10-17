"use client";
import { useState } from "react";
import { useApp } from "../lib/app";

export default function Revision() {
  const { s, addXp, removeMistake } = useApp();
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
    if (sel === q.a) { removeMistake(q.q); addXp(2); } else setI(i + 1);
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
          <div className="sm">{q.e || (sel === q.a ? "Right! This will now leave your notebook." : "The correct answer is in green. It will come back again.")}</div>
          <div className="row"><button className="b p" onClick={next}>Next</button></div>
        </>
      )}
    </>
  );
}
