import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeImportItem } from "@/lib/server/imports";
import { readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const importItemPatchSchema = z.object({
  title: z.string().min(1).optional(),
  parsedData: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "pending_review", "published", "rejected"]).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { jobId: string; itemId: string } }
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = importItemPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "导入预览项字段格式不正确", 400, parsed.error.flatten());
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

  const updated = await getPrisma().importItem.update({
    where: {
      id: params.itemId
    },
    data: {
      title: parsed.data.title,
      status: parsed.data.status,
      parsedData: parsed.data.parsedData as Prisma.InputJsonValue | undefined
    }
  });

  return ok(serializeImportItem(updated));
}
