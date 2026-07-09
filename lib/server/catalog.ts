import type { Program, StudentCase } from "@/lib/types";
import { includesAny, normalizeText } from "@/lib/utils";
import { getPrisma } from "@/lib/server/db";
import { paginate, type Pagination } from "@/lib/server/pagination";
import { serializeCase, serializeProgram } from "@/lib/server/serializers";

export type ProgramQuery = {
  q?: string;
  type?: string;
  subject?: string;
  grade?: string;
  format?: string;
  location?: string;
  costType?: string;
};

export type CaseQuery = {
  q?: string;
  grade?: string;
  schoolType?: string;
  gpaRange?: string;
  curriculum?: string;
  standardizedScore?: string;
  languageScore?: string;
  competition?: string;
  summerSchool?: string;
  research?: string;
  applicationRegion?: string;
  intendedMajor?: string;
  activityType?: string;
  resultTier?: string;
};

function isPublished(status: string) {
  return status === "published";
}

function filterProgram(program: Program, query: ProgramQuery) {
  const q = normalizeText(query.q);
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

  if (query.type && query.type !== "all" && program.type !== query.type) {
    return false;
  }

  if (
    query.subject &&
    query.subject !== "all" &&
    !includesAny(program.subjectArea, [query.subject]) &&
    !program.tags.includes(query.subject)
  ) {
    return false;
  }

  if (query.grade && query.grade !== "all" && !program.gradeRange.includes(query.grade)) {
    return false;
  }

  if (query.format && query.format !== "all" && program.format !== query.format) {
    return false;
  }

  if (
    query.location &&
    query.location !== "all" &&
    !normalizeText(program.location).includes(normalizeText(query.location))
  ) {
    return false;
  }

  if (query.costType === "free" && !includesAny(program.costText, ["免费", "承担"])) {
    return false;
  }

  if (query.costType === "paid" && includesAny(program.costText, ["免费", "承担"])) {
    return false;
  }

  return true;
}

function buildCaseSearchText(studentCase: StudentCase) {
  return [
    studentCase.anonymousCode,
    studentCase.gpaRange,
    studentCase.academicSummary,
    studentCase.intendedMajor,
    studentCase.resultSummary,
    studentCase.personalSummary,
    studentCase.consultantReview,
    ...studentCase.tags,
    ...studentCase.activityExperience.flatMap((activity) => [
      activity.programName,
      activity.description ?? ""
    ])
  ].join(" ");
}

function matchesCaseActivity(studentCase: StudentCase, type: string, value: string) {
  const normalizedValue = normalizeText(value);
  return studentCase.activityExperience.some((activity) => {
    if (activity.type !== type) {
      return false;
    }
    return normalizeText([activity.programName, activity.description].join(" ")).includes(
      normalizedValue
    );
  });
}

function matchesCaseRegion(studentCase: StudentCase, value: string) {
  const aliases: Record<string, string[]> = {
    英国: ["英国", "UK", "United Kingdom"],
    美国: ["美国", "US", "USA", "United States"],
    香港: ["香港", "中国香港", "Hong Kong"],
    澳大利亚: ["澳大利亚", "澳洲", "Australia"]
  };
  const searchable = normalizeText(buildCaseSearchText(studentCase));
  return (aliases[value] ?? [value]).some((alias) => searchable.includes(normalizeText(alias)));
}

function filterCase(studentCase: StudentCase, query: CaseQuery) {
  const q = normalizeText(query.q);
  const searchableProfile = buildCaseSearchText(studentCase);
  if (q) {
    if (!normalizeText(searchableProfile).includes(q)) {
      return false;
    }
  }

  if (query.grade && query.grade !== "all" && studentCase.grade !== query.grade) {
    return false;
  }

  if (
    query.schoolType &&
    query.schoolType !== "all" &&
    studentCase.schoolType !== query.schoolType
  ) {
    return false;
  }

  if (query.gpaRange && query.gpaRange !== "all" && studentCase.gpaRange !== query.gpaRange) {
    return false;
  }

  if (
    query.curriculum &&
    query.curriculum !== "all" &&
    !normalizeText(
      [studentCase.gpaRange, studentCase.academicSummary, ...studentCase.tags].join(" ")
    ).includes(normalizeText(query.curriculum))
  ) {
    return false;
  }

  if (
    query.standardizedScore &&
    !normalizeText(searchableProfile).includes(
      normalizeText(query.standardizedScore)
    )
  ) {
    return false;
  }

  if (
    query.languageScore &&
    !normalizeText(searchableProfile).includes(normalizeText(query.languageScore))
  ) {
    return false;
  }

  if (query.competition && !matchesCaseActivity(studentCase, "Competition", query.competition)) {
    return false;
  }

  if (
    query.summerSchool &&
    !matchesCaseActivity(studentCase, "Summer School", query.summerSchool)
  ) {
    return false;
  }

  if (query.research && !matchesCaseActivity(studentCase, "Research Program", query.research)) {
    return false;
  }

  if (query.applicationRegion && !matchesCaseRegion(studentCase, query.applicationRegion)) {
    return false;
  }

  if (
    query.intendedMajor &&
    query.intendedMajor !== "all" &&
    !normalizeText(studentCase.intendedMajor).includes(normalizeText(query.intendedMajor))
  ) {
    return false;
  }

  if (
    query.activityType &&
    query.activityType !== "all" &&
    !studentCase.activityExperience.some((activity) => activity.type === query.activityType)
  ) {
    return false;
  }

  if (
    query.resultTier &&
    query.resultTier !== "all" &&
    studentCase.resultTier !== query.resultTier
  ) {
    return false;
  }

  return true;
}

