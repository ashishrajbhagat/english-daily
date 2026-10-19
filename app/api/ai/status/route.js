import { aiEnabled } from "../../../../lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ enabled: aiEnabled() });
}
