import { randomUUID } from "crypto";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeTag } from "@/lib/server/serializers";
import { readJson, tagInputSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const tags = await getPrisma().tag.findMany({
    orderBy: [{ group: "asc" }, { name: "asc" }]
  });

  return ok(tags.map(serializeTag));
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = tagInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "标签字段格式不正确", 400, parsed.error.flatten());
  }

  const tag = await getPrisma().tag.create({
    data: {
      id: `tag-${randomUUID()}`,
      ...parsed.data
    }
  });

  return ok(serializeTag(tag), undefined, { status: 201 });
}
