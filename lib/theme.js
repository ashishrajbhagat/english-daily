const KEY = "ed-theme";
export const getTheme = () => {
  const r = document.documentElement;
  return r.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
};
export const setTheme = (t) => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch (e) {}
};
export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");
export const initTheme = () => {
  try { const t = localStorage.getItem(KEY); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
};

const ZK = "ed-zoom";
export const getZoom = () => { try { return localStorage.getItem(ZK) || "1"; } catch (e) { return "1"; } };
export const setZoom = (z) => { document.documentElement.style.setProperty("--zoom", z); try { localStorage.setItem(ZK, z); } catch (e) {} };
export const initZoom = () => document.documentElement.style.setProperty("--zoom", getZoom());
