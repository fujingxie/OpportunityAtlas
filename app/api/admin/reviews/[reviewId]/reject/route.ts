import { fail } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { reviewId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  return fail("REVIEW_DISABLED", `审核记录 ${params.reviewId} 不再支持退回动作`, 410);
}
