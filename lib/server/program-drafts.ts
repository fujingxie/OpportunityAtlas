import { randomUUID } from "crypto";
import type { Prisma, Program as DbProgram } from "@prisma/client";
import { programInputSchema } from "@/lib/server/validation";

export function toProgramCreateInput(value: unknown): Prisma.ProgramCreateInput {
  const parsed = programInputSchema.parse(value);

  return {
    ...parsed,
    id: `p-import-${randomUUID()}`,
    officialUrl: parsed.officialUrl || null
  };
}

function isMissingText(value: string | null | undefined) {
  return !value?.trim() || value.trim() === "待补充" || value.trim() === "未填写";
}

function mergeText(
  existing: string | null | undefined,
  incoming: string | undefined,
  strategy: ProgramMergeStrategy
) {
  if (strategy === "overwrite") {
    return isMissingText(incoming) ? existing ?? null : incoming;
  }
  return isMissingText(existing) && !isMissingText(incoming) ? incoming : existing ?? null;
}

function mergeRequiredText(existing: string, incoming: string, strategy: ProgramMergeStrategy) {
  return mergeText(existing, incoming, strategy) ?? existing;
}

function mergeArray(existing: string[], incoming: string[], strategy: ProgramMergeStrategy) {
  if (strategy === "overwrite" && incoming.length) {
    return incoming;
  }
  return Array.from(new Set([...existing, ...incoming].map((item) => item.trim()).filter(Boolean)));
}

export type ProgramMergeStrategy = "fill_missing" | "overwrite";

export function toProgramMergeUpdateInput(
  existing: DbProgram,
  value: unknown,
  strategy: ProgramMergeStrategy = "fill_missing"
): Prisma.ProgramUpdateInput {
  const parsed = programInputSchema.parse(value);

  return {
    name: mergeRequiredText(existing.name, parsed.name, strategy),
    type:
      strategy === "overwrite" || (existing.type === "Other" && parsed.type !== "Other")
        ? parsed.type
        : existing.type,
    organization: mergeRequiredText(existing.organization, parsed.organization, strategy),
    officialUrl: mergeText(existing.officialUrl, parsed.officialUrl || undefined, strategy),
    applicationStartDate: mergeText(
      existing.applicationStartDate,
      parsed.applicationStartDate,
      strategy
    ),
    applicationEndDate: mergeText(existing.applicationEndDate, parsed.applicationEndDate, strategy),
    programStartDate: mergeText(existing.programStartDate, parsed.programStartDate, strategy),
    programEndDate: mergeText(existing.programEndDate, parsed.programEndDate, strategy),
    duration: mergeText(existing.duration, parsed.duration, strategy),
    gradeRange: mergeRequiredText(existing.gradeRange, parsed.gradeRange, strategy),
    subjectArea: mergeRequiredText(existing.subjectArea, parsed.subjectArea, strategy),
    requirements: mergeText(existing.requirements, parsed.requirements, strategy),
    location: mergeRequiredText(existing.location, parsed.location, strategy),
    format: strategy === "overwrite" ? parsed.format : existing.format,
    costText: mergeText(existing.costText, parsed.costText, strategy),
    scholarshipText: mergeText(existing.scholarshipText, parsed.scholarshipText, strategy),
    description: mergeRequiredText(existing.description, parsed.description, strategy),
    coreTopics: {
      set: mergeArray(existing.coreTopics, parsed.coreTopics, strategy)
    },
    highlights: {
      set: mergeArray(existing.highlights, parsed.highlights, strategy)
    },
    applicationMethod: mergeText(existing.applicationMethod, parsed.applicationMethod, strategy),
    requiredMaterials: {
      set: mergeArray(existing.requiredMaterials, parsed.requiredMaterials, strategy)
    },
    capacityLimit: mergeText(existing.capacityLimit, parsed.capacityLimit, strategy),
    tags: {
      set: mergeArray(existing.tags, parsed.tags, strategy)
    },
    completeness: Math.max(existing.completeness, parsed.completeness)
  };
}
