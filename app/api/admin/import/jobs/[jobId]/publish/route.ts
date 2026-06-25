import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeImportJob } from "@/lib/server/imports";
import { toProgramCreateInput } from "@/lib/server/program-drafts";

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

  try {
    const updated = await getPrisma().$transaction(async (tx) => {
      for (const item of job.items) {
        if (item.itemType !== "program") {
          continue;
        }
        await tx.program.create({
          data: {
            ...toProgramCreateInput(item.parsedData),
            status: "published"
          }
        });
        await tx.importItem.update({
          where: { id: item.id },
          data: { status: "published" }
        });
      }

      return tx.importJob.update({
        where: { id: params.jobId },
        data: {
          status: "published",
          progress: 100
        },
        include: { items: true }
      });
    });

    return ok(serializeImportJob(updated));
  } catch (error) {
    return fail("PUBLISH_FAILED", "导入发布失败，请检查预览项字段", 400, {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
