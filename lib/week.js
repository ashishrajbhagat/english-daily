// Calendar weeks (Monday to Sunday) for the weekly leaderboard.
export const iso = (d) => d.toLocaleDateString("en-CA");
export function weekStart(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return iso(x);
}
export function weekXp(hist, start) {
  let n = 0;
  Object.keys(hist || {}).forEach((k) => { if (k >= start) n += hist[k] || 0; });
  return n;
}
