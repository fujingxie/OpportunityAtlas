import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeCase } from "@/lib/server/serializers";
import { casePatchSchema, readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { caseId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = casePatchSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "案例字段格式不正确", 400, parsed.error.flatten());
  }

  const exists = await getPrisma().studentCase.findUnique({ where: { id: params.caseId } });
  if (!exists) {
    return fail("NOT_FOUND", "案例不存在", 404);
  }

  const { activityExperience, ...data } = parsed.data;
  const studentCase = await getPrisma().$transaction(async (tx) => {
    await tx.studentCase.update({
      where: { id: params.caseId },
      data
    });

    if (activityExperience) {
      await tx.caseActivity.deleteMany({ where: { caseId: params.caseId } });
      await tx.caseActivity.createMany({
        data: activityExperience.map((activity, index) => ({
          ...activity,
          caseId: params.caseId,
          order: index
        }))
      });
    }

    return tx.studentCase.findUniqueOrThrow({
      where: { id: params.caseId },
      include: { activities: true }
    });
  });

  return ok(serializeCase(studentCase));
}

export async function DELETE(_request: Request, { params }: { params: { caseId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const exists = await getPrisma().studentCase.findUnique({ where: { id: params.caseId } });
  if (!exists) {
    return fail("NOT_FOUND", "案例不存在", 404);
  }

  const studentCase = await getPrisma().studentCase.update({
    where: { id: params.caseId },
    data: {
      status: "archived"
    },
    include: {
      activities: true
    }
  });

  return ok(serializeCase(studentCase));
}
