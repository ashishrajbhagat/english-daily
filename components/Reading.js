"use client";
import { useState } from "react";
import Seg from "./Seg";
import { useApp } from "../lib/app";
import { say } from "../lib/speech";
import { DATA } from "../lib/content";

export default function Reading({ lv }) {
  const { addXp, rate } = useApp();
  const items = DATA.RD.filter((r) => r[0] === lv);
  const [i, setI] = useState(0);
  const r = items[i];
  return (
    <div className="narrow">
      <Seg items={items.map((x) => x[1])} value={i} onChange={setI} />
      <Passage key={i} r={r} addXp={addXp} rate={rate} />
    </div>
  );
}

function Passage({ r, addXp, rate }) {
  const [ans, setAns] = useState({});
  const right = Object.keys(ans).filter((k) => ans[k] === r[3][k][2]).length;
  return (
    <>
      <div className="card">
        <div className="en">{r[1]}</div>
        <p style={{ fontSize: 17, lineHeight: 1.7 }}>{r[2]}</p>
        <div className="row"><button className="b" onClick={() => say(r[2], rate)}>🔊 Read aloud</button></div>
      </div>
      {r[3].map(([q, o, a], k) => (
        <div className="card" key={k}>
          <div className="en">{q}</div>
          {o.map((t, j) => (
            <button key={j} disabled={ans[k] !== undefined}
              className={"opt" + (ans[k] !== undefined && j === a ? " ok" : ans[k] === j ? " no" : "")}
              onClick={() => { setAns({ ...ans, [k]: j }); if (j === a) addXp(5); }}><i className="ltr">{"ABCD"[j]}</i>{t}</button>
          ))}
        </div>
      ))}
      {Object.keys(ans).length === r[3].length && <div className="res"><b>{right}/{r[3].length} correct.</b> {right === r[3].length ? "Excellent reading! 🎉" : "Read the passage again and try another one."}</div>}
    </>
  );
}