function sortPrograms(programs: Program[], pagination: Pagination) {
  const direction = pagination.sortOrder === "asc" ? 1 : -1;

  return [...programs].sort((left, right) => {
    if (pagination.sortBy === "updatedAt") {
      return (left.updatedAt.localeCompare(right.updatedAt) || left.name.localeCompare(right.name)) * direction;
    }
    if (pagination.sortBy === "completeness") {
      return (left.completeness - right.completeness || left.name.localeCompare(right.name)) * direction;
    }
    return left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}

function sortCases(cases: StudentCase[], pagination: Pagination) {
  const direction = pagination.sortOrder === "asc" ? 1 : -1;

  return [...cases].sort((left, right) => {
    if (pagination.sortBy === "updatedAt") {
      return (left.updatedAt.localeCompare(right.updatedAt) || left.anonymousCode.localeCompare(right.anonymousCode)) * direction;
    }
    if (pagination.sortBy === "completeness") {
      return (left.completeness - right.completeness || left.anonymousCode.localeCompare(right.anonymousCode)) * direction;
    }
    return left.anonymousCode.localeCompare(right.anonymousCode, "zh-Hans-CN");
  });
}

export async function listPrograms(
  query: ProgramQuery,
  pagination: Pagination,
  options: { includeAllStatuses?: boolean } = {}
): Promise<{ items: Program[]; total: number }> {
  const records = await getPrisma().program.findMany();
  const filtered = records
    .map(serializeProgram)
    .filter((program) => options.includeAllStatuses || isPublished(program.status))
    .filter((program) => filterProgram(program, query));
  const sorted = sortPrograms(filtered, pagination);

  return {
    items: paginate(sorted, pagination),
    total: filtered.length
  };
}

export async function getProgram(programId: string, options: { includeAllStatuses?: boolean } = {}) {
  const program = await getPrisma().program.findUnique({ where: { id: programId } });
  if (!program || (!options.includeAllStatuses && !isPublished(program.status))) {
    return null;
  }
  return serializeProgram(program);
}

export async function listCases(
  query: CaseQuery,
  pagination: Pagination,
  options: { includeAllStatuses?: boolean } = {}
): Promise<{ items: StudentCase[]; total: number }> {
  const records = await getPrisma().studentCase.findMany({
    include: {
      activities: true
    }
  });
  const filtered = records
    .map(serializeCase)
    .filter((studentCase) => options.includeAllStatuses || isPublished(studentCase.status))
    .filter((studentCase) => filterCase(studentCase, query));
  const sorted = sortCases(filtered, pagination);

  return {
    items: paginate(sorted, pagination),
    total: filtered.length
  };
}

export async function getStudentCase(
  caseId: string,
  options: { includeAllStatuses?: boolean } = {}
) {
  const studentCase = await getPrisma().studentCase.findUnique({
    where: { id: caseId },
    include: {
      activities: true
    }
  });
  if (!studentCase || (!options.includeAllStatuses && !isPublished(studentCase.status))) {
    return null;
  }
  return serializeCase(studentCase);
}

export async function getRelatedCasesForProgram(programId: string) {
  const program = await getProgram(programId);
  if (!program) {
    return [];
  }

  const relationCases = await getPrisma().programCaseRelation.findMany({
    where: {
      programId,
      studentCase: {
        status: "published"
      }
    },
    include: {
      studentCase: {
        include: {
          activities: true
        }
      }
    },
    take: 4
  });

  const direct = relationCases.map((relation) => serializeCase(relation.studentCase));
  if (direct.length >= 4) {
    return direct;
  }

  const fallback = await getPrisma().studentCase.findMany({
    where: {
      status: "published",
      id: {
        notIn: direct.map((studentCase) => studentCase.id)
      },
      tags: {
        hasSome: program.tags
      }
    },
    include: {
      activities: true
    },
    take: 4 - direct.length
  });

  return [...direct, ...fallback.map(serializeCase)];
}

export async function getRelatedProgramsForCase(caseId: string) {
  const activities = await getPrisma().caseActivity.findMany({
    where: {
      caseId,
      programId: {
        not: null
      },
      program: {
        status: "published"
      }
    },
    include: {
      program: true
    },
    orderBy: {
      order: "asc"
    }
  });

  const activityPrograms = activities
    .map((activity) => (activity.program ? serializeProgram(activity.program) : null))
    .filter((program): program is Program => Boolean(program));

  const relationPrograms = await getPrisma().programCaseRelation.findMany({
    where: {
      caseId,
      program: {
        status: "published"
      }
    },
    include: {
      program: true
    }
  });
  const programs = [
    ...activityPrograms,
    ...relationPrograms.map((relation) => serializeProgram(relation.program))
  ];
  const seen = new Set<string>();

  return programs.filter((program) => {
    if (seen.has(program.id)) {
      return false;
    }
    seen.add(program.id);
    return true;
  });
}
