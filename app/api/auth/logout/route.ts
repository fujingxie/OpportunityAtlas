import { clearSessionCookie, destroyCurrentSession } from "@/lib/server/auth";
import { ok } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await destroyCurrentSession();
  const response = ok({ success: true });
  clearSessionCookie(response);

  return response;
}
