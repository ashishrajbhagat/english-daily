import "./globals.css";
import Script from "next/script";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "English Daily – English Speaking Practice";
const description = "Learn to speak English with daily roadmaps, grammar lessons, vocabulary, speaking practice and quizzes for Beginner to Expert levels.";

export const metadata = {
  metadataBase: new URL(site),
  title: { default: title, template: "%s" },
  description,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg" },
  openGraph: { title, description, type: "website", siteName: "English Daily" },
  twitter: { card: "summary_large_image", title, description },
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fbf6ec" };

export default function RootLayout({ children }) {
  const pl = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en">
      <body>
        {children}
        {pl && <Script defer data-domain={pl} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
