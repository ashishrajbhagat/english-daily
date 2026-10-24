"use client";
import { useEffect, useState } from "react";
import Seg from "./Seg";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/app";
import { weekStart } from "../lib/week";

export default function Leaderboard() {
  const { user } = useApp();
  const [m, setM] = useState(0);
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!supabase || !user) return;
    setRows(null);
    let q = supabase.from("leaderboard").select("nick,xp,wxp");
    q = m === 0 ? q.eq("week", weekStart()).order("wxp", { ascending: false }) : q.order("xp", { ascending: false });
    q.limit(10).then(({ data }) => setRows(data || []));
  }, [user, m]);
  if (!supabase || !user) return null;
  return (
    <>
      <h3 className="sec-t">Leaderboard</h3>
      <Seg items={["This week", "All time"]} value={m} onChange={setM} />
      <div className="card">
        {rows && rows.length ? rows.map((r, i) => (
          <div className="lbrow" key={i}><span>{["🥇", "🥈", "🥉"][i] || i + 1}</span><b>{r.nick}</b><span>{m === 0 ? r.wxp : r.xp} XP</span></div>
        )) : <p className="sm">{rows ? (m === 0 ? "Nobody has earned XP this week yet. Join from your profile (Account tab) and be the first!" : "No one has joined yet.") : "Loading…"}</p>}
      </div>
    </>
  );
}
