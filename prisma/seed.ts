import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { mockTags, mockImportJobs } from "../lib/mock/admin";
import { mockCases } from "../lib/mock/cases";
import { mockPrograms } from "../lib/mock/programs";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
});

function asDate(value: string) {
  return new Date(value);
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.$transaction([
    prisma.programCaseRelation.deleteMany(),
    prisma.caseActivity.deleteMany(),
    prisma.importItem.deleteMany(),
    prisma.importJob.deleteMany(),
    prisma.reviewRecord.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.program.deleteMany(),
    prisma.studentCase.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany()
  ]);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Opportunity Atlas Admin",
      passwordHash,
      role: "admin"
    }
  });

  await prisma.program.createMany({
    data: mockPrograms.map((program) => ({
      id: program.id,
      name: program.name,
      type: program.type,
      organization: program.organization,
      officialUrl: program.officialUrl,
      applicationStartDate: program.applicationStartDate,
      applicationEndDate: program.applicationEndDate,
      programStartDate: program.programStartDate,
      programEndDate: program.programEndDate,
      duration: program.duration,
      gradeRange: program.gradeRange,
      subjectArea: program.subjectArea,
      requirements: program.requirements,
      location: program.location,
      format: program.format,
      costText: program.costText,
      scholarshipText: program.scholarshipText,
      description: program.description,
      coreTopics: program.coreTopics,
      highlights: program.highlights,
      applicationMethod: program.applicationMethod,
      requiredMaterials: program.requiredMaterials ?? [],
      capacityLimit: program.capacityLimit,
      tags: program.tags,
      status: program.status,
      source: program.source,
      completeness: program.completeness,
      createdAt: asDate(program.createdAt),
      updatedAt: asDate(program.updatedAt)
    }))
  });

  await prisma.studentCase.createMany({
    data: mockCases.map((studentCase) => ({
      id: studentCase.id,
      anonymousCode: studentCase.anonymousCode,
      grade: studentCase.grade,
      schoolType: studentCase.schoolType,
      gpaRange: studentCase.gpaRange,
      academicSummary: studentCase.academicSummary,
      intendedMajor: studentCase.intendedMajor,
      resultSummary: studentCase.resultSummary,
      resultTier: studentCase.resultTier,
      personalSummary: studentCase.personalSummary,
      consultantReview: studentCase.consultantReview,
      tags: studentCase.tags,
      status: studentCase.status,
      completeness: studentCase.completeness,
      createdAt: asDate(studentCase.createdAt),
      updatedAt: asDate(studentCase.updatedAt)
    }))
  });

  for (const studentCase of mockCases) {
    await prisma.caseActivity.createMany({
      data: studentCase.activityExperience.map((activity, index) => ({
        caseId: studentCase.id,
        programId: activity.programId,
        programName: activity.programName,
        type: activity.type,
        stage: activity.stage,
        description: activity.description,
        order: index
      }))
    });

    const relationRows = studentCase.activityExperience
      .filter((activity) => activity.programId)
      .map((activity) => ({
        programId: activity.programId!,
        caseId: studentCase.id,
        relationType: "participated",
        reasons: ["案例活动路径中明确参与"]
      }));

    if (relationRows.length) {
      await prisma.programCaseRelation.createMany({
        data: relationRows,
        skipDuplicates: true
      });
    }
  }

  await prisma.importJob.createMany({
    data: mockImportJobs.map((job) => ({
      id: job.id,
      fileName: job.fileName,
      fileType: job.fileType,
      fileSize: job.fileSize,
      sourceType: job.sourceType,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      createdAt: asDate(job.createdAt)
    }))
  });

  await prisma.tag.createMany({
    data: mockTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      group: tag.group,
      enabled: tag.enabled
    }))
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[seed] failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
