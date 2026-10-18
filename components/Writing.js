"use client";
import { useState } from "react";
import Seg from "./Seg";
import { useApp } from "../lib/app";
import { DATA } from "../lib/content";

export default function Writing({ lv }) {
  const items = DATA.WR.filter((w) => w[0] === lv);
  const [i, setI] = useState(0);
  return (
    <div className="narrow">
      <Seg items={items.map((_, k) => "Task " + (k + 1))} value={i} onChange={setI} />
      <Task key={i + ":" + lv} w={items[i]} />
    </div>
  );
}

function Task({ w }) {
  const { addXp } = useApp();
  const [text, setText] = useState("");
  const [ck, setCk] = useState([false, false, false]);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const n = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ready = n >= w[2] && ck.every(Boolean);
  return (
    <div className="card">
      <div className="en">{w[1]}</div>
      <textarea className="inp ta" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write here in English…" />
      <div className="sm">{n} / {w[2]} words</div>
      <div className="bar" style={{ margin: "6px 0 10px" }}><i style={{ width: Math.min(100, (n / w[2]) * 100) + "%" }} /></div>
      <div className="sm"><b>Self-check before you finish:</b></div>
      {w[3].map((c, k) => (
        <label key={k} className="setrow"><input type="checkbox" checked={ck[k]} onChange={() => setCk(ck.map((x, j) => (j === k ? !x : x)))} /> {c}</label>
      ))}
      <div className="row">
        <button className="b p" disabled={!ready || done} onClick={() => { addXp(10); setDone(true); }}>{done ? "Done ✓" : "Finish (+10 XP)"}</button>
        <button className="b" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"} sample answer</button>
      </div>
      {show && <div className="res sm" style={{ color: "var(--ink)" }}>{w[4]}</div>}
    </div>
  );
}
