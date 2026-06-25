-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "officialUrl" TEXT,
    "applicationStartDate" TEXT,
    "applicationEndDate" TEXT,
    "programStartDate" TEXT,
    "programEndDate" TEXT,
    "duration" TEXT,
    "gradeRange" TEXT NOT NULL,
    "subjectArea" TEXT NOT NULL,
    "requirements" TEXT,
    "location" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "costText" TEXT,
    "scholarshipText" TEXT,
    "description" TEXT NOT NULL,
    "coreTopics" TEXT[],
    "highlights" TEXT[],
    "applicationMethod" TEXT,
    "requiredMaterials" TEXT[],
    "capacityLimit" TEXT,
    "tags" TEXT[],
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "completeness" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCase" (
    "id" TEXT NOT NULL,
    "anonymousCode" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "gpaRange" TEXT NOT NULL,
    "academicSummary" TEXT,
    "intendedMajor" TEXT NOT NULL,
    "resultSummary" TEXT NOT NULL,
    "resultTier" TEXT,
    "personalSummary" TEXT,
    "consultantReview" TEXT,
    "tags" TEXT[],
    "status" TEXT NOT NULL,
    "completeness" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseActivity" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "programId" TEXT,
    "programName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCaseRelation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "reasons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramCaseRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "sourceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "storagePath" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportItem" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawText" TEXT,
    "parsedData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRecord" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCase_anonymousCode_key" ON "StudentCase"("anonymousCode");

-- CreateIndex
CREATE INDEX "CaseActivity_caseId_idx" ON "CaseActivity"("caseId");

-- CreateIndex
CREATE INDEX "CaseActivity_programId_idx" ON "CaseActivity"("programId");

-- CreateIndex
CREATE INDEX "ProgramCaseRelation_caseId_idx" ON "ProgramCaseRelation"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCaseRelation_programId_caseId_relationType_key" ON "ProgramCaseRelation"("programId", "caseId", "relationType");

-- CreateIndex
CREATE INDEX "ImportItem_jobId_idx" ON "ImportItem"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_group_key" ON "Tag"("name", "group");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseActivity" ADD CONSTRAINT "CaseActivity_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "StudentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseActivity" ADD CONSTRAINT "CaseActivity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCaseRelation" ADD CONSTRAINT "ProgramCaseRelation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCaseRelation" ADD CONSTRAINT "ProgramCaseRelation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "StudentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportItem" ADD CONSTRAINT "ImportItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

