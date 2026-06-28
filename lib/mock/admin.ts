import type { ImportJob } from "@/lib/types";

export const mockImportJobs: ImportJob[] = [
  {
    id: "job-activity-doc",
    fileName: "活动.docx",
    fileType: "docx",
    fileSize: 486000,
    sourceType: "program",
    status: "parsed",
    progress: 100,
    createdAt: "2026-06-24T09:30:00Z"
  },
  {
    id: "job-case-seed",
    fileName: "案例路径样例.xlsx",
    fileType: "xlsx",
    fileSize: 128000,
    sourceType: "case",
    status: "reviewing",
    progress: 72,
    createdAt: "2026-06-24T10:12:00Z"
  },
  {
    id: "job-legacy-pdf",
    fileName: "旧版活动资料.pdf",
    fileType: "pdf",
    fileSize: 2190000,
    sourceType: "mixed",
    status: "failed",
    progress: 38,
    createdAt: "2026-06-23T16:02:00Z",
    errorMessage: "PDF 中存在扫描页，需要后端 OCR 流程补充。"
  }
];

export const mockReviewRecords = [
  {
    id: "review-001",
    targetType: "program",
    title: "IOAI 国际人工智能奥林匹克竞赛",
    status: "pending",
    submittedAt: "2026-06-24T11:20:00Z",
    reviewerNote: "官网时间字段需二次核验。"
  },
  {
    id: "review-002",
    targetType: "case",
    title: "C-203｜Public Health 方向切换",
    status: "approved",
    submittedAt: "2026-06-24T10:40:00Z",
    reviewerNote: "已确认匿名化字段。"
  },
  {
    id: "review-003",
    targetType: "program",
    title: "CMU Pre-College Programs",
    status: "published",
    submittedAt: "2026-06-23T18:11:00Z",
    reviewerNote: "已发布。"
  }
];

export const mockTags = [
  { id: "tag-research", name: "Research Program", group: "program_type", enabled: true },
  { id: "tag-summer", name: "Summer School", group: "program_type", enabled: true },
  { id: "tag-competition", name: "Competition", group: "program_type", enabled: true },
  { id: "tag-stem", name: "STEM", group: "subject", enabled: true },
  { id: "tag-humanities", name: "人文社科", group: "subject", enabled: true },
  { id: "tag-business", name: "商科/经济", group: "subject", enabled: true },
  { id: "tag-art", name: "艺术", group: "subject", enabled: true },
  { id: "tag-grade-g9", name: "G9", group: "grade", enabled: true },
  { id: "tag-grade-g10", name: "G10", group: "grade", enabled: true },
  { id: "tag-grade-g11", name: "G11", group: "grade", enabled: true },
  { id: "tag-grade-g12", name: "G12", group: "grade", enabled: true },
  { id: "tag-major-engineering", name: "Engineering", group: "major", enabled: true },
  { id: "tag-major-data-science", name: "Data Science", group: "major", enabled: true },
  { id: "tag-major-econ", name: "Econ", group: "major", enabled: true },
  { id: "tag-major-humanities", name: "Humanities", group: "major", enabled: true },
  { id: "tag-location-online", name: "线上", group: "location", enabled: true },
  { id: "tag-location-us", name: "美国", group: "location", enabled: true },
  { id: "tag-location-global", name: "全球", group: "location", enabled: true },
  { id: "tag-online", name: "online", group: "format", enabled: true },
  { id: "tag-offline", name: "offline", group: "format", enabled: true },
  { id: "tag-hybrid", name: "hybrid", group: "format", enabled: true }
];
