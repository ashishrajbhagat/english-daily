"use client";
import { useRef, useState } from "react";
import { say, norm, recognize, speechSupported } from "../lib/speech";
import { getIPAs } from "../lib/ipa";
import { tipFor } from "../lib/pron";
import { startClip } from "../lib/rec";
import { transcribeBlob } from "../lib/whisper";
import { useApp } from "../lib/app";
import { authHeader } from "../lib/supabase";

const ERR = {
  "not-allowed": "Please allow microphone access.",
};

export default function Line({ t, hi, listenOnly, you }) {
  const { rate, addXp, s, toggleFav, ai, access } = useApp();
  const fav = (s.fav || []).includes(t);
  const [rec, setRec] = useState(false);
  const [clip, setClip] = useState(null);
  const [busy, setBusy] = useState("");
  const [res, setRes] = useState(null);
  const [ipa, setIpa] = useState({});
  const [showIpa, setShowIpa] = useState(false);
  const [rc, setRc] = useState(false);
  const [mine, setMine] = useState("");
  const [fb, setFb] = useState(null);
  const mr = useRef(null);
  const load = (ws) => getIPAs(ws).then((m) => setIpa((p) => ({ ...p, ...m })));

  const grade = (h, conf) => {
    const heard = norm(h);
    const words = t.split(/\s+/).filter((w) => norm(w).length);
    const marks = words.map((w) => heard.includes(norm(w)[0]));
    const p = Math.round((marks.filter(Boolean).length / words.length) * 100);
    const missed = [...new Set(words.filter((w, i) => !marks[i]).map((w) => norm(w)[0]))];
    setRes({ words, marks, p, h, conf, missed });
    setFb(null);
    if (missed.length) load(missed);
    if (p >= 80) addXp(5);
  };

  // Normal check: the browser's speech recognition (Chrome, Edge, Android).
  const speakWeb = () => {
    setRec(true); setRes(null);
    recognize({
      onResult: (h, conf) => grade(h, conf),
      onError: (e) => { setRec(false); setRes({ err: ERR[e] || "Could not hear you. Please try again." }); },
      onEnd: () => setRec(false),
    });
  };
  // On-device AI check (free, works in every browser): records a short clip and transcribes it with Whisper.
  const speakLocal = async () => {
    if (clip) { clip.stop(); return; }
    setRes(null); setFb(null);
    try {
      const c = await startClip(8000);
      setClip(c);
      const blob = await c.done;
      setClip(null);
      setMine(URL.createObjectURL(blob));
      setBusy("🧠 Checking on your device. The first time it downloads a small AI model (about 40 MB).");
      const text = await transcribeBlob(blob, (p) => setBusy("🧠 Downloading the AI model… " + p + "%"));
      setBusy("");
      if (!text) { setRes({ err: "Could not hear you. Please try again." }); return; }
      grade(text);
    } catch (e) {
      setClip(null); setBusy("");
      setRes({ err: e && e.message ? e.message : "The on-device check failed. Please try again." });
    }
  };
  const useLocal = !speechSupported() || s.ond;
  const speak = () => (useLocal ? speakLocal() : speakWeb());

  const record = async () => {
    if (rc) { if (mr.current) mr.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((x) => x.stop());
        setMine(URL.createObjectURL(new Blob(chunks, { type: r.mimeType || "audio/webm" })));
        setRc(false);
      };
      mr.current = r; r.start(); setRc(true);
      setTimeout(() => { if (r.state === "recording") r.stop(); }, 12000);
    } catch (e) { setRes({ err: "Could not use the microphone for recording. Please allow microphone access." }); }
  };
  const toggleIpa = () => { if (!showIpa) load([...new Set(norm(t))]); setShowIpa(!showIpa); };
  const askAi = async () => {
    setFb({ loading: true });
    try {
      const r = await fetch("/api/ai/feedback", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify({ kind: "pron", target: t, heard: res && res.h ? res.h : "" }) });
      const j = await r.json();
      setFb(r.ok ? { d: j } : { err: j.error || "AI feedback is not available." });
    } catch (e) { setFb({ err: "Network error. Please try again." }); }
  };

  const speaking = useLocal ? !!clip : rec;
  return (
    <div className={"card" + (you ? " you" : "") + (listenOnly ? "" : " hasfav")}>
      {!listenOnly && <button className="favb" aria-label={fav ? "Remove from saved phrases" : "Save phrase"} aria-pressed={fav} onClick={() => toggleFav(t)}>{fav ? "⭐" : "☆"}</button>}
      <div className="en">{t}</div>
      <div className="hi">{hi}</div>
      <div className="row">
        <button className="b" onClick={() => say(t, rate, s.shadow && !listenOnly ? speak : undefined)}>🔊 Listen</button>
        {!listenOnly && (
          <button className={"b p" + (speaking ? " rec" : "")} disabled={!!busy} onClick={speak}>{speaking ? (useLocal ? "⏹ Stop" : "🎙 Listening…") : "🎤 Speak"}</button>
        )}
        {!listenOnly && <button className="b" onClick={toggleIpa} aria-pressed={showIpa}>🔤 IPA</button>}
        {!listenOnly && <button className={"b" + (rc ? " rec" : "")} onClick={record}>{rc ? "⏹ Stop" : "⏺ Record"}</button>}
      </div>
      {busy && <div className="sm res">{busy}</div>}
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
              {ai && access.ai && <div className="row"><button className="b" onClick={askAi}>🤖 AI coach</button></div>}
              {fb && (
                <div className="coach">
                  {fb.loading ? "AI coach is thinking…" : fb.err ? <span className="r">{fb.err}</span> : (
                    <>
                      <div className="sm">IPA</div>
                      <div className="en" style={{ fontSize: 16 }}>{fb.d.ipa}</div>
                      {(fb.d.words || []).map((w, i) => <div key={i}><span className={w.ok ? "g" : "r"}>{w.w}</span> <span className="sm">{w.ipa}{w.ok ? "" : " → " + w.tip}</span></div>)}
                      <p>{fb.d.overall}</p>
                      {fb.d.focus && <div className="sm">Focus: {fb.d.focus}</div>}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
