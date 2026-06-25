import { getProgram, getRelatedCasesForProgram } from "@/lib/server/catalog";
import { fail, ok } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { programId: string } }
) {
  const program = await getProgram(params.programId);
  if (!program) {
    return fail("NOT_FOUND", "活动不存在或未发布", 404);
  }

  return ok(await getRelatedCasesForProgram(params.programId));
}
