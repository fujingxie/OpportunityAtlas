import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeTag } from "@/lib/server/serializers";
import { readJson, tagPatchSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { tagId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = tagPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "标签字段格式不正确", 400, parsed.error.flatten());
  }

  const exists = await getPrisma().tag.findUnique({ where: { id: params.tagId } });
  if (!exists) {
    return fail("NOT_FOUND", "标签不存在", 404);
  }

  const tag = await getPrisma().tag.update({
    where: { id: params.tagId },
    data: parsed.data
  });

  return ok(serializeTag(tag));
}

export async function DELETE(_request: Request, { params }: { params: { tagId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const exists = await getPrisma().tag.findUnique({ where: { id: params.tagId } });
  if (!exists) {
    return fail("NOT_FOUND", "标签不存在", 404);
  }

  const tag = await getPrisma().tag.update({
    where: { id: params.tagId },
    data: {
      enabled: false
    }
  });

  return ok(serializeTag(tag));
}
