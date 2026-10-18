import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

// Deletes the signed-in user's cloud data and account. Needs SUPABASE_SERVICE_ROLE_KEY (server only).
export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) return Response.json({ error: "Account deletion is not configured on the server." }, { status: 501 });
  const token = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
  if (!token) return Response.json({ error: "Not signed in." }, { status: 401 });
  const admin = createClient(url, svc, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "Invalid session." }, { status: 401 });
  const id = data.user.id;
  await admin.from("leaderboard").delete().eq("user_id", id);
  await admin.from("progress").delete().eq("user_id", id);
  const { error: e2 } = await admin.auth.admin.deleteUser(id);
  if (e2) return Response.json({ error: "Could not delete the account." }, { status: 500 });
  return Response.json({ ok: true });
}
