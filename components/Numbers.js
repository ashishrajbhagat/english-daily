"use client";
import { useState } from "react";
import Seg from "./Seg";
import Line from "./Line";

const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const W = (n) => {
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
  if (n < 1000) return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + W(n % 100) : "");
  return W(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? (n % 1000 < 100 ? " and " : " ") + W(n % 1000) : "");
};
const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const MIN = [0, 5, 10, 15, 20, 30, 40, 45, 55];

const GEN = [
  () => { const n = r(5, 99) * [1, 10, 50][r(0, 2)] + (Math.random() < 0.5 ? r(0, 9) : 0); return ["It costs " + W(n) + " rupees.", "₹" + n.toLocaleString("en-IN")]; },
  () => {
    const h = r(1, 12), m = MIN[r(0, MIN.length - 1)], nx = h === 12 ? 1 : h + 1;
    const t = m === 0 ? W(h) + " o'clock" : m === 15 ? "quarter past " + W(h) : m === 30 ? "half past " + W(h) : m === 45 ? "quarter to " + W(nx) : m < 30 ? W(m) + " past " + W(h) : W(60 - m) + " to " + W(nx);
    return ["The meeting is at " + t + ".", h + ":" + String(m).padStart(2, "0")];
  },
  () => {
    const y = r(1950, 2035);
    const t = y < 2000 ? W(Math.floor(y / 100)) + " " + (y % 100 === 0 ? "hundred" : y % 100 < 10 ? "oh " + W(y % 100) : W(y % 100)) : y < 2010 ? "two thousand" + (y > 2000 ? " and " + W(y - 2000) : "") : "twenty " + W(y - 2000);
    return ["It happened in " + t + ".", String(y)];
  },
  () => {
    const d = [r(6, 9)]; for (let i = 0; i < 9; i++) d.push(r(0, 9));
    return ["My number is " + d.map((x) => ones[x]).join(" ") + ".", d.slice(0, 5).join("") + " " + d.slice(5).join("")];
  },
];

export default function Numbers() {
  const [m, setM] = useState(0);
  const [k, setK] = useState(0);
  const [item, setItem] = useState(() => GEN[0]());
  const pick = (i) => { setM(i); setItem(GEN[i]()); setK(k + 1); };
  return (
    <>
      <div className="phead"><div><p className="sm">Practise saying numbers, times and years clearly. Tap Listen first, then speak.</p></div></div>
      <Seg items={["Prices", "Time", "Years", "Phone numbers"]} value={m} onChange={pick} />
      <div className="narrow">
        <Line key={k} t={item[0]} hi={"Digits: " + item[1]} />
        <div className="row" style={{ justifyContent: "center" }}><button className="b p" onClick={() => { setItem(GEN[m]()); setK(k + 1); }}>New one ▶</button></div>
      </div>
    </>
  );
}
