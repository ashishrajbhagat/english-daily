"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/app";

export default function Leaderboard() {
  const { user } = useApp();
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!supabase || !user) return;
    supabase.from("leaderboard").select("nick,xp").order("xp", { ascending: false }).limit(10).then(({ data }) => setRows(data || []));
  }, [user]);
  if (!supabase || !user || !rows || !rows.length) return null;
  return (
    <>
      <h3 className="sec-t">Leaderboard · top learners</h3>
      <div className="card">
        {rows.map((r, i) => (
          <div className="lbrow" key={i}><span>{["🥇", "🥈", "🥉"][i] || i + 1}</span><b>{r.nick}</b><span>{r.xp} XP</span></div>
        ))}
      </div>
    </>
  );
}
