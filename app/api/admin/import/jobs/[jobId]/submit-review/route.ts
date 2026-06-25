import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeImportJob } from "@/lib/server/imports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { jobId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const job = await getPrisma().importJob.findUnique({
    where: { id: params.jobId },
    include: { items: true }
  });
  if (!job) {
    return fail("NOT_FOUND", "导入任务不存在", 404);
  }

  const updated = await getPrisma().$transaction(async (tx) => {
    await tx.importItem.updateMany({
      where: { jobId: params.jobId },
      data: { status: "pending_review" }
    });

    for (const item of job.items) {
      await tx.reviewRecord.create({
        data: {
          targetType: item.itemType,
          title: item.title,
          status: "pending",
          reviewerNote: "来自文档导入预览，等待人工审核。"
        }
      });
    }

    return tx.importJob.update({
      where: { id: params.jobId },
      data: {
        status: "reviewing"
      },
      include: { items: true }
    });
  });

  return ok(serializeImportJob(updated));
}
