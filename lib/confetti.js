export function burst() {
  if (typeof document === "undefined" || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  const box = document.createElement("div");
  box.className = "confetti";
  const cols = ["#ffc533", "#1f9d55", "#2f6bff", "#d7263d", "#7c4dff", "#f08a00"];
  for (let i = 0; i < 44; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.4 + "s";
    p.style.setProperty("--dx", Math.random() * 160 - 80 + "px");
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2800);
}
