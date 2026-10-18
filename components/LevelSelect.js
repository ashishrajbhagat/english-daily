"use client";
import { LEVELS, LV } from "../lib/levels";

export default function LevelSelect({ value, onChange }) {
  return (
    <label className="lsel">
      <span>Level</span>
      <select value={value} onChange={(e) => onChange(+e.target.value)} aria-label="Choose level">
        {LEVELS.map((l, i) => <option key={l} value={i}>{LV[l].ic} {l}</option>)}
      </select>
    </label>
  );
}
