"use client";
import { useApp } from "../lib/app";

export default function InfoModal() {
  const { infoOpen, closeInfo, s } = useApp();
  if (!infoOpen) return null;
  return (
    <div className="modal-bg" onClick={closeInfo}>
      <div className="card modal lvm" onClick={(e) => e.stopPropagation()}>
        <button className="ib" style={{ float: "right" }} onClick={closeInfo} aria-label="Close">✕</button>
        <div className="en">How points and streaks work</div>
        <div className="info"><span>⭐</span><div><b>XP = experience points</b><p>You earn XP every time you practise. It shows how much you have practised. You have {s.xp} XP.</p></div></div>
        <ul className="xplist">
          <li>Finish a roadmap task: +10</li>
          <li>Complete a grammar lesson: +20</li>
          <li>Free talk for 60 seconds: +15</li>
          <li>Speak a phrase well (80% or more): +5</li>
          <li>Dictation 80% or more: +5</li>
          <li>Each correct quiz answer: +3</li>
          <li>Flashcard "I know it" or fixing a mistake: +2</li>
        </ul>
        <div className="info"><span>🔥</span><div><b>Streak = days in a row</b><p>Do at least one activity every day to grow your streak. If you skip a day, it starts again from 1. Your streak is {s.streak}.</p><p>❄️ Every 7-day streak earns a streak freeze (max 2) that protects one missed day. You have {s.fz || 0}.</p></div></div>
        <div className="info"><span>🎯</span><div><b>Level</b><p>Your English level (Beginner to Expert) decides which content you see. You can change it anytime.</p></div></div>
        <div className="row"><button className="b p" onClick={closeInfo}>Got it</button></div>
      </div>
    </div>
  );
}
