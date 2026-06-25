import { getPrisma } from "@/lib/server/db";

export async function updateReviewAction(
  reviewId: string,
  action: "approved" | "rejected" | "published",
  reviewerId: string
) {
  return getPrisma().$transaction(async (tx) => {
    const review = await tx.reviewRecord.update({
      where: { id: reviewId },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewerId
      }
    });

    if (action === "published" && review.targetId) {
      if (review.targetType === "program") {
        await tx.program.update({
          where: { id: review.targetId },
          data: { status: "published" }
        });
      }

      if (review.targetType === "case") {
        await tx.studentCase.update({
          where: { id: review.targetId },
          data: { status: "published" }
        });
      }
    }

    return review;
  });
}

export function serializeReview(review: Awaited<ReturnType<typeof updateReviewAction>>) {
  return {
    ...review,
    submittedAt: review.submittedAt.toISOString(),
    reviewedAt: review.reviewedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString()
  };
}
