// Quick syntax check for JS and JSX files (no dependencies). Catches unbalanced brackets, unclosed or mismatched JSX tags,
// and unterminated strings. It is a safety net, not a full compiler: `next build` is the real test.
import fs from "fs";
import path from "path";

function check(src, file) {
  let i = 0, prev = "";
  const n = src.length;
  const line = (p) => src.slice(0, p).split("\n").length;
  const fail = (m, p = i) => { throw new Error(file + ":" + line(p) + "  " + m); };
  const idStart = (c) => /[A-Za-z_$]/.test(c || "");

  function str(q) {
    const s = i; i++;
    while (i < n && src[i] !== q) { if (src[i] === "\\") i++; else if (src[i] === "\n") fail("unterminated string", s); i++; }
    if (i >= n) fail("unterminated string", s);
    i++; prev = q;
  }
  function tpl() {
    const s = i; i++;
    while (i < n && src[i] !== "`") {
      if (src[i] === "\\") { i += 2; continue; }
      if (src[i] === "$" && src[i + 1] === "{") { i += 2; code("}"); continue; }
      i++;
    }
    if (i >= n) fail("unterminated template string", s);
    i++; prev = "`";
  }
  function regex() {
    const s = i; i++; let cls = false;
    while (i < n) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "[") cls = true; else if (c === "]") cls = false;
      else if (c === "/" && !cls) { i++; break; }
      else if (c === "\n") fail("bad regular expression", s);
      i++;
    }
    while (/[a-z]/.test(src[i] || "")) i++;
    prev = "/";
  }
  function code(close) {
    while (i < n) {
      const c = src[i];
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); if (e < 0) fail("unterminated comment"); i = e + 2; continue; }
      if (c === '"' || c === "'") { str(c); continue; }
      if (c === "`") { tpl(); continue; }
      if (c === "{") { i++; prev = "{"; code("}"); prev = "}"; continue; }
      if (c === "(") { i++; prev = "("; code(")"); prev = ")"; continue; }
      if (c === "[") { i++; prev = "["; code("]"); prev = "]"; continue; }
      if (c === "}" || c === ")" || c === "]") { if (c !== close) fail("unexpected " + c + (close ? " (expected " + close + ")" : "")); i++; return; }
      if (c === "/") {
        if (/[(,=:[!&|?{};]/.test(prev) || prev === "return" || prev === "") { regex(); continue; }
        i++; prev = "/"; continue;
      }
      if (c === "<" && (idStart(src[i + 1]) || src[i + 1] === ">") && (prev === "return" || !/[A-Za-z0-9_$)\]]/.test(prev))) { jsx(); prev = ">"; continue; }
      if (!/\s/.test(c)) {
        if (idStart(c)) { let j = i; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++; const w = src.slice(i, j); prev = w === "return" ? "return" : w[w.length - 1]; i = j; continue; }
        prev = c;
      }
      i++;
    }
    if (close) fail("missing " + close + " before end of file");
  }
  function jsx() {
    const s = i; i++;
    if (src[i] === ">") { i++; kids("", s); return; }
    let j = i; while (/[A-Za-z0-9_.$:-]/.test(src[j] || "")) j++;
    const tag = src.slice(i, j); i = j;
    for (;;) {
      while (/\s/.test(src[i] || "")) i++;
      if (i >= n) fail("unclosed tag <" + tag, s);
      if (src[i] === "/" && src[i + 1] === ">") { i += 2; return; }
      if (src[i] === ">") { i++; break; }
      if (src[i] === "{") { i++; prev = "{"; code("}"); continue; }
      if (!idStart(src[i])) fail("unexpected character in attributes of <" + tag + ">", i);
      let k = i; while (/[A-Za-z0-9_$:-]/.test(src[k] || "")) k++; i = k;
      while (/\s/.test(src[i] || "")) i++;
      if (src[i] === "=") {
        i++; while (/\s/.test(src[i] || "")) i++;
        if (src[i] === '"' || src[i] === "'") { const q = src[i], e = src.indexOf(q, i + 1); if (e < 0) fail("unterminated attribute string", i); i = e + 1; }
        else if (src[i] === "{") { i++; prev = "{"; code("}"); }
        else fail("bad attribute value in <" + tag + ">", i);
      }
    }
    kids(tag, s);
  }
  function kids(tag, s) {
    for (;;) {
      if (i >= n) fail("<" + tag + "> is never closed", s);
      const c = src[i];
      if (c === "{") { i++; prev = "{"; code("}"); continue; }
      if (c === "<") {
        if (src[i + 1] === "/") { const e = src.indexOf(">", i); const name = src.slice(i + 2, e).trim(); if (name !== tag) fail("</" + name + "> does not match <" + tag + ">", i); i = e + 1; return; }
        jsx(); continue;
      }
      if (c === ">" ) fail("a raw > in JSX text (use &gt;)", i);
      i++;
    }
  }
  code("");
}

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (["node_modules", ".next", ".git"].includes(f)) continue;
    const p = path.join(d, f);
    fs.statSync(p).isDirectory() ? walk(p) : /\.(js|mjs)$/.test(f) && files.push(p);
  }
})(".");
let bad = 0;
for (const f of files) { try { check(fs.readFileSync(f, "utf8"), f); } catch (e) { bad++; console.log("❌ " + e.message); } }
console.log(bad ? bad + " file(s) with problems" : "Syntax check passed for " + files.length + " files");
process.exit(bad ? 1 : 0);
