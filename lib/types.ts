export type UserRole = "viewer" | "admin";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ProgramType =
  | "Competition"
  | "Summer School"
  | "Research Program"
  | "Other";

export type ProgramFormat = "online" | "offline" | "hybrid";

export type RecordStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export type Program = {
  id: string;
  name: string;
  type: ProgramType;
  organization: string;
  officialUrl?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  programStartDate?: string;
  programEndDate?: string;
  duration?: string;
  gradeRange: string;
  subjectArea: string;
  requirements?: string;
  location: string;
  format: ProgramFormat;
  costText?: string;
  scholarshipText?: string;
  description: string;
  coreTopics: string[];
  highlights: string[];
  applicationMethod?: string;
  requiredMaterials?: string[];
  capacityLimit?: string;
  tags: string[];
  status: RecordStatus;
  source: "document_import" | "manual";
  completeness: number;
  createdAt: string;
  updatedAt: string;
};

export type StudentCase = {
  id: string;
  anonymousCode: string;
  grade: "G9" | "G10" | "G11" | "G12";
  schoolType: "international" | "public" | "other";
  gpaRange: string;
  academicSummary?: string;
  activityExperience: Array<{
    programId?: string;
    programName: string;
    type: string;
    stage: string;
    description?: string;
  }>;
  intendedMajor: string;
  resultSummary: string;
  resultTier?: string;
  personalSummary?: string;
  consultantReview?: string;
  tags: string[];
  status: RecordStatus;
  completeness: number;
  createdAt: string;
  updatedAt: string;
};

export type ProgramCaseRelation = {
  id: string;
  programId: string;
  caseId: string;
  relationType:
    | "participated"
    | "similar_subject"
    | "similar_path"
    | "manual_related";
  reasons?: string[];
  createdAt: string;
};

export type ImportQualitySeverity = "error" | "warning";

export type ImportQualityIssue = {
  field: string;
  severity: ImportQualitySeverity;
  message: string;
};

export type ImportDuplicateProgram = {
  id: string;
  name: string;
  status: RecordStatus;
};

export type ImportQualitySummary = {
  level: "ok" | ImportQualitySeverity;
  score: number;
  issues: ImportQualityIssue[];
  duplicatePrograms?: ImportDuplicateProgram[];
};

export type Tag = {
  id: string;
  name: string;
  group: "program_type" | "subject" | "grade" | "major" | "location" | "format";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ImportJob = {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx" | "xlsx" | "csv";
  fileSize: number;
  sourceType: "program" | "case" | "mixed" | "unknown";
  status: "pending" | "parsing" | "parsed" | "reviewing" | "published" | "failed";
  progress: number;
  createdAt: string;
  errorMessage?: string;
};

export type PlannerIntent =
  | "balanced"
  | "challenge"
  | "support"
  | "cost_effective"
  | "case_reference";

export type PlannerProfile = {
  grade: "G9" | "G10" | "G11" | "G12";
  curriculum: string;
  targetRegion: string;
  subjectArea: string;
  standardizedScore?: string;
  languageScore?: string;
  gpa?: string;
  competitions?: string;
  summerSchools?: string;
  research?: string;
  budget: "all" | "low" | "medium" | "high";
  format: "all" | ProgramFormat;
  intent: PlannerIntent;
  notes?: string;
};

export type PlannerProgramRecommendation = {
  program: Program;
  score: number;
  stage: string;
  priority: "core" | "supplement" | "watch";
  fitSummary: string;
  reasons: string[];
  cautions: string[];
  actionItems: string[];
  evidenceTags: string[];
  relatedCaseIds: string[];
};

export type PlannerCaseRecommendation = {
  studentCase: StudentCase;
  score: number;
  pathSummary: string;
  reasons: string[];
  evidenceTags: string[];
};

export type PlannerTimelineItem = {
  phase: string;
  title: string;
  description: string;
  programIds: string[];
  caseIds: string[];
};

export type PlannerRecommendationResponse = {
  profileSummary: string;
  gaps: string[];
  programs: PlannerProgramRecommendation[];
  cases: PlannerCaseRecommendation[];
  timeline: PlannerTimelineItem[];
  explanation: string;
  riskWarnings: string[];
  nextAdjustments: string[];
  generatedBy: "internal_rules";
};
