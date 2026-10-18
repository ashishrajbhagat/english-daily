export default function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "/privacy", "/terms"].map((p) => ({ url: site + p, lastModified: new Date() }));
}
