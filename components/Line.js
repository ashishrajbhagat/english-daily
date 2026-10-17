"use client";
import { useState } from "react";
import { say, norm, recognize } from "../lib/speech";
import { useApp } from "../lib/app";

const ERR = {
  unsupported: "This browser does not support the microphone. Please use Chrome or Edge.",
  "not-allowed": "Please allow microphone access.",
};

export default function Line({ t, hi, listenOnly, you }) {
  const { rate, addXp } = useApp();
  const [rec, setRec] = useState(false);
  const [res, setRes] = useState(null);

  const speak = () => {
    setRec(true); setRes(null);
    recognize({
      onResult: (h, conf) => {
        const heard = norm(h);
        const words = t.split(/\s+/).filter((w) => norm(w).length);
        const marks = words.map((w) => heard.includes(norm(w)[0]));
        const p = Math.round((marks.filter(Boolean).length / words.length) * 100);
        setRes({ words, marks, p, h, conf });
        if (p >= 80) addXp(5);
      },
      onError: (e) => { setRec(false); setRes({ err: ERR[e] || "Could not hear you. Please try again." }); },
      onEnd: () => setRec(false),
    });
  };

  return (
    <div className={"card" + (you ? " you" : "")}>
      <div className="en">{t}</div>
      <div className="hi">{hi}</div>
      <div className="row">
        <button className="b" onClick={() => say(t, rate)}>🔊 Listen</button>
        {!listenOnly && (
          <button className={"b p" + (rec ? " rec" : "")} onClick={speak}>{rec ? "🎙 Listening…" : "🎤 Speak"}</button>
        )}
      </div>
      {res && (
        <div className="res">
          {res.err || (
            <>
              {res.words.map((w, i) => <span key={i} className={res.marks[i] ? "g" : "r"}>{w} </span>)}
              <div>{res.p >= 80 ? "🎉 Great! " : res.p >= 50 ? "👍 Good try. " : "🔁 Try again. "}{res.p}% match{typeof res.conf === "number" && res.conf > 0 ? " · clarity " + Math.round(res.conf * 100) + "%" : ""}</div>
              <div className="sm">Heard: {res.h}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
