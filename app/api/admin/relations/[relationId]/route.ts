import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { relationId: string } }
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const exists = await getPrisma().programCaseRelation.findUnique({
    where: {
      id: params.relationId
    }
  });
  if (!exists) {
    return fail("NOT_FOUND", "关联不存在", 404);
  }

  await getPrisma().programCaseRelation.delete({
    where: {
      id: params.relationId
    }
  });

  return ok({ success: true });
}
