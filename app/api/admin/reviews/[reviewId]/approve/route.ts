import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { serializeReview, updateReviewAction } from "@/lib/server/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { reviewId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  try {
    return ok(serializeReview(await updateReviewAction(params.reviewId, "approved", auth.user.id)));
  } catch {
    return fail("NOT_FOUND", "审核记录不存在", 404);
  }
}
