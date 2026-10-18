"use client";
import { useState } from "react";
import Seg from "./Seg";
import PageHead from "./PageHead";
import Quiz from "./Quiz";
import Revision from "./Revision";
import { useApp } from "../lib/app";

export default function Test({ sub }) {
  const { s } = useApp();
  const [m, setM] = useState(sub || 0);
  const n = (s.mk || []).length;
  return (
    <>
      <PageHead title="Quiz" sub="Test yourself and fix your mistakes." />
      <Seg items={["Quiz", "Mistake notebook" + (n ? " (" + n + ")" : "")]} value={m} onChange={setM} />
      {m === 0 && <Quiz />}
      {m === 1 && <Revision />}
    </>
  );
}
