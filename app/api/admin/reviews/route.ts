import { ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const reviews = await getPrisma().reviewRecord.findMany({
    orderBy: {
      submittedAt: "desc"
    }
  });

  return ok(
    reviews.map((review) => ({
      ...review,
      submittedAt: review.submittedAt.toISOString(),
      reviewedAt: review.reviewedAt?.toISOString() ?? null,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    }))
  );
}
