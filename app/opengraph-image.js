import { ImageResponse } from "next/og";
export const alt = "English Daily – English Speaking Practice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#fbf6ec", color: "#17140f", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", fontSize: 110, fontWeight: 700 }}>
          English<span style={{ background: "#ffc533", padding: "0 18px", marginLeft: 12, borderRadius: 18 }}>Daily</span>
        </div>
        <div style={{ fontSize: 46, marginTop: 36 }}>Speak English with confidence. A little every day.</div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#6a6358" }}>Roadmaps · Grammar · Vocabulary · Speaking · Quizzes</div>
      </div>
    ),
    size
  );
}
