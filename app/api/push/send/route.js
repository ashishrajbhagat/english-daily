import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parts = (tz, opts) => {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).formatToParts(new Date());
  return (t) => p.find((x) => x.type === t).value;
};
const dayStr = (tz) => { const g = parts(tz, { weekday: "short", month: "short", day: "2-digit", year: "numeric" }); return g("weekday") + " " + g("month") + " " + g("day") + " " + g("year"); };
const minutes = (tz) => { const g = parts(tz, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); return +g("hour") * 60 + +g("minute"); };

// Called every ~15 minutes by a scheduler (see .github/workflows/reminders.yml).
export async function POST(req) {
  const { CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return Response.json({ error: "Not configured" }, { status: 501 });
  webpush.setVapidDetails(VAPID_SUBJECT || "mailto:support@your-domain.example", NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const db = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: subs } = await db.from("push_subs").select("*");
  let sent = 0;
  for (const s of subs || []) {
    try {
      const [h, m] = String(s.time).split(":").map(Number);
      const diff = minutes(s.tz) - (h * 60 + m);
      if (diff < 0 || diff > 29) continue;          // only within 30 minutes after the chosen time
      const today = dayStr(s.tz);
      if (s.last_sent === today) continue;           // already handled today
      const { data: pr } = await db.from("progress").select("data").eq("user_id", s.user_id).maybeSingle();
      const practised = pr && pr.data && pr.data.day === today;
      if (!practised) {
        await webpush.sendNotification(s.sub, JSON.stringify({ title: "English Daily", body: "Time for your daily English practice! 🦉" }));
        sent++;
      }
      await db.from("push_subs").update({ last_sent: today }).eq("endpoint", s.endpoint);
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await db.from("push_subs").delete().eq("endpoint", s.endpoint);
    }
  }
  return Response.json({ ok: true, sent });
}
