"use client";
import { useRef, useState } from "react";
import { say, norm, recognize } from "../lib/speech";
import { getIPAs } from "../lib/ipa";
import { tipFor } from "../lib/pron";
import { useApp } from "../lib/app";

const ERR = {
  unsupported: "This browser does not support the microphone. Please use Chrome or Edge.",
  "not-allowed": "Please allow microphone access.",
};

export default function Line({ t, hi, listenOnly, you }) {
  const { rate, addXp } = useApp();
  const [rec, setRec] = useState(false);
  const [res, setRes] = useState(null);
  const [ipa, setIpa] = useState({});
  const [showIpa, setShowIpa] = useState(false);
  const [rc, setRc] = useState(false);
  const [mine, setMine] = useState("");
  const mr = useRef(null);
  const load = (ws) => getIPAs(ws).then((m) => setIpa((p) => ({ ...p, ...m })));

  const speak = () => {
    setRec(true); setRes(null);
    recognize({
      onResult: (h, conf) => {
        const heard = norm(h);
        const words = t.split(/\s+/).filter((w) => norm(w).length);
        const marks = words.map((w) => heard.includes(norm(w)[0]));
        const p = Math.round((marks.filter(Boolean).length / words.length) * 100);
        const missed = [...new Set(words.filter((w, i) => !marks[i]).map((w) => norm(w)[0]))];
        setRes({ words, marks, p, h, conf, missed });
        if (missed.length) load(missed);
        if (p >= 80) addXp(5);
      },
      onError: (e) => { setRec(false); setRes({ err: ERR[e] || "Could not hear you. Please try again." }); },
      onEnd: () => setRec(false),
    });
  };
  const record = async () => {
    if (rc) { if (mr.current) mr.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((x) => x.stop());
        setMine(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" })));
        setRc(false);
      };
      mr.current = rec; rec.start(); setRc(true);
      setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 12000);
    } catch (e) { setRes({ err: "Could not use the microphone for recording. Please allow microphone access." }); }
  };
  const toggleIpa = () => { if (!showIpa) load([...new Set(norm(t))]); setShowIpa(!showIpa); };

  return (
    <div className={"card" + (you ? " you" : "")}>
      <div className="en">{t}</div>
      <div className="hi">{hi}</div>
      <div className="row">
        <button className="b" onClick={() => say(t, rate)}>🔊 Listen</button>
        {!listenOnly && (
          <button className={"b p" + (rec ? " rec" : "")} onClick={speak}>{rec ? "🎙 Listening…" : "🎤 Speak"}</button>
        )}
        {!listenOnly && <button className="b" onClick={toggleIpa} aria-pressed={showIpa}>🔤 IPA</button>}
        {!listenOnly && <button className={"b" + (rc ? " rec" : "")} onClick={record}>{rc ? "⏹ Stop" : "⏺ Record"}</button>}
      </div>
      {showIpa && (
        <div className="ipaline">
          {t.split(/\s+/).map((w, i) => {
            const k = norm(w)[0];
            const v = k ? ipa[k] : "";
            return <span key={i} className="ipaw"><b>{w}</b><i>{v === undefined ? "…" : v ? "/" + v + "/" : "–"}</i></span>;
          })}
        </div>
      )}
      {mine && <audio className="aud" controls src={mine} aria-label="Your recording" />}
      {res && (
        <div className="res">
          {res.err || (
            <>
              {res.words.map((w, i) => <span key={i} className={res.marks[i] ? "g" : "r"}>{w} </span>)}
              <div>{res.p >= 80 ? "🎉 Great! " : res.p >= 50 ? "👍 Good try. " : "🔁 Try again. "}{res.p}% match{typeof res.conf === "number" && res.conf > 0 ? " · clarity " + Math.round(res.conf * 100) + "%" : ""}</div>
              <div className="sm">Heard: {res.h}</div>
              {res.missed.length > 0 && (
                <div className="coach">
                  <div className="sm"><b>Pronunciation coach</b> · words to practise</div>
                  {res.missed.map((w) => (
                    <div className="cw" key={w}>
                      <b>{w}</b> {ipa[w] ? <span className="sm">/{ipa[w]}/</span> : null} <button className="lnk" onClick={() => say(w, rate * 0.8)} aria-label={"Hear " + w}>🔊 slow</button>
                      <div className="sm">💡 {tipFor(w)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
