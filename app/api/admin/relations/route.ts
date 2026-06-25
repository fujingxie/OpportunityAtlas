import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { readJson, relationInputSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = relationInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "关联字段格式不正确", 400, parsed.error.flatten());
  }

  const relation = await getPrisma().programCaseRelation.create({
    data: parsed.data
  });

  return ok(
    {
      ...relation,
      createdAt: relation.createdAt.toISOString()
    },
    undefined,
    { status: 201 }
  );
}
