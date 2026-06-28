import { z } from "zod";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeImportJobWithQuality } from "@/lib/server/imports";
import { toProgramMergeUpdateInput } from "@/lib/server/program-drafts";
import { readJson } from "@/lib/server/validation";
import { normalizeText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mergeSchema = z.object({
  programId: z.string().min(1).optional(),
  strategy: z.enum(["fill_missing", "overwrite"]).default("fill_missing")
});

function normalizedName(value: unknown) {
  return typeof value === "string" ? normalizeText(value).replace(/\s+/g, " ") : "";
}

function parsedProgramName(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }
  const record = value as Record<string, unknown>;
  return typeof record.name === "string" ? record.name.trim() : "";
}

export async function POST(
  request: Request,
  { params }: { params: { jobId: string; itemId: string } }
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = mergeSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "合并参数格式不正确", 400, parsed.error.flatten());
  }

  const item = await getPrisma().importItem.findFirst({
    where: {
      id: params.itemId,
      jobId: params.jobId
    }
  });
  if (!item) {
    return fail("NOT_FOUND", "导入预览项不存在", 404);
  }
  if (item.itemType !== "program") {
    return fail("UNSUPPORTED_ITEM_TYPE", "当前仅支持合并活动预览项", 422);
  }
  if (item.status !== "draft") {
    return fail("INVALID_STATUS", "只有 draft 状态的预览项可以合并", 409);
  }

  const targetProgram = parsed.data.programId
    ? await getPrisma().program.findUnique({ where: { id: parsed.data.programId } })
    : (await getPrisma().program.findMany()).find(
        (program) => normalizedName(program.name) === normalizedName(parsedProgramName(item.parsedData))
      );
  if (!targetProgram) {
    return fail("NOT_FOUND", "未找到可合并的已有活动", 404);
  }

  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.program.update({
        where: {
          id: targetProgram.id
        },
        data: toProgramMergeUpdateInput(targetProgram, item.parsedData, parsed.data.strategy)
      });
      await tx.importItem.update({
        where: {
          id: params.itemId
        },
        data: {
          status: "merged"
        }
      });
    });
  } catch (mergeError) {
    return fail("MERGE_FAILED", "合并失败，请检查预览项字段", 400, {
      message: mergeError instanceof Error ? mergeError.message : "Unknown error"
    });
  }

  const updatedJob = await getPrisma().importJob.findUnique({
    where: {
      id: params.jobId
    },
    include: {
      items: true
    }
  });
  if (!updatedJob) {
    return fail("NOT_FOUND", "导入任务不存在", 404);
  }

  const serializedJob = await serializeImportJobWithQuality(updatedJob);
  const updatedItem = serializedJob.items?.find((jobItem) => jobItem.id === params.itemId);
  if (!updatedItem) {
    return fail("NOT_FOUND", "导入预览项不存在", 404);
  }

  return ok({
    item: updatedItem,
    programId: targetProgram.id
  });
}
