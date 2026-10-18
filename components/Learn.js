"use client";
import { useState } from "react";
import Seg from "./Seg";
import PageHead from "./PageHead";
import LevelSelect from "./LevelSelect";
import Reading from "./Reading";
import Writing from "./Writing";
import Translate from "./Translate";
import { useApp } from "../lib/app";
import { say } from "../lib/speech";
import { DATA } from "../lib/content";
import { LEVELS, pool, voOf, pvOf } from "../lib/levels";

function Flash({ deck }) {
  const { addXp, addMistake, rate } = useApp();
  const [i, setI] = useState(0);
  const [f, setF] = useState(false);
  const v = deck[i % deck.length];
  const step = (d) => { setI((i + d + deck.length) % deck.length); setF(false); };
  const later = () => {
    const others = deck.filter((_, k) => k !== i % deck.length).sort(() => Math.random() - 0.5).slice(0, 2).map((x) => x[1]);
    const a = Math.floor(Math.random() * 3);
    others.splice(a, 0, v[1]);
    addMistake({ q: 'What does "' + v[0] + '" mean?', o: others, a, e: v[2] });
    step(1);
  };
  return (
    <div className="narrow">
      <div className="card flash" onClick={() => setF(!f)}>
        {f ? <><div className="w">{v[1]}</div><div className="sm">{v[2]}</div></> : <><div className="w">{v[0]}</div><div className="sm">Tap the card to see the meaning</div></>}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="b" onClick={() => step(-1)} aria-label="Previous">◀</button>
        <button className="b" onClick={() => say(v[0] + ". " + v[2], rate)}>🔊 Listen</button>
        <button className="b" onClick={() => step(1)} aria-label="Next">▶</button>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="b" onClick={later}>🔁 Review later</button>
        <button className="b p" onClick={() => { addXp(2); step(1); }}>I know it ✓</button>
      </div>
      <p className="sm" style={{ textAlign: "center" }}>{(i % deck.length) + 1} / {deck.length} · &quot;Review later&quot; adds the word to your mistake notebook</p>
    </div>
  );
}

export default function Learn({ sub }) {
  const { level } = useApp();
  const [m, setM] = useState(sub || 0);
  const [lv, setLv] = useState(Math.max(0, LEVELS.indexOf(level)));
  return (
    <>
      <PageHead title="Learn" sub="Words, reading, writing and translation practice at your level." right={<LevelSelect value={lv} onChange={setLv} />} />
      <Seg items={["Vocabulary", "Phrasal verbs", "Reading", "Writing", "Translate"]} value={m} onChange={setM} />
      {m === 0 && <Flash key={"v" + lv} deck={pool(DATA.VO, voOf, lv)} />}
      {m === 1 && <Flash key={"p" + lv} deck={pool(DATA.PV, pvOf, lv)} />}
      {m === 2 && <Reading key={lv} lv={lv} />}
      {m === 3 && <Writing lv={lv} />}
      {m === 4 && <Translate key={lv} level={LEVELS[lv]} />}
    </>
  );
}
