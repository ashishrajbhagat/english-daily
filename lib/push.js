// Background (push) reminders: browser subscription stored in Supabase; a scheduled job sends the notification.
import { supabase } from "./supabase";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const key = (s) => {
  const p = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
export const pushSupported = () => typeof window !== "undefined" && !!supabase && !!KEY && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const ready = () => Promise.race([
  navigator.serviceWorker.ready,
  new Promise((_, rej) => setTimeout(() => rej(new Error("Background reminders work on the deployed (production) site.")), 4000)),
]);

export async function enablePush(user, time) {
  const reg = await ready();
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notifications are blocked in your browser settings.");
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(KEY) }));
  const j = sub.toJSON();
  const { error } = await supabase.from("push_subs").upsert({
    endpoint: j.endpoint, user_id: user.id, sub: j, time, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("Could not save the reminder.");
}

export async function disablePush() {
  const reg = await ready();
  const sub = await reg.pushManager.getSubscription();
  if (sub) { await supabase.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
}

export async function updatePushTime(time) {
  try {
    const reg = await ready();
    const sub = await reg.pushManager.getSubscription();
    if (sub) await supabase.from("push_subs").update({ time }).eq("endpoint", sub.endpoint);
  } catch (e) {}
}
