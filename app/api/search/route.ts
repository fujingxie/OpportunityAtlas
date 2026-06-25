import { listCases, listPrograms } from "@/lib/server/catalog";
import { ok } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const pagination = {
    page: 1,
    pageSize: 8,
    sortOrder: "desc" as const
  };
  const [programs, cases] = await Promise.all([
    listPrograms({ q }, pagination),
    listCases({ q }, pagination)
  ]);

  return ok({
    programs: programs.items,
    cases: cases.items,
    total: programs.total + cases.total
  });
}
