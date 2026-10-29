import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// true when the page was opened from an email confirmation link (checked before the client removes the URL hash)
export const startedFromConfirm = typeof window !== "undefined" && /type=(signup|email_change|invite)/.test(window.location.hash);
export const supabase = url && key ? createClient(url, key) : null;

// Authorization header for API calls that need a logged-in user.
export async function authHeader() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  return data.session ? { Authorization: "Bearer " + data.session.access_token } : {};
}
