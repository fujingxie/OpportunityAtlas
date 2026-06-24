import { mockPrograms } from "@/lib/mock/programs";
import { mockCases } from "@/lib/mock/cases";
import type { Program, StudentCase } from "@/lib/types";
import { includesAny, normalizeText } from "@/lib/utils";

export type ProgramFilters = {
  q?: string;
  type?: string;
  subject?: string;
  grade?: string;
  format?: string;
  costType?: string;
};

export type CaseFilters = {
  q?: string;
  grade?: string;
  schoolType?: string;
  gpaRange?: string;
  intendedMajor?: string;
  activityType?: string;
  resultTier?: string;
};

export function getProgramById(programId: string) {
  return mockPrograms.find((program) => program.id === programId);
}

export function getCaseById(caseId: string) {
  return mockCases.find((studentCase) => studentCase.id === caseId);
}

export function getRelatedCases(program: Program) {
  const direct = mockCases.filter((studentCase) =>
    studentCase.activityExperience.some((activity) => activity.programId === program.id)
  );

  if (direct.length >= 3) {
    return direct;
  }

  const subjectRelated = mockCases.filter((studentCase) => {
    if (direct.some((directCase) => directCase.id === studentCase.id)) {
      return false;
    }
    return studentCase.tags.some((tag) => program.tags.includes(tag));
  });

  return [...direct, ...subjectRelated].slice(0, 4);
}

export function getRelatedPrograms(studentCase: StudentCase) {
  return studentCase.activityExperience
    .map((activity) => (activity.programId ? getProgramById(activity.programId) : undefined))
    .filter((program): program is Program => Boolean(program));
}

export function filterPrograms(filters: ProgramFilters) {
  return mockPrograms.filter((program) => {
    const q = normalizeText(filters.q);
    if (q) {
      const haystack = [
        program.name,
        program.organization,
        program.description,
        program.subjectArea,
        program.location,
        ...program.highlights,
        ...program.tags
      ].join(" ");
      if (!normalizeText(haystack).includes(q)) {
        return false;
      }
    }

    if (filters.type && filters.type !== "all" && program.type !== filters.type) {
      return false;
    }

    if (
      filters.subject &&
      filters.subject !== "all" &&
      !includesAny(program.subjectArea, [filters.subject]) &&
      !program.tags.includes(filters.subject)
    ) {
      return false;
    }

    if (
      filters.grade &&
      filters.grade !== "all" &&
      !program.gradeRange.includes(filters.grade)
    ) {
      return false;
    }

    if (filters.format && filters.format !== "all" && program.format !== filters.format) {
      return false;
    }

    if (filters.costType === "free" && !includesAny(program.costText, ["免费", "承担"])) {
      return false;
    }

    if (filters.costType === "paid" && includesAny(program.costText, ["免费", "承担"])) {
      return false;
    }

    return true;
  });
}

export function filterCases(filters: CaseFilters) {
  return mockCases.filter((studentCase) => {
    const q = normalizeText(filters.q);
    if (q) {
      const haystack = [
        studentCase.anonymousCode,
        studentCase.academicSummary,
        studentCase.intendedMajor,
        studentCase.resultSummary,
        studentCase.personalSummary,
        ...studentCase.tags,
        ...studentCase.activityExperience.map((activity) => activity.programName)
      ].join(" ");
      if (!normalizeText(haystack).includes(q)) {
        return false;
      }
    }

    if (filters.grade && filters.grade !== "all" && studentCase.grade !== filters.grade) {
      return false;
    }

    if (
      filters.schoolType &&
      filters.schoolType !== "all" &&
      studentCase.schoolType !== filters.schoolType
    ) {
      return false;
    }

    if (
      filters.gpaRange &&
      filters.gpaRange !== "all" &&
      studentCase.gpaRange !== filters.gpaRange
    ) {
      return false;
    }

    if (
      filters.intendedMajor &&
      filters.intendedMajor !== "all" &&
      !normalizeText(studentCase.intendedMajor).includes(normalizeText(filters.intendedMajor))
    ) {
      return false;
    }

    if (
      filters.activityType &&
      filters.activityType !== "all" &&
      !studentCase.activityExperience.some((activity) => activity.type === filters.activityType)
    ) {
      return false;
    }

    if (
      filters.resultTier &&
      filters.resultTier !== "all" &&
      studentCase.resultTier !== filters.resultTier
    ) {
      return false;
    }

    return true;
  });
}

