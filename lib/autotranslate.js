// Hindi mode helper: translates the visible interface text (and placeholders, aria-labels, titles) using lib/i18n.js.
// It only changes text and attributes, never the page structure, and it restores English when stopped.
import { trString } from "./i18n";

const ATTRS = ["placeholder", "aria-label", "title"];
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "NOSCRIPT"]);

export function startAutoTranslate() {
  const done = new Map(); // node -> { text: [orig, out] } or attribute map

  const text = (n) => {
    const v = n.nodeValue;
    if (!v || !v.trim()) return;
    const out = trString(v);
    if (out && out !== v) { done.set(n, { o: v, t: out }); n.nodeValue = out; }
  };
  const attrs = (el) => {
    if (!el.getAttribute) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const out = trString(v);
      if (out && out !== v) {
        const m = done.get(el) || {};
        m[a] = { o: v, t: out };
        done.set(el, m);
        el.setAttribute(a, out);
      }
    }
  };
  const walk = (root) => {
    if (root.nodeType === 3) { if (!SKIP.has(root.parentNode && root.parentNode.nodeName)) text(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
    attrs(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) { if (!SKIP.has(n.parentNode.nodeName)) text(n); }
      else if (!SKIP.has(n.nodeName)) attrs(n);
    }
  };

  walk(document.body);
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "childList") m.addedNodes.forEach(walk);
      else if (m.type === "characterData") { if (m.target.nodeType === 3) text(m.target); }
      else if (m.type === "attributes") attrs(m.target);
    }
  });
  mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  return () => {
    mo.disconnect();
    done.forEach((v, k) => {
      if (!k.isConnected) return;
      if (k.nodeType === 3) { if (k.nodeValue === v.t) k.nodeValue = v.o; }
      else Object.keys(v).forEach((a) => { if (k.getAttribute(a) === v[a].t) k.setAttribute(a, v[a].o); });
    });
    done.clear();
  };
}
