"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LEVELS, LV } from "../../lib/levels";

const KINDS = [["phrase", "Phrase"], ["word", "Word"], ["phrasal", "Phrasal verb"], ["quiz", "Quiz question"], ["dialogue", "Dialogue"], ["reading", "Reading passage"], ["lesson", "Grammar lesson"]];
const emptyQ = (n) => ({ q: "", o: Array(n).fill(""), a: 0, explain: "" });
const blank = () => ({
  cat: "Custom", en: "", hi: "", word: "", example: "", title: "", text: "", formula: "", explain: "", hindi: "", ex1: "", ex2: "",
  q1: emptyQ(4), q2: emptyQ(3), q3: emptyQ(3),
  lines: [["Partner", ""], ["You", ""], ["Partner", ""], ["You", ""]],
});
const label = (r) => { const d = r.data || {}; return r.kind === "phrase" ? d.en : r.kind === "quiz" ? d.q : r.kind === "word" || r.kind === "phrasal" ? d.word : d.title; };

function buildQ(v) {
  const filled = v.o.map((x) => x.trim());
  const opts = filled.filter(Boolean);
  if (!v.q.trim() || opts.length < 2 || !filled[v.a]) return null;
  return [v.q.trim(), opts, filled.slice(0, v.a).filter(Boolean).length];
}

function QEdit({ v, onChange, title, withExplain }) {
  return (
    <div className="card" style={{ boxShadow: "none" }}>
      <div className="sm"><b>{title}</b></div>
      <label className="fld">Question<input className="inp" value={v.q} onChange={(e) => onChange({ ...v, q: e.target.value })} /></label>
      <div className="sm">Options (select the correct one)</div>
      {v.o.map((x, i) => (
        <div className="optrow fld" key={i}>
          <input type="radio" checked={v.a === i} onChange={() => onChange({ ...v, a: i })} aria-label={"Correct option " + "ABCD"[i]} />
          <input className="inp" value={x} onChange={(e) => onChange({ ...v, o: v.o.map((y, j) => (j === i ? e.target.value : y)) })} placeholder={"Option " + "ABCD"[i]} />
        </div>
      ))}
      {withExplain && <label className="fld">Explanation (optional)<input className="inp" value={v.explain} onChange={(e) => onChange({ ...v, explain: e.target.value })} /></label>}
    </div>
  );
}

