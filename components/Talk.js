"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../lib/app";
import { norm, recognize, say } from "../lib/speech";
import { pools } from "../lib/levels";

const pick = (lv) => { const a = pools(lv).tk; return a[Math.floor(Math.random() * a.length)]; };

export default function Talk() {
  const { addXp, rate, level } = useApp();
  const [topic, setTopic] = useState(() => pick(level));
  const [t, setT] = useState(60);
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState("");
  const r = useRef(null);
  const iv = useRef(null);

  const stop = useCallback(() => {
    clearInterval(iv.current);
    if (r.current) { try { r.current.stop(); } catch (e) {} r.current = null; }
  }, []);
  useEffect(() => stop, [stop]);

  const start = () => {
    stop(); setTxt(""); setMsg(""); setT(60);
    r.current = recognize({
      continuous: true,
      onResult: setTxt,
      onError: (e) => { setMsg(e === "unsupported" ? "This browser does not support the microphone. Please use Chrome or Edge." : "Please allow microphone access."); stop(); },
    });
    if (!r.current) return;
    let left = 60;
    iv.current = setInterval(() => {
      left--; setT(left);
      if (left <= 0) { stop(); addXp(15); setMsg("Done! +15 XP"); }
    }, 1000);
  };

  return (
    <>
      <h2>Free Talk</h2>
      <div className="card">
        <div className="sm">Topic</div><div className="en">{topic}</div>
        <div className="row"><button className="b" onClick={() => setTopic(pick(level))}>🔀 New topic</button></div>
      </div>
      <div className="card" style={{ textAlign: "center" }}>
        <div className="big">{t}</div><div className="sm">seconds to speak</div>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="b p" onClick={start}>🎤 Start talking</button>
          <button className="b" onClick={stop}>Stop</button>
        </div>
        {msg && <div className="res">{msg}</div>}
      </div>
      <div className="card">
        <div className="sm">What you said</div>
        <div className="tx">{txt || "Your speech will appear here as text."}</div>
        <div className="row">
          <button className="b" onClick={() => say(txt, rate)}>🔊 Listen back</button>
          <button className="b" onClick={() => setTxt("")}>Clear</button>
        </div>
        <div className="sm">{txt ? norm(txt).length + " words spoken" : ""}</div>
      </div>
    </>
  );
}
