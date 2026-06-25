import type {
  CaseActivity,
  Program as DbProgram,
  StudentCase as DbStudentCase,
  Tag as DbTag,
  User
} from "@prisma/client";
import type { Program, ProgramFormat, ProgramType, RecordStatus, StudentCase } from "@/lib/types";

export type DbCaseWithActivities = DbStudentCase & {
  activities: CaseActivity[];
};

export function serializeProgram(program: DbProgram): Program {
  return {
    id: program.id,
    name: program.name,
    type: program.type as ProgramType,
    organization: program.organization,
    officialUrl: program.officialUrl ?? undefined,
    applicationStartDate: program.applicationStartDate ?? undefined,
    applicationEndDate: program.applicationEndDate ?? undefined,
    programStartDate: program.programStartDate ?? undefined,
    programEndDate: program.programEndDate ?? undefined,
    duration: program.duration ?? undefined,
    gradeRange: program.gradeRange,
    subjectArea: program.subjectArea,
    requirements: program.requirements ?? undefined,
    location: program.location,
    format: program.format as ProgramFormat,
    costText: program.costText ?? undefined,
    scholarshipText: program.scholarshipText ?? undefined,
    description: program.description,
    coreTopics: program.coreTopics,
    highlights: program.highlights,
    applicationMethod: program.applicationMethod ?? undefined,
    requiredMaterials: program.requiredMaterials,
    capacityLimit: program.capacityLimit ?? undefined,
    tags: program.tags,
    status: program.status as RecordStatus,
    source: program.source as Program["source"],
    completeness: program.completeness,
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString()
  };
}

export function serializeCase(studentCase: DbCaseWithActivities): StudentCase {
  const activities = [...studentCase.activities].sort((a, b) => a.order - b.order);

  return {
    id: studentCase.id,
    anonymousCode: studentCase.anonymousCode,
    grade: studentCase.grade as StudentCase["grade"],
    schoolType: studentCase.schoolType as StudentCase["schoolType"],
    gpaRange: studentCase.gpaRange,
    academicSummary: studentCase.academicSummary ?? undefined,
    activityExperience: activities.map((activity) => ({
      programId: activity.programId ?? undefined,
      programName: activity.programName,
      type: activity.type,
      stage: activity.stage,
      description: activity.description ?? undefined
    })),
    intendedMajor: studentCase.intendedMajor,
    resultSummary: studentCase.resultSummary,
    resultTier: studentCase.resultTier ?? undefined,
    personalSummary: studentCase.personalSummary ?? undefined,
    consultantReview: studentCase.consultantReview ?? undefined,
    tags: studentCase.tags,
    status: studentCase.status as RecordStatus,
    completeness: studentCase.completeness,
    createdAt: studentCase.createdAt.toISOString(),
    updatedAt: studentCase.updatedAt.toISOString()
  };
}

export function serializeUser(user: Pick<User, "id" | "email" | "name" | "role">) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export function serializeTag(tag: DbTag) {
  return {
    id: tag.id,
    name: tag.name,
    group: tag.group,
    enabled: tag.enabled,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString()
  };
}
