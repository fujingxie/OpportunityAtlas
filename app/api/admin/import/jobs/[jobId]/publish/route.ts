import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { buildProgramImportQualityContext, evaluateProgramImportQuality } from "@/lib/server/import-quality";
import { serializeImportJobWithQuality } from "@/lib/server/imports";
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
  if (job.sourceType !== "program") {
    return fail("UNSUPPORTED_SOURCE_TYPE", "当前版本仅支持发布活动导入任务", 422);
  }

  const publishableItems = job.items.filter(
    (item) => item.itemType === "program" && item.status === "draft"
  );
  const existingPrograms = await getPrisma().program.findMany({
    select: {
      name: true
    }
  });
  const qualityContext = buildProgramImportQualityContext(
    job.items,
    existingPrograms.map((program) => program.name)
  );
  const blockedItems = publishableItems
    .map((item) => ({
      id: item.id,
      title: item.title,
      quality: evaluateProgramImportQuality(item.parsedData, qualityContext)
    }))
    .filter((item) => item.quality.issues.some((issue) => issue.severity === "error"));

  if (blockedItems.length) {
    return fail("QUALITY_CHECK_FAILED", "存在质量检查错误，请修复后再发布", 422, {
      items: blockedItems
    });
  }

  try {
    const updated = await getPrisma().$transaction(async (tx) => {
      for (const item of publishableItems) {
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

    return ok(await serializeImportJobWithQuality(updated));
  } catch (error) {
    return fail("PUBLISH_FAILED", "导入发布失败，请检查预览项字段", 400, {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
