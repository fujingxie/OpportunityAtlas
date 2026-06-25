import { listPrograms } from "@/lib/server/catalog";
import { ok } from "@/lib/server/api-response";
import { parsePagination } from "@/lib/server/pagination";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
    pagination
  );

  return ok(result.items, {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: result.total
  });
}
