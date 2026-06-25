import { fail } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { jobId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  return fail("REVIEW_DISABLED", `导入任务 ${params.jobId} 不再需要提交审核`, 410);
}
