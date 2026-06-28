import type { ImportItem } from "@prisma/client";
import type {
  ImportDuplicateProgram,
  ImportQualityIssue,
  ImportQualitySummary,
  Program,
  RecordStatus
} from "@/lib/types";
import { normalizeText } from "@/lib/utils";
import { programInputSchema } from "@/lib/server/validation";

export type ExistingProgramReference =
  | string
  | {
      id: string;
      name: string;
      status: string;
    };

export type ProgramImportQualityContext = {
  existingProgramsByName: Map<string, ImportDuplicateProgram[]>;
  currentJobNameCounts: Map<string, number>;
};

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function isMissingText(value: unknown) {
  const text = asString(value);
  return !text || text === "待补充" || text === "未填写";
}

function normalizeName(value: unknown) {
  return normalizeText(asString(value)).replace(/\s+/g, " ");
}

function pushIssue(
  issues: ImportQualityIssue[],
  field: string,
  severity: ImportQualityIssue["severity"],
  message: string
) {
  issues.push({ field, severity, message });
}

function hasValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildProgramImportQualityContext(
  items: ImportItem[],
  existingPrograms: ExistingProgramReference[]
): ProgramImportQualityContext {
  const currentJobNameCounts = new Map<string, number>();
  const existingProgramsByName = new Map<string, ImportDuplicateProgram[]>();

  items.forEach((item) => {
    if (item.itemType !== "program" || item.status !== "draft") {
      return;
    }
    const name = normalizeName(asRecord(item.parsedData).name);
    if (!name) {
      return;
    }
    currentJobNameCounts.set(name, (currentJobNameCounts.get(name) ?? 0) + 1);
  });

  existingPrograms.forEach((program) => {
    const reference =
      typeof program === "string"
        ? { id: "", name: program, status: "published" as RecordStatus }
        : { id: program.id, name: program.name, status: program.status as RecordStatus };
    const normalized = normalizeName(reference.name);
    if (!normalized) {
      return;
    }
    existingProgramsByName.set(normalized, [
      ...(existingProgramsByName.get(normalized) ?? []),
      reference
    ]);
  });

  return { existingProgramsByName, currentJobNameCounts };
}

export function evaluateProgramImportQuality(
  value: unknown,
  context?: ProgramImportQualityContext
): ImportQualitySummary {
  const draft = asRecord(value);
  const issues: ImportQualityIssue[] = [];
  const name = asString(draft.name);
  const normalizedName = normalizeName(name);
  const officialUrl = asString(draft.officialUrl);
  const duplicatePrograms = normalizedName
    ? context?.existingProgramsByName.get(normalizedName) ?? []
    : [];

  if (!name || name === "待补充" || /^未命名活动/.test(name)) {
    pushIssue(issues, "name", "error", "缺少可发布的活动名称");
  }
  if (normalizedName && (context?.currentJobNameCounts.get(normalizedName) ?? 0) > 1) {
    pushIssue(issues, "name", "error", "同一导入任务内存在重复活动名称");
  }
  if (duplicatePrograms.length) {
    pushIssue(issues, "name", "warning", "活动库已存在同名活动，发布前建议确认是否重复");
  }
  if (officialUrl && officialUrl !== "待补充" && !hasValidUrl(officialUrl)) {
    pushIssue(issues, "officialUrl", "error", "官网链接格式不正确，需要 http 或 https URL");
  }

  const schemaResult = programInputSchema.safeParse(draft);
  if (!schemaResult.success) {
    const fields = Object.keys(schemaResult.error.flatten().fieldErrors);
    fields.forEach((field) => {
      pushIssue(issues, field, "error", `${field} 字段格式不符合活动资料要求`);
    });
  }

  const requiredWarnings: Array<[keyof Program, string]> = [
    ["organization", "主办方缺失或待补充"],
    ["description", "活动简介缺失或待补充"],
    ["gradeRange", "适合年级缺失或待补充"],
    ["subjectArea", "学科方向缺失或待补充"],
    ["location", "地点缺失或待补充"],
    ["costText", "费用信息缺失或待补充"],
    ["applicationEndDate", "报名截止时间缺失"],
    ["programStartDate", "活动开始时间缺失"],
    ["applicationMethod", "报名方式缺失"],
    ["requirements", "申请条件缺失"]
  ];

  requiredWarnings.forEach(([field, message]) => {
    if (isMissingText(draft[field])) {
      pushIssue(issues, field, "warning", message);
    }
  });

  if (asStringArray(draft.requiredMaterials).length === 0) {
    pushIssue(issues, "requiredMaterials", "warning", "申请材料缺失");
  }
  if (asStringArray(draft.highlights).length === 0) {
    pushIssue(issues, "highlights", "warning", "特色亮点缺失");
  }
  if (asStringArray(draft.coreTopics).length === 0) {
    pushIssue(issues, "coreTopics", "warning", "核心主题缺失");
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errorCount * 25 - warningCount * 6));

  return {
    level: errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "ok",
    score,
    issues,
    duplicatePrograms: duplicatePrograms.filter((program) => Boolean(program.id))
  };
}
