import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { serializeImportJobWithQuality } from "@/lib/server/imports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { jobId: string } }) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const job = await getPrisma().importJob.findUnique({
    where: {
      id: params.jobId
    },
    include: {
      items: true
    }
  });

  if (!job) {
    return fail("NOT_FOUND", "导入任务不存在", 404);
  }

  return ok(await serializeImportJobWithQuality(job));
}
