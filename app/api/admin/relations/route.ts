import { Prisma } from "@prisma/client";
import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { parsePagination } from "@/lib/server/pagination";
import { readJson, relationInputSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const programId = searchParams.get("programId") ?? undefined;
  const caseId = searchParams.get("caseId") ?? undefined;

  const records = await getPrisma().programCaseRelation.findMany({
    where: {
      ...(programId ? { programId } : {}),
      ...(caseId ? { caseId } : {})
    },
    include: {
      program: true,
      studentCase: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const mapped = records.map((relation) => ({
    id: relation.id,
    programId: relation.programId,
    programName: relation.program.name,
    caseId: relation.caseId,
    anonymousCode: relation.studentCase.anonymousCode,
    relationType: relation.relationType,
    reasons: relation.reasons,
    createdAt: relation.createdAt.toISOString()
  }));
  const filtered = q
    ? mapped.filter((relation) =>
        [
          relation.programName,
          relation.anonymousCode,
          relation.relationType,
          ...relation.reasons
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : mapped;
  const start = (pagination.page - 1) * pagination.pageSize;

  return ok(filtered.slice(start, start + pagination.pageSize), {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: filtered.length
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const parsed = relationInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "关联字段格式不正确", 400, parsed.error.flatten());
  }

  let relation;
  try {
    relation = await getPrisma().programCaseRelation.create({
      data: parsed.data
    });
  } catch (createError) {
    if (createError instanceof Prisma.PrismaClientKnownRequestError) {
      if (createError.code === "P2002") {
        return fail("DUPLICATE_RELATION", "该活动与案例已存在相同类型的关联", 409);
      }
      if (createError.code === "P2003") {
        return fail("NOT_FOUND", "活动或案例不存在", 404);
      }
    }
    throw createError;
  }

  return ok(
    {
      ...relation,
      createdAt: relation.createdAt.toISOString()
    },
    undefined,
    { status: 201 }
  );
}
