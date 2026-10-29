// Setup checker. Run: npm run doctor   (reads .env.local, plus any variables already set in the environment)
import fs from "fs";

const parse = (t) => {
  const o = {};
  for (const line of t.split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
  return o;
};
const file = [".env.local", ".env"].find((f) => fs.existsSync(f));
const fromEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(NEXT_PUBLIC_|SUPABASE_|VAPID_|CRON_|AI_)/.test(k) && process.env[k]));
const env = { ...(file ? parse(fs.readFileSync(file, "utf8")) : {}), ...fromEnv };
const has = (k) => !!(env[k] && env[k].trim());

let bad = 0;
const out = [];
const ok = (m) => out.push("✅ " + m);
const info = (m) => out.push("ℹ️  " + m);
const warn = (m) => out.push("⚠️  " + m);
const err = (m) => { bad++; out.push("❌ " + m); };

// Node
const [maj, min] = process.versions.node.split(".").map(Number);
(maj > 18 || (maj === 18 && min >= 17)) ? ok("Node " + process.versions.node) : err("Node 18.17 or newer is required (you have " + process.versions.node + ")");
file ? ok("Reading " + file) : warn("No .env.local found. Copy .env.example to .env.local (the app still runs without it).");

// secrets must never be public
Object.keys(env).filter((k) => k.startsWith("NEXT_PUBLIC_") && /SECRET|SERVICE|PRIVATE/.test(k)).forEach((k) => err(k + " must not start with NEXT_PUBLIC_ (it would be visible to everyone)"));

// Supabase
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url && !key) info("Cloud login is OFF. The app works fully on this device (no guest limits).");
else if (!url || !key) err("Set BOTH NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
else {
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url) ? ok("Supabase URL looks right") : warn("Supabase URL should look like https://xxxx.supabase.co");
  let role = "";
  if (key.startsWith("eyJ")) { try { role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role; } catch (e) {} }
  if (key.startsWith("sb_secret_") || role === "service_role") err("NEXT_PUBLIC_SUPABASE_ANON_KEY holds a SECRET key. Use the publishable key (sb_publishable_...) instead and delete/rotate the secret key.");
  else if (key.startsWith("sb_publishable_") || role === "anon") ok("Supabase publishable key looks right");
  else warn("Unrecognised Supabase key format; use the publishable key from Settings > API Keys");
  info("Cloud login is ON: guests get limited access (see lib/access.js).");
}

// site url
if (!has("NEXT_PUBLIC_SITE_URL")) warn("NEXT_PUBLIC_SITE_URL is empty. Set it to your Vercel URL after the first deploy (sitemap and share image use it).");
else /^https:\/\//.test(env.NEXT_PUBLIC_SITE_URL) || /localhost/.test(env.NEXT_PUBLIC_SITE_URL) ? ok("Site URL set") : warn("NEXT_PUBLIC_SITE_URL should start with https://");

// email links (the most common launch mistake)
if (url && has("NEXT_PUBLIC_SITE_URL")) info("Supabase > Authentication > URL Configuration: set Site URL to " + env.NEXT_PUBLIC_SITE_URL + " and add it to Redirect URLs, or email links will open localhost:3000.");
else if (url) warn("Set NEXT_PUBLIC_SITE_URL, then set the SAME address as Site URL in Supabase (Authentication > URL Configuration). Otherwise confirmation and reset emails open localhost:3000.");

// server key
if (has("SUPABASE_SERVICE_ROLE_KEY")) { (url ? ok : warn)(url ? "Service key set (delete account and reminders can work)" : "Service key set but Supabase URL is missing"); }
else info("SUPABASE_SERVICE_ROLE_KEY not set: the Delete account button and background reminders stay off.");

// background reminders
const push = ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "CRON_SECRET", "SUPABASE_SERVICE_ROLE_KEY"];
if (!push.slice(0, 3).some(has)) info("Background reminders are OFF.");
else {
  const miss = push.filter((k) => !has(k));
  miss.length ? err("Background reminders need: " + miss.join(", ")) : ok("Background reminders: all keys set");
  if (has("CRON_SECRET") && env.CRON_SECRET.length < 16) warn("CRON_SECRET is short. Use a long random string.");
  if (has("VAPID_SUBJECT") && !/^(mailto:|https:)/.test(env.VAPID_SUBJECT)) warn("VAPID_SUBJECT should start with mailto: or https:");
  info("Also add GitHub secrets SITE_URL and CRON_SECRET (same value as here).");
}

// AI
const ai = ["AI_BASE_URL", "AI_API_KEY", "AI_MODEL"];
if (!ai.some(has)) info("AI features are OFF (optional).");
else {
  const miss = ai.filter((k) => !has(k));
  miss.length ? err("AI needs all three: missing " + miss.join(", ")) : ok("AI configured (" + env.AI_MODEL + ")");
  if (has("AI_BASE_URL") && !/^https:\/\//.test(env.AI_BASE_URL)) err("AI_BASE_URL must start with https://");
  if (url) info("AI features are for logged-in learners only.");
}

if (env.NEXT_PUBLIC_GOOGLE_LOGIN === "1") (url ? ok : err)(url ? "Google button is on (enable the Google provider in Supabase)" : "Google login needs Supabase to be set up");
has("NEXT_PUBLIC_CONTACT_EMAIL") ? ok("Contact email set") : info("NEXT_PUBLIC_CONTACT_EMAIL empty: no Feedback link in the footer.");

console.log("\nEnglish Daily setup check\n" + out.join("\n") + "\n\n" + (bad ? bad + " problem(s) to fix." : "No blocking problems.") + "\n");
process.exit(bad ? 1 : 0);
