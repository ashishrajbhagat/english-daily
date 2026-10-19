"use client";
import { useState } from "react";
import Seg from "./Seg";
import { useApp } from "../lib/app";
import { authHeader } from "../lib/supabase";
import { recognize, say, speechSupported } from "../lib/speech";

const SC = [
  ["free", "Free chat", "Hi! I'm your English partner. What would you like to talk about today?"],
  ["interview", "Job interview", "Welcome! Let's start the interview. Please tell me about yourself."],
  ["restaurant", "Restaurant", "Good evening! Welcome to our restaurant. What would you like to order?"],
  ["travel", "Travel", "Hello! You look like a traveller. How can I help you?"],
];

export default function AIPartner() {
  const { ai, addXp, rate, access, openAuth } = useApp();
  const [sc, setSc] = useState(0);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: SC[0][2] }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [voice, setVoice] = useState(true);
  const [rec, setRec] = useState(false);

  if (!ai) {
    return (
      <div className="card">
        <div className="en">🤖 AI Partner</div>
        <p className="sm">The AI conversation partner is not switched on for this site yet. Everything else works without it.</p>
      </div>
    );
  }

  if (!access.ai) {
    return (
      <div className="card">
        <div className="en">🤖 AI Partner</div>
        <p className="sm">Log in to chat with the AI partner. Your progress so far is kept.</p>
        <div className="row"><button className="b p" onClick={() => openAuth(1)}>Log in or sign up</button></div>
      </div>
    );
  }
  const pick = (i) => { setSc(i); setMsgs([{ role: "assistant", content: SC[i][2] }]); setErr(""); };
  const send = async (text) => {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setInp(""); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ scenario: SC[sc][0], messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { ...c[c.length - 1], correction: j.correction, tip: j.tip };
        return [...c, { role: "assistant", content: j.reply }];
      });
      addXp(3);
      if (voice) say(j.reply, rate);
    } catch (e) { setErr(e.message || "Something went wrong. Please try again."); }
    setBusy(false);
  };
  const mic = () => { setRec(true); recognize({ onResult: (t) => send(t), onError: () => setRec(false), onEnd: () => setRec(false) }); };

  return (
    <>
      <p className="sm">Practise a real conversation. The partner corrects your last message and gives a small tip. Your messages are sent to an AI service to get a reply.</p>
      <Seg items={SC.map((x) => x[1])} value={sc} onChange={pick} />
      <label className="setrow"><input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} /> Read replies aloud</label>
      {msgs.map((m, i) => (
        <div key={i} className={"card" + (m.role === "user" ? " you" : "")}>
          <div className="sm">{m.role === "user" ? "You" : "Partner"}</div>
          <div className="en" style={{ fontSize: 17 }}>{m.content}</div>
          {m.role === "assistant" && <div className="row"><button className="b" onClick={() => say(m.content, rate)}>🔊</button></div>}
          {m.correction && m.correction.trim() !== m.content.trim() && <div className="res"><span className="g">✅ Better: {m.correction}</span></div>}
          {m.tip && <div className="sm">💡 {m.tip}</div>}
        </div>
      ))}
      {busy && <div className="sm">Partner is typing…</div>}
      {err && <div className="res"><span className="r">{err}</span></div>}
      <div className="row"><input className="inp" value={inp} placeholder="Type in English…" onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(inp)} /></div>
      <div className="row">
        <button className="b p" disabled={busy} onClick={() => send(inp)}>Send</button>
        {speechSupported() && <button className={"b" + (rec ? " rec" : "")} disabled={busy} onClick={mic}>{rec ? "🎙 Listening…" : "🎤 Speak"}</button>}
      </div>
    </>
  );
}
