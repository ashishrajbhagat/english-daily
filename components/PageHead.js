"use client";
import { useApp } from "../lib/app";

export default function PageHead({ title, sub, right }) {
  const { t } = useApp();
  return (
    <div className="phead">
      <div><h2>{t(title)}</h2>{sub && <p className="sm">{t(sub)}</p>}</div>
      {right}
    </div>
  );
}
