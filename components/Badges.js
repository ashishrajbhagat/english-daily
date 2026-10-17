const tasks = (s) => Object.values(s.rp).reduce((n, r) => n + Object.keys(r.pd || {}).length, 0);
const B = [
  ["xp1", "🌱", "100 XP", (s) => s.xp >= 100],
  ["xp2", "🚀", "500 XP", (s) => s.xp >= 500],
  ["xp3", "💎", "1000 XP", (s) => s.xp >= 1000],
  ["st3", "🔥", "3-day streak", (s) => s.streak >= 3],
  ["st7", "🏆", "7-day streak", (s) => s.streak >= 7],
  ["gr5", "📘", "5 lessons", (s) => Object.keys(s.gd).length >= 5],
  ["gr20", "🎓", "20 lessons", (s) => Object.keys(s.gd).length >= 20],
  ["tk25", "⭐", "25 tasks", (s) => tasks(s) >= 25],
  ["tk100", "🏅", "100 tasks", (s) => tasks(s) >= 100],
  ["rd", "🎯", "Roadmap finisher", (s) => Object.values(s.rp).some((r) => (r.round || 0) >= 1)],
];

export default function Badges({ s }) {
  const n = B.filter((b) => b[3](s)).length;
  return (
    <>
      <h3 className="sec-t">Your badges · {n}/{B.length}</h3>
      <div className="badges">
        {B.map((b) => (
          <div key={b[0]} className={"bdg " + (b[3](s) ? "on" : "off")}>
            <div style={{ fontSize: 26 }}>{b[1]}</div>{b[2]}
          </div>
        ))}
      </div>
    </>
  );
}
