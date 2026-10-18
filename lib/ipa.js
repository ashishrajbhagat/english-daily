// Free IPA lookup (no key, no AI): api.dictionaryapi.dev. Results are cached in the browser.
const KEY = "ed-ipa";
let mem = null;
const cache = () => {
  if (mem) return mem;
  try { mem = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { mem = {}; }
  return mem;
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} };

async function one(w) {
  const m = cache();
  if (w in m) return m[w];
  try {
    const r = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(w));
    if (!r.ok) { if (r.status === 404) { m[w] = ""; save(); } return ""; }
    const j = await r.json();
    let p = "";
    for (const e of j) {
      if (e.phonetic) { p = e.phonetic; break; }
      for (const x of e.phonetics || []) if (x.text) { p = x.text; break; }
      if (p) break;
    }
    p = p.replace(/^\/|\/$/g, "");
    m[w] = p; save();
    return p;
  } catch (e) { return ""; }
}

export async function getIPAs(words) {
  const out = {};
  await Promise.all(words.filter(Boolean).map(async (w) => { out[w] = await one(w); }));
  return out;
}
