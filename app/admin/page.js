"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LEVELS, LV } from "../../lib/levels";

const KINDS = [["phrase", "Phrase"], ["word", "Word"], ["phrasal", "Phrasal verb"], ["quiz", "Quiz question"]];
const blank = { cat: "Custom", en: "", hi: "", word: "", example: "", q: "", o: ["", "", "", ""], a: 0, explain: "" };
const label = (r) => { const d = r.data || {}; return r.kind === "phrase" ? d.en : r.kind === "quiz" ? d.q : d.word; };

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
    } else if (kind === "quiz") {
      const o = f.o.map((x) => x.trim()).filter(Boolean);
      if (!f.q.trim() || o.length < 2) { setMsg("Enter a question and at least 2 options."); return; }
      if (!f.o[f.a].trim()) { setMsg("The correct option cannot be empty."); return; }
      data = { q: f.q.trim(), options: o, answer: f.o.slice(0, f.a).filter((x) => x.trim()).length, explain: f.explain.trim() };
    } else {
      if (!f.word.trim() || !f.hi.trim()) { setMsg("Enter the word and its Hindi meaning."); return; }
      data = { word: f.word.trim(), hi: f.hi.trim(), example: f.example.trim() };
    }
    setBusy(true);
    const { error } = await supabase.from("custom_items").insert({ kind, level: lv, data });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setF(blank); setMsg("Added. Learners see it the next time they open the app."); load();
  };
  const del = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await supabase.from("custom_items").delete().eq("id", id); load();
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
      <p className="sm">Add phrases, words, phrasal verbs and quiz questions without editing code. They appear for all learners at the level you choose.</p>
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
        {kind === "quiz" && (<>
          <label className="fld">Question<input className="inp" value={f.q} onChange={(e) => set("q", e.target.value)} /></label>
          <div className="sm">Options (select the correct one)</div>
          {f.o.map((x, i) => (
            <div className="optrow fld" key={i}>
              <input type="radio" name="ans" checked={f.a === i} onChange={() => set("a", i)} aria-label={"Correct option " + "ABCD"[i]} />
              <input className="inp" value={x} onChange={(e) => set("o", f.o.map((y, j) => (j === i ? e.target.value : y)))} placeholder={"Option " + "ABCD"[i]} />
            </div>
          ))}
          <label className="fld">Explanation (optional)<input className="inp" value={f.explain} onChange={(e) => set("explain", e.target.value)} /></label>
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
            <button className="b dng" onClick={() => del(r.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
