import { randomUUID } from "crypto";
import { listPrograms } from "@/lib/server/catalog";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { parsePagination } from "@/lib/server/pagination";
import { serializeProgram } from "@/lib/server/serializers";
import { programInputSchema, readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);
  const result = await listPrograms(
    {
      q: searchParams.get("q") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      subject: searchParams.get("subject") ?? undefined,
      grade: searchParams.get("grade") ?? undefined,
      format: searchParams.get("format") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      costType: searchParams.get("costType") ?? undefined
    },
    pagination,
    { includeAllStatuses: true }
  );

  return ok(result.items, {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: result.total
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = programInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "活动字段不完整或格式不正确", 400, parsed.error.flatten());
  }

  const data = parsed.data;
  const program = await getPrisma().program.create({
    data: {
      ...data,
      id: `p-${randomUUID()}`,
      officialUrl: data.officialUrl || null
    }
  });

  return ok(serializeProgram(program), undefined, { status: 201 });
}
