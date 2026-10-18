// Loads extra content added by an admin (Supabase table custom_items) and merges it into DATA at runtime.
import { supabase } from "./supabase";
import { DATA } from "./content";

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
    });
    return data.length > 0;
  } catch (e) { loaded = false; return false; }
}