export default function Admin() {
  const [state, setState] = useState("loading");
  const [rows, setRows] = useState([]);
  const [kind, setKind] = useState("phrase");
  const [lv, setLv] = useState(0);
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("custom_items").select("id,kind,level,data").order("id", { ascending: false });
    setRows(data || []);
  }, []);
  useEffect(() => {
    if (!supabase) { setState("off"); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setState("nologin"); return; }
      const r = await supabase.from("admins").select("email").maybeSingle();
      if (!r.data) { setState("denied"); return; }
      setState("ok"); load();
    });
  }, [load]);

  const set = (k, v) => setF({ ...f, [k]: v });
  const add = async (e) => {
    e.preventDefault(); setMsg("");
    let data;
    if (kind === "phrase") {
      if (!f.en.trim() || !f.hi.trim()) { setMsg("Enter the English phrase and its Hindi meaning."); return; }
      data = { cat: f.cat.trim() || "Custom", en: f.en.trim(), hi: f.hi.trim() };
    } else if (kind === "word" || kind === "phrasal") {
      if (!f.word.trim() || !f.hi.trim()) { setMsg("Enter the word and its Hindi meaning."); return; }
      data = { word: f.word.trim(), hi: f.hi.trim(), example: f.example.trim() };
    } else if (kind === "quiz") {
      const q = buildQ(f.q1);
      if (!q) { setMsg("Enter a question, at least 2 options and a non-empty correct option."); return; }
      data = { q: q[0], options: q[1], answer: q[2], explain: f.q1.explain.trim() };
    } else if (kind === "dialogue") {
      const lines = f.lines.map(([w, t]) => [w.trim() || "Partner", t.trim()]).filter((x) => x[1]);
      if (!f.title.trim() || lines.length < 2) { setMsg("Enter a title and at least 2 lines."); return; }
      data = { title: f.title.trim(), lines };
    } else {
      const qs = [buildQ(f.q2), buildQ(f.q3)];
      if (!f.title.trim()) { setMsg("Enter a title."); return; }
      if (qs.some((x) => !x)) { setMsg("Both practice questions need a question, at least 2 options and a correct option."); return; }
      if (kind === "reading") {
        if (f.text.trim().length < 20) { setMsg("The passage is too short."); return; }
        data = { title: f.title.trim(), text: f.text.trim(), questions: qs };
      } else {
        const examples = [f.ex1.trim(), f.ex2.trim()].filter(Boolean);
        if (!f.explain.trim() || !examples.length) { setMsg("Enter an explanation and at least one example."); return; }
        data = { title: f.title.trim(), explain: f.explain.trim(), formula: f.formula.trim(), examples, questions: qs, hindi: f.hindi.trim() };
      }
    }
    setBusy(true);
    const { error } = await supabase.from("custom_items").insert({ kind, level: lv, data });
    setBusy(false);
    if (error) { setMsg(error.message + (/check|constraint/i.test(error.message) ? " (Run the latest supabase/schema.sql so the new content types are allowed.)" : "")); return; }
    setF(blank()); setMsg("Added. Learners see it the next time they open the app."); load();
  };
  const del = async (r) => {
    const warn = r.kind === "lesson" ? "Deleting a grammar lesson can shift the saved progress of later custom lessons. Delete anyway?" : "Delete this item?";
    if (!window.confirm(warn)) return;
    await supabase.from("custom_items").delete().eq("id", r.id); load();
  };

  const head = <><a href="/" className="b">← Back to English Daily</a><h1>Admin panel</h1></>;
  if (state !== "ok") {
    return (
      <div className="legal">{head}
        <p>{state === "loading" ? "Loading…" : state === "off" ? "Cloud login is not set up on this site." : state === "nologin" ? "Please log in on the main page first (profile icon), then come back." : "Your account is not an admin. Add your email to the admins table in Supabase (see the README)."}</p>
      </div>
    );
  }
  return (
    <div className="legal admin">{head}
      <p className="sm">Add content without editing code. It appears for all learners at the level you choose.</p>
      <form className="card" onSubmit={add}>
        <label className="fld">Type<select value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label className="fld">Level<select value={lv} onChange={(e) => setLv(+e.target.value)}>{LEVELS.map((l, i) => <option key={l} value={i}>{LV[l].ic} {l}</option>)}</select></label>
        {kind === "phrase" && (<>
          <label className="fld">Category<input className="inp" value={f.cat} onChange={(e) => set("cat", e.target.value)} /></label>
          <label className="fld">English phrase<input className="inp" value={f.en} onChange={(e) => set("en", e.target.value)} /></label>
          <label className="fld">Hindi meaning<input className="inp" value={f.hi} onChange={(e) => set("hi", e.target.value)} /></label>
        </>)}
        {(kind === "word" || kind === "phrasal") && (<>
          <label className="fld">{kind === "word" ? "Word" : "Phrasal verb"}<input className="inp" value={f.word} onChange={(e) => set("word", e.target.value)} /></label>
          <label className="fld">Hindi meaning<input className="inp" value={f.hi} onChange={(e) => set("hi", e.target.value)} /></label>
          <label className="fld">Example sentence<input className="inp" value={f.example} onChange={(e) => set("example", e.target.value)} /></label>
        </>)}
        {kind === "quiz" && <QEdit v={f.q1} onChange={(v) => set("q1", v)} title="Quiz question" withExplain />}
        {kind === "dialogue" && (<>
          <label className="fld">Title<input className="inp" value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
          <div className="sm">Lines. Use the speaker name &quot;You&quot; for lines the learner should speak.</div>
          {f.lines.map((l, i) => (
            <div className="row" key={i} style={{ marginTop: 6 }}>
              <input className="inp" style={{ flex: "0 1 120px" }} value={l[0]} onChange={(e) => set("lines", f.lines.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} aria-label={"Speaker " + (i + 1)} />
              <input className="inp" value={l[1]} onChange={(e) => set("lines", f.lines.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} placeholder={"Line " + (i + 1)} aria-label={"Line " + (i + 1)} />
            </div>
          ))}
        </>)}
        {kind === "reading" && (<>
          <label className="fld">Title<input className="inp" value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="fld">Passage<textarea className="inp ta" rows={6} value={f.text} onChange={(e) => set("text", e.target.value)} /></label>
          <QEdit v={f.q2} onChange={(v) => set("q2", v)} title="Question 1" />
          <QEdit v={f.q3} onChange={(v) => set("q3", v)} title="Question 2" />
        </>)}
        {kind === "lesson" && (<>
          <label className="fld">Title<input className="inp" value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="fld">Explanation (simple English)<textarea className="inp ta" rows={3} value={f.explain} onChange={(e) => set("explain", e.target.value)} /></label>
          <label className="fld">Formula<input className="inp" value={f.formula} onChange={(e) => set("formula", e.target.value)} placeholder="Subject + have/has + V3" /></label>
          <label className="fld">Example 1<input className="inp" value={f.ex1} onChange={(e) => set("ex1", e.target.value)} /></label>
          <label className="fld">Example 2<input className="inp" value={f.ex2} onChange={(e) => set("ex2", e.target.value)} /></label>
          <label className="fld">Hindi note<input className="inp" value={f.hindi} onChange={(e) => set("hindi", e.target.value)} /></label>
          <QEdit v={f.q2} onChange={(v) => set("q2", v)} title="Practice question 1" />
          <QEdit v={f.q3} onChange={(v) => set("q3", v)} title="Practice question 2" />
        </>)}
        <button className="b p full" type="submit" disabled={busy}>{busy ? "Saving…" : "Add item"}</button>
        {msg && <div className="notice" role="status">{msg}</div>}
      </form>
      <h3 className="sec-t">Items you added ({rows.length})</h3>
      <div className="card">
        {rows.length === 0 && <p className="sm">Nothing yet.</p>}
        {rows.map((r) => (
          <div className="arow" key={r.id}>
            <span><b>{label(r)}</b><div className="sm">{KINDS.find((k) => k[0] === r.kind)[1]} · {LV[LEVELS[r.level]].ic} {LEVELS[r.level]}</div></span>
            <button className="b dng" onClick={() => del(r)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
