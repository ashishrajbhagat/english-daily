"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { LEVELS, LV, placementQs, placeResult } from "../lib/levels";

export default function LevelPicker() {
  const { levelOpen, closeLevel, setLevel, setLevelSkip, s } = useApp();
  const [step, setStep] = useState("pick");
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState([]);
  const [res, setRes] = useState("");
  if (!levelOpen) return null;

  const reset = () => { setStep("pick"); setQs([]); setI(0); setAns([]); setRes(""); };
  const choose = (l) => { setLevel(l); reset(); closeLevel(); };
  const skip = () => { if (!s.level) setLevelSkip(); reset(); closeLevel(); };
  const startTest = () => { setQs(placementQs()); setI(0); setAns([]); setStep("test"); };
  const answer = (j) => {
    const a = [...ans, j];
    setAns(a);
    if (i + 1 >= qs.length) { setRes(placeResult(qs, a)); setStep("result"); } else setI(i + 1);
  };

  return (
    <div className="modal-bg">
      <div className="card modal lvm">
        {step === "pick" && (
          <>
            <div className="en">🎯 What is your English level?</div>
            <p className="sm">This decides which phrases, words, grammar and quizzes you see. You can change it anytime.</p>
            {LEVELS.map((l) => (
              <button key={l} className="lvcard" style={{ "--lc": LV[l].c }} onClick={() => choose(l)}>
                <span className="lvic">{LV[l].ic}</span>
                <span><b>{l}</b><small>{LV[l].d}</small></span>
              </button>
            ))}
            <div className="row">
              <button className="b p" onClick={startTest}>Not sure? Take a 2-minute test</button>
              <button className="b" onClick={skip}>{s.level ? "Cancel" : "Skip for now"}</button>
            </div>
          </>
        )}
        {step === "test" && (
          <>
            <div className="sm">Question {i + 1} of {qs.length}</div>
            <div className="bar"><i style={{ width: (i / qs.length) * 100 + "%" }} /></div>
            <div className="en" style={{ margin: "14px 0" }}>{qs[i].q}</div>
            {qs[i].o.map((t, j) => (
              <button key={j} className="opt" onClick={() => answer(j)}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
            ))}
          </>
        )}
        {step === "result" && (
          <>
            <div className="big">{LV[res].ic}</div>
            <div className="en">Your starting level: {res}</div>
            <p className="sm">{LV[res].d}</p>
            <div className="row">
              <button className="b p" onClick={() => choose(res)}>Start as {res}</button>
              <button className="b" onClick={reset}>Choose manually</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
