"use client";
import { useState } from "react";
import Seg from "./Seg";
import { useApp } from "../lib/app";
import { say } from "../lib/speech";
import { DATA } from "../lib/content";
import { LEVELS, LV, pool, voLevel, pvLevel } from "../lib/levels";

const LVL = LEVELS.map((l) => LV[l].ic + " " + l);

function Flash({ deck }) {
  const { addXp, rate } = useApp();
  const [i, setI] = useState(0);
  const [f, setF] = useState(false);
  const v = deck[i % deck.length];
  const step = (d) => { setI((i + d + deck.length) % deck.length); setF(false); };
  return (
    <div className="narrow">
      <div className="card flash" onClick={() => setF(!f)}>
        {f ? <><div className="w">{v[1]}</div><div className="sm">{v[2]}</div></> : <><div className="w">{v[0]}</div><div className="sm">Tap the card to see the meaning</div></>}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="b" onClick={() => step(-1)} aria-label="Previous">◀</button>
        <button className="b" onClick={() => say(v[0] + ". " + v[2], rate)}>🔊 Listen</button>
        <button className="b p" onClick={() => { addXp(2); step(1); }}>I know it ✓</button>
        <button className="b" onClick={() => step(1)} aria-label="Next">▶</button>
      </div>
      <p className="sm" style={{ textAlign: "center" }}>{(i % deck.length) + 1} / {deck.length}</p>
    </div>
  );
}

export default function Words({ sub }) {
  const { level } = useApp();
  const [m, setM] = useState(sub || 0);
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  const deck = m === 0 ? pool(DATA.VO, (x, i) => voLevel(i), lv) : pool(DATA.PV, (x, i) => pvLevel(i), lv);
  return (
    <>
      <h2>Words</h2>
      <p className="sm">Learn new words and phrasal verbs. Tap a card to see the Hindi meaning and an example.</p>
      <Seg items={["Vocabulary", "Phrasal verbs"]} value={m} onChange={setM} />
      <Seg items={LVL} value={lv} onChange={setLv} />
      <Flash key={m + ":" + lv} deck={deck} />
    </>
  );
}
