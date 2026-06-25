import { randomUUID } from "crypto";
import { listCases } from "@/lib/server/catalog";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { parsePagination } from "@/lib/server/pagination";
import { serializeCase } from "@/lib/server/serializers";
import { caseInputSchema, readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);
  const result = await listCases(
    {
      q: searchParams.get("q") ?? undefined,
      grade: searchParams.get("grade") ?? undefined,
      schoolType: searchParams.get("schoolType") ?? undefined,
      gpaRange: searchParams.get("gpaRange") ?? undefined,
      intendedMajor: searchParams.get("intendedMajor") ?? undefined,
      activityType: searchParams.get("activityType") ?? undefined,
      resultTier: searchParams.get("resultTier") ?? undefined
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

  const parsed = caseInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "案例字段不完整或格式不正确", 400, parsed.error.flatten());
  }

  const { activityExperience, ...data } = parsed.data;
  const studentCase = await getPrisma().studentCase.create({
    data: {
      ...data,
      id: `c-${randomUUID()}`,
      activities: {
        create: activityExperience.map((activity, index) => ({
          ...activity,
          order: index
        }))
      }
    },
    include: {
      activities: true
    }
  });

  return ok(serializeCase(studentCase), undefined, { status: 201 });
}
