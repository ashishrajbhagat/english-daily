export const metadata = { title: "Offline – English Daily" };

export default function Offline() {
  return (
    <div className="legal">
      <h1>You are offline</h1>
      <p>Check your internet connection. Pages you opened before still work, and your progress is saved on this device.</p>
      <a className="b p" href="/">Try again</a>
    </div>
  );
}
