import { listCases } from "@/lib/server/catalog";
import { ok } from "@/lib/server/api-response";
import { parsePagination } from "@/lib/server/pagination";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);
  const result = await listCases(
    {
      q: searchParams.get("q") ?? undefined,
      grade: searchParams.get("grade") ?? undefined,
      schoolType: searchParams.get("schoolType") ?? undefined,
      gpaRange: searchParams.get("gpaRange") ?? undefined,
      curriculum: searchParams.get("curriculum") ?? undefined,
      standardizedScore: searchParams.get("standardizedScore") ?? undefined,
      languageScore: searchParams.get("languageScore") ?? undefined,
      competition: searchParams.get("competition") ?? undefined,
      summerSchool: searchParams.get("summerSchool") ?? undefined,
      research: searchParams.get("research") ?? undefined,
      applicationRegion: searchParams.get("applicationRegion") ?? undefined,
      intendedMajor: searchParams.get("intendedMajor") ?? undefined,
      activityType: searchParams.get("activityType") ?? undefined,
      resultTier: searchParams.get("resultTier") ?? undefined
    },
    pagination
  );

  return ok(result.items, {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: result.total
  });
}
