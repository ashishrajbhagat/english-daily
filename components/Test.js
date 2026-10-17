"use client";
import { useState } from "react";
import Seg from "./Seg";
import Quiz from "./Quiz";
import Revision from "./Revision";
import { useApp } from "../lib/app";

export default function Test({ sub }) {
  const { s } = useApp();
  const [m, setM] = useState(sub || 0);
  const n = (s.mk || []).length;
  return (
    <>
      <Seg items={["Quiz", "Mistake notebook" + (n ? " (" + n + ")" : "")]} value={m} onChange={setM} />
      {m === 0 && <Quiz />}
      {m === 1 && <Revision />}
    </>
  );
}
