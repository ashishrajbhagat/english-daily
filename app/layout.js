import "./globals.css";

export const metadata = {
  title: "English Daily – English Speaking Practice",
  description: "Practice spoken English with phrases, dialogues, grammar lessons, quizzes and free talk.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg" },
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fbf6ec" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
