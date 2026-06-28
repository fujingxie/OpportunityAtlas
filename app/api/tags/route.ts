import { ok } from "@/lib/server/api-response";
import { getPrisma } from "@/lib/server/db";
import { serializeTag } from "@/lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const groups = new Set(["program_type", "subject", "grade", "major", "location", "format"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") ?? undefined;

  const tags = await getPrisma().tag.findMany({
    where: {
      enabled: true,
      ...(group && groups.has(group) ? { group } : {})
    },
    orderBy: [{ group: "asc" }, { name: "asc" }]
  });

  return ok(tags.map(serializeTag));
}
