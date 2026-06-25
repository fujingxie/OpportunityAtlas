import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeProgram } from "@/lib/server/serializers";
import { programPatchSchema, readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { programId: string } }
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = programPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "活动字段格式不正确", 400, parsed.error.flatten());
  }

  const exists = await getPrisma().program.findUnique({ where: { id: params.programId } });
  if (!exists) {
    return fail("NOT_FOUND", "活动不存在", 404);
  }

  const program = await getPrisma().program.update({
    where: { id: params.programId },
    data: {
      ...parsed.data,
      officialUrl: parsed.data.officialUrl === "" ? null : parsed.data.officialUrl
    }
  });

  return ok(serializeProgram(program));
}

export async function DELETE(
  _request: Request,
  { params }: { params: { programId: string } }
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const exists = await getPrisma().program.findUnique({ where: { id: params.programId } });
  if (!exists) {
    return fail("NOT_FOUND", "活动不存在", 404);
  }

  const program = await getPrisma().program.update({
    where: { id: params.programId },
    data: {
      status: "archived"
    }
  });

  return ok(serializeProgram(program));
}
