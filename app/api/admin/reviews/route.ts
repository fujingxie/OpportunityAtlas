import { fail } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  return fail("REVIEW_DISABLED", "数据管理不再需要审核流程", 410);
}
