import type { ImportJob, ImportItem } from "@prisma/client";
import { buildProgramImportQualityContext, evaluateProgramImportQuality } from "@/lib/server/import-quality";
import { getPrisma } from "@/lib/server/db";

type ImportQualityContext = ReturnType<typeof buildProgramImportQualityContext>;

async function getExistingProgramReferences() {
  return getPrisma().program.findMany({
    select: {
      id: true,
      name: true,
      status: true
    }
  });
}

export async function serializeImportJobsWithQuality(
  jobs: Array<ImportJob & { items?: ImportItem[] }>
) {
  const existingPrograms = await getExistingProgramReferences();
  return jobs.map((job) =>
    serializeImportJob(
      job,
      buildProgramImportQualityContext(job.items ?? [], existingPrograms)
    )
  );
}

export async function serializeImportJobWithQuality(job: ImportJob & { items?: ImportItem[] }) {
  const existingPrograms = await getExistingProgramReferences();
  return serializeImportJob(
    job,
    buildProgramImportQualityContext(job.items ?? [], existingPrograms)
  );
}

export function serializeImportJob(
  job: ImportJob & { items?: ImportItem[] },
  qualityContext?: ImportQualityContext
) {
  return {
    id: job.id,
    fileName: job.fileName,
    fileType: job.fileType,
    fileSize: job.fileSize,
    sourceType: job.sourceType,
    status: job.status,
    progress: job.progress,
    storagePath: job.storagePath,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    items: job.items?.map((item) => serializeImportItem(item, qualityContext))
  };
}

export function serializeImportItem(item: ImportItem, qualityContext?: ImportQualityContext) {
  return {
    id: item.id,
    jobId: item.jobId,
    itemType: item.itemType,
    title: item.title,
    rawText: item.rawText,
    parsedData: item.parsedData,
    status: item.status,
    quality:
      item.itemType === "program"
        ? evaluateProgramImportQuality(item.parsedData, qualityContext)
        : undefined,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}
