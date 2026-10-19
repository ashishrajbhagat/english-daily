"use client";
export default function Error({ reset }) {
  return (
    <div className="legal">
      <h1>Something went wrong</h1>
      <p>Please try again. Your progress is safe on this device.</p>
      <button className="b p" onClick={() => reset()}>Try again</button>
    </div>
  );
}
