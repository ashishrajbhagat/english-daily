// Loads extra content added by an admin (Supabase table custom_items) and merges it into DATA at runtime.
import { supabase } from "./supabase";
import { DATA } from "./content";
import { LEVELS } from "./levels";

let loaded = false;
export async function loadCustom() {
  if (loaded || !supabase) return false;
  loaded = true;
  try {
    const { data, error } = await supabase.from("custom_items").select("id,kind,level,data").order("id");
    if (error || !data) { loaded = false; return false; }
    data.forEach((r) => {
      const d = r.data || {}, L = r.level;
      if (r.kind === "phrase" && d.en && d.hi) DATA.PH.push([d.cat || "Custom", d.en, d.hi, L]);
      if (r.kind === "word" && d.word && d.hi) DATA.VO.push([d.word, d.hi, d.example || "", L]);
      if (r.kind === "phrasal" && d.word && d.hi) DATA.PV.push([d.word, d.hi, d.example || "", L]);
      if (r.kind === "quiz" && d.q && Array.isArray(d.options) && d.options.length > 1) DATA.QZ.push([d.q, d.options, d.answer || 0, d.explain || "", L]);
      if (r.kind === "dialogue" && d.title && Array.isArray(d.lines) && d.lines.length) DATA.DL.push({ t: d.title, l: d.lines, lv: L });
      if (r.kind === "reading" && d.title && d.text && Array.isArray(d.questions)) DATA.RD.push([L, d.title, d.text, d.questions]);
      if (r.kind === "lesson" && d.title && d.explain && Array.isArray(d.questions) && Array.isArray(d.examples)) DATA.GC.push([LEVELS[L], d.title, d.explain, d.formula || "", d.examples, d.questions, d.hindi || ""]);
    });
    return data.length > 0;
  } catch (e) { loaded = false; return false; }
}
