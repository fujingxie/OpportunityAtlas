import { fail, ok } from "@/lib/server/api-response";
import { requireAdmin } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { parseProgramsFromText, saveUploadedDocx, type ImportSourceType } from "@/lib/server/import-docx";
import { serializeImportJob, serializeImportJobsWithQuality, serializeImportJobWithQuality } from "@/lib/server/imports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFileType(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "unknown";
}

function parseSourceType(value: FormDataEntryValue | null): ImportSourceType {
  if (value === null) {
    return "program";
  }
  return value === "program" || value === "case" || value === "mixed" || value === "unknown"
    ? value
    : "unknown";
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const jobs = await getPrisma().importJob.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      items: true
    }
  });

  return ok(await serializeImportJobsWithQuality(jobs));
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const sourceType = parseSourceType(formData.get("sourceType"));
  if (!(file instanceof File)) {
    return fail("VALIDATION_ERROR", "请上传 file 字段", 400);
  }

  const fileType = getFileType(file.name);
  if (fileType !== "docx") {
    const failedJob = await getPrisma().importJob.create({
      data: {
        fileName: file.name,
        fileType,
        fileSize: file.size,
        sourceType,
        status: "failed",
        progress: 0,
        errorMessage: "一期仅支持 DOCX 文件解析"
      },
      include: {
        items: true
      }
    });

    return fail("UNSUPPORTED_FILE_TYPE", "一期仅支持 DOCX 文件解析", 415, {
      job: serializeImportJob(failedJob)
    });
  }

  if (sourceType !== "program") {
    const failedJob = await getPrisma().importJob.create({
      data: {
        fileName: file.name,
        fileType: "docx",
        fileSize: file.size,
        sourceType,
        status: "failed",
        progress: 0,
        errorMessage: "当前版本仅实现活动文档解析；案例文档需要先确认字段模板。"
      },
      include: {
        items: true
      }
    });

    return fail("UNSUPPORTED_SOURCE_TYPE", "当前版本仅实现活动文档解析", 422, {
      job: serializeImportJob(failedJob)
    });
  }

  const saved = await saveUploadedDocx(file);
  const parsedItems = parseProgramsFromText(saved.text);
  const job = await getPrisma().importJob.create({
    data: {
      fileName: saved.fileName,
      fileType: "docx",
      fileSize: saved.fileSize,
      sourceType,
      status: "parsed",
      progress: 100,
      storagePath: saved.storagePath,
      errorMessage: saved.messages.length ? saved.messages.map((message) => message.message).join("; ") : null,
      items: {
        create: parsedItems.map((item) => ({
          itemType: "program",
          title: item.title,
          rawText: item.rawText,
          parsedData: item.parsedData,
          status: "draft"
        }))
      }
    },
    include: {
      items: true
    }
  });

  return ok(await serializeImportJobWithQuality(job), undefined, { status: 201 });
}
