// Date-based spaced repetition for the mistake notebook (Leitner boxes).
// A mistake comes back after 1, 3 and 7 days of correct answers and is learned after 4 correct reviews in a row.
export const DAYS = [1, 3, 7];
const DAY = 864e5;
export const isDue = (m, now = Date.now()) => !m.due || m.due <= now;
export function answered(m, correct, now = Date.now()) {
  if (!correct) return { ...m, box: 0, due: now };
  const box = (m.box || 0) + 1;
  if (box > DAYS.length) return null;
  return { ...m, box, due: now + DAYS[box - 1] * DAY };
}
export function nextDue(list) {
  const d = list.filter((m) => m.due).map((m) => m.due);
  return d.length ? Math.min(...d) : 0;
}
