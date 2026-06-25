import type { ImportJob, ImportItem } from "@prisma/client";

export function serializeImportJob(job: ImportJob & { items?: ImportItem[] }) {
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
    items: job.items?.map(serializeImportItem)
  };
}

export function serializeImportItem(item: ImportItem) {
  return {
    id: item.id,
    jobId: item.jobId,
    itemType: item.itemType,
    title: item.title,
    rawText: item.rawText,
    parsedData: item.parsedData,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}
