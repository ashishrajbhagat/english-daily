"use client";
import { useState } from "react";
import { useApp } from "../lib/app";
import { LV } from "../lib/levels";
import { downloadCertificate } from "../lib/certificate";
import { burst } from "../lib/confetti";
import { ROADMAPS, STAGES, stageCount, curDay, dayTasks } from "../lib/roadmaps";

const dayDone = (rp, r, d, lv) => dayTasks(r, d, lv, rp.round || 0).every((t) => rp.pd[d + "-" + t.k]);
export const progressOf = (s, r) => {
  const rp = s.rp[r.id];
  if (!rp) return null;
  const lv = s.level || "Beginner";
  let done = 0;
  for (let d = 1; d <= r.days; d++) if (dayDone(rp, r, d, lv)) done++;
  return { rp, cur: curDay(rp, r), done };
};

function Detail({ id, back, go }) {
  const { s, addXp, toggleTask, nextRound, resetRoadmap, user, access, openAuth } = useApp();
  const r = ROADMAPS.find((x) => x.id === id);
  const lv = s.level || "Beginner";
  const rp = s.rp[id];
  const [sel, setSel] = useState(0);
  if (!rp) return null;
  const cur = curDay(rp, r);
  const d = sel || cur;
  const round = rp.round || 0;
  const days = Array.from({ length: r.days }, (_, i) => i + 1);
  const done = (n) => dayDone(rp, r, n, lv);
  const doneCount = days.filter(done).length;
  const missed = days.filter((n) => n < cur && !done(n));
  return (
    <>
      <button className="b" onClick={back}>◀ All roadmaps</button>
      <h2>{r.emoji} {r.name}{round > 0 ? " · Round " + (round + 1) : ""}</h2>
      <div className="card">
        <div className="sm">Day {cur} of {r.days} · content level {LV[lv].ic} {lv}</div>
        <b>{doneCount}/{r.days} days complete</b>
        <div className="bar" style={{ marginTop: 8 }}><i style={{ width: (doneCount / r.days) * 100 + "%" }} /></div>
      </div>
      {doneCount === r.days && (
        <div className="card hero">
          <h2>🎉 Roadmap complete!</h2>
          <p>You finished every day. Your XP, lessons, badges and mistake notebook stay with you. Keep the habit going with Round {round + 2}: a fresh mix of phrases, words, topics and dialogues.</p>
          <div className="row"><button className="b" onClick={() => nextRound(id)}>Start Round {round + 2}</button><button className="b" onClick={() => { if (!access.certificate) { openAuth(1); return; } const nm = window.prompt("Name for your certificate:", s.nick || (user && user.email ? user.email.split("@")[0] : "")); if (nm !== null) downloadCertificate({ name: nm.trim(), title: r.name, level: lv, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }); }}>{access.certificate ? "🎓 Download certificate" : "🔒 Log in for your certificate"}</button></div>
        </div>
      )}
      {missed.length > 0 && (
        <div className="card nudge">⏰ <b>{missed.length} {missed.length === 1 ? "day" : "days"} pending:</b> Day {missed.slice(0, 5).join(", ")}{missed.length > 5 ? "…" : ""}. No worries, earlier days stay unlocked. Catch up along with today.
          <div className="row"><button className="b p" onClick={() => setSel(missed[0])}>Open Day {missed[0]}</button></div>
        </div>
      )}
      <h2>Day {d}{d === cur ? " (today)" : ""}</h2>
      <div className="cols">
        {dayTasks(r, d, lv, round).map((t) => {
          const key = d + "-" + t.k;
          const on = !!rp.pd[key];
          return (
            <div className={"card task" + (on ? " done" : "")} key={key}>
              <button className="chk" aria-label="Mark as done" onClick={() => { if (!on) { addXp(10); if (dayTasks(r, d, lv, round).every((x) => x.k === t.k || rp.pd[d + "-" + x.k])) burst(); } toggleTask(id, key); }}>{on ? "✓" : ""}</button>
              <div className="tb">
                <b>{t.t}</b>
                {t.d && <div className="sm">{t.d.join(" · ")}</div>}
                <div className="row"><button className="b" onClick={() => go(t.tab)}>Open ▶</button><span className="sm">+10 XP</span></div>
              </div>
            </div>
          );
        })}
      </div>
      <h3 className="sec-t">Your path</h3>
      {Array.from({ length: stageCount(r) }, (_, k) => {
        const a = k * r.stage + 1, b = Math.min(r.days, (k + 1) * r.stage);
        return (
          <div className="stage" key={k}>
            <div className="sh"><span className="sn">{k + 1}</span><div><b>{STAGES[k]}</b><div className="sm">Days {a} to {b}</div></div></div>
            <div className="days">
              {days.filter((n) => n >= a && n <= b).map((n) => (
                <button key={n} disabled={n > cur} onClick={() => setSel(n)}
                  className={"dbtn" + (n === d ? " on" : "") + (n < cur && !done(n) ? " miss" : "") + (n === cur ? " today" : "") + (done(n) ? " ok" : "")}>
                  {done(n) ? "✓" : n}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <div className="sm">✓ done · red = pending · faded days unlock on their date</div>
      <div className="row"><button className="b" onClick={() => { if (confirm("Remove this roadmap and its progress?")) { resetRoadmap(id); back(); } }}>Reset this roadmap</button></div>
    </>
  );
}

export default function Roadmaps({ go }) {
  const { s, cloud, user, openAuth, setSkip, startRoadmap, openLevel, access } = useApp();
  const [open, setOpen] = useState(s.ar && s.rp[s.ar] ? s.ar : null);
  const [ask, setAsk] = useState(null);
  const lv = s.level || "Beginner";
  const rec = lv === "Advanced" || lv === "Expert" ? "deep" : "daily";
  const begin = (id) => {
    if (cloud && !user && !s.sk && !Object.keys(s.rp).length) setAsk(id);
    else { startRoadmap(id); setOpen(id); }
  };
  if (open) return <Detail id={open} back={() => setOpen(null)} go={go} />;
  return (
    <>
      <div className="phead"><div><h2>Roadmaps</h2></div></div>
      <p className="sm">A roadmap is a day-by-day plan. Pick one, finish the small daily tasks and you will see steady progress. Content matches your level: <b>{LV[lv].ic} {lv}</b> · <button className="lnk" onClick={openLevel}>change level</button></p>
      <div className="cols">
        {ROADMAPS.map((r) => {
          const p = progressOf(s, r);
          const locked = !p && !access.roadmap(r.id);
          return (
            <div className="card rm" key={r.id}>
              {r.id === rec && <span className="tag">Recommended for you</span>}
              <div className="rmh"><span className="rmi">{r.emoji}</span><div><div className="en">{r.name}</div><div className="sm">{r.days} days · {r.per} tasks a day · {r.time}</div></div></div>
              <p>{r.desc}</p>
              <p className="sm"><b>Best for:</b> {r.for}</p>
              {p && (<><div className="bar"><i style={{ width: (p.done / r.days) * 100 + "%" }} /></div><div className="sm">{p.done}/{r.days} days complete</div></>)}
              <div className="row"><button className="b p" onClick={() => (p ? setOpen(r.id) : locked ? openAuth(1) : begin(r.id))}>{p ? "Continue" : locked ? "🔒 Log in to unlock" : "Start this roadmap"}</button></div>
            </div>
          );
        })}
      </div>
      {ask && (
        <div className="modal-bg">
          <div className="card modal">
            <div className="en">☁️ Keep your progress safe?</div>
            <p className="sm">If you log in, your roadmap, XP and streak are saved and available on any device. You can also continue without logging in, but your data stays on this device only.</p>
            <div className="row">
              <button className="b p" onClick={() => { startRoadmap(ask); setOpen(ask); setAsk(null); openAuth(); }}>Login / Sign up</button>
              <button className="b" onClick={() => { setSkip(); startRoadmap(ask); setOpen(ask); setAsk(null); }}>Skip for now</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
