export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: true, app: "english-daily", time: new Date().toISOString() });
}
