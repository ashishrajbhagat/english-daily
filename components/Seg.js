"use client";
export default function Seg({ items, value, onChange }) {
  return (
    <div className="seg">
      {items.map((x, i) => (
        <button key={x} className={i === value ? "on" : ""} aria-pressed={i === value} onClick={() => onChange(i)}>{x}</button>
      ))}
    </div>
  );
}
