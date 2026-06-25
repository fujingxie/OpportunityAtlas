import { getStudentCase } from "@/lib/server/catalog";
import { fail, ok } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { caseId: string } }) {
  const studentCase = await getStudentCase(params.caseId);
  if (!studentCase) {
    return fail("NOT_FOUND", "案例不存在或未发布", 404);
  }

  return ok(studentCase);
}
