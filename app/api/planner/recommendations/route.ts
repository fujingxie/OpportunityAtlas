import { fail, ok } from "@/lib/server/api-response";
import {
  buildPlannerRecommendationsFromCatalog,
  plannerProfileSchema
} from "@/lib/server/planner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = plannerProfileSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "路径规划信息不完整", 400, {
      fields: parsed.error.flatten().fieldErrors
    });
  }

  const result = await buildPlannerRecommendationsFromCatalog(parsed.data);
  return ok(result);
}
