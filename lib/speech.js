export const norm = (t) => t.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);

export function say(t, rate = 0.9, onend) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = rate;
  if (onend) u.onend = onend;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function recognize({ continuous = false, onResult, onError, onEnd }) {
  const R = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!R) { onError && onError("unsupported"); return null; }
  const r = new R();
  r.lang = "en-US";
  r.continuous = continuous;
  r.interimResults = false;
  r.onresult = (e) => {
    let s = "";
    for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript + " ";
    onResult(s.trim(), e.results[e.results.length - 1][0].confidence);
  };
  r.onerror = (e) => onError && onError(e.error);
  r.onend = () => onEnd && onEnd();
  try { r.start(); } catch (e) {}
  return r;
}

export const speechSupported = () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
