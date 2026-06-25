import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const programInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Competition", "Summer School", "Research Program", "Other"]).default("Other"),
  organization: z.string().min(1).default("待补充"),
  officialUrl: z.string().url().optional().or(z.literal("")),
  applicationStartDate: z.string().optional(),
  applicationEndDate: z.string().optional(),
  programStartDate: z.string().optional(),
  programEndDate: z.string().optional(),
  duration: z.string().optional(),
  gradeRange: z.string().min(1).default("待补充"),
  subjectArea: z.string().min(1).default("综合"),
  requirements: z.string().optional(),
  location: z.string().min(1).default("待补充"),
  format: z.enum(["online", "offline", "hybrid"]).default("offline"),
  costText: z.string().optional(),
  scholarshipText: z.string().optional(),
  description: z.string().min(1).default("待补充"),
  coreTopics: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  applicationMethod: z.string().optional(),
  requiredMaterials: z.array(z.string()).default([]),
  capacityLimit: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "pending_review", "published", "rejected", "archived"]).default("draft"),
  source: z.enum(["document_import", "manual"]).default("manual"),
  completeness: z.number().int().min(0).max(100).default(60)
});

export const programPatchSchema = programInputSchema.partial();

export const activityInputSchema = z.object({
  programId: z.string().optional(),
  programName: z.string().min(1),
  type: z.string().min(1),
  stage: z.string().min(1),
  description: z.string().optional()
});

export const caseInputSchema = z.object({
  anonymousCode: z.string().min(1),
  grade: z.enum(["G9", "G10", "G11", "G12"]),
  schoolType: z.enum(["international", "public", "other"]),
  gpaRange: z.string().min(1),
  academicSummary: z.string().optional(),
  activityExperience: z.array(activityInputSchema).default([]),
  intendedMajor: z.string().min(1),
  resultSummary: z.string().min(1),
  resultTier: z.string().optional(),
  personalSummary: z.string().optional(),
  consultantReview: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "pending_review", "published", "rejected", "archived"]).default("draft"),
  completeness: z.number().int().min(0).max(100).default(60)
});

export const casePatchSchema = caseInputSchema.partial();

export const tagInputSchema = z.object({
  name: z.string().min(1),
  group: z.enum(["program_type", "subject", "grade", "major", "location", "format"]),
  enabled: z.boolean().default(true)
});

export const tagPatchSchema = tagInputSchema.partial();

export const relationInputSchema = z.object({
  programId: z.string().min(1),
  caseId: z.string().min(1),
  relationType: z
    .enum(["participated", "similar_subject", "similar_path", "manual_related"])
    .default("manual_related"),
  reasons: z.array(z.string()).default([])
});

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
