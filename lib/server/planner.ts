import { z } from "zod";
import type {
  PlannerCaseRecommendation,
  PlannerProfile,
  PlannerProgramRecommendation,
  PlannerRecommendationResponse,
  Program,
  StudentCase
} from "@/lib/types";
import { includesAny, normalizeText } from "@/lib/utils";

export const plannerProfileSchema = z.object({
  grade: z.enum(["G9", "G10", "G11", "G12"]),
  curriculum: z.string().trim().min(1),
  targetRegion: z.string().trim().min(1),
  subjectArea: z.string().trim().min(1),
  standardizedScore: z.string().trim().optional(),
  languageScore: z.string().trim().optional(),
  gpa: z.string().trim().optional(),
  competitions: z.string().trim().optional(),
  summerSchools: z.string().trim().optional(),
  research: z.string().trim().optional(),
  budget: z.enum(["all", "low", "medium", "high"]).default("all"),
  format: z.enum(["all", "online", "offline", "hybrid"]).default("all"),
  intent: z
    .enum(["balanced", "challenge", "support", "cost_effective", "case_reference"])
    .default("balanced"),
  notes: z.string().trim().optional()
});

const subjectAliases: Record<string, string[]> = {
  STEM: ["STEM", "理科", "数学", "物理", "化学", "生物", "工程", "计算机", "数据", "科研"],
  "商科/经济": ["商科", "经济", "金融", "商业", "创业", "管理"],
  人文社科: ["人文", "社科", "历史", "政治", "国际关系", "社会", "写作"],
  艺术传媒: ["艺术", "传媒", "设计", "媒体", "电影", "音乐"]
};

const regionAliases: Record<string, string[]> = {
  美国: ["美国", "US", "USA", "United States", "美本"],
  英国: ["英国", "UK", "United Kingdom", "英本", "牛津", "剑桥"],
  香港: ["香港", "中国香港", "Hong Kong"],
  加拿大: ["加拿大", "Canada", "滑铁卢"],
  澳大利亚: ["澳大利亚", "澳洲", "Australia"]
};

function searchTextForProgram(program: Program) {
  return [
    program.name,
    program.type,
    program.organization,
    program.description,
    program.gradeRange,
    program.subjectArea,
    program.requirements,
    program.location,
    program.format,
    program.costText,
    program.scholarshipText,
    ...program.coreTopics,
    ...program.highlights,
    ...program.tags
  ].join(" ");
}

function searchTextForCase(studentCase: StudentCase) {
  return [
    studentCase.anonymousCode,
    studentCase.grade,
    studentCase.schoolType,
    studentCase.gpaRange,
    studentCase.academicSummary,
    studentCase.intendedMajor,
    studentCase.resultSummary,
    studentCase.resultTier,
    studentCase.personalSummary,
    studentCase.consultantReview,
    ...studentCase.tags,
    ...studentCase.activityExperience.flatMap((activity) => [
      activity.programName,
      activity.type,
      activity.stage,
      activity.description ?? ""
    ])
  ].join(" ");
}

function matchAny(text: string, values: string[]) {
  return values.some((value) => normalizeText(text).includes(normalizeText(value)));
}

function subjectMatches(text: string, subjectArea: string) {
  return matchAny(text, subjectAliases[subjectArea] ?? [subjectArea]);
}

function regionMatches(text: string, targetRegion: string) {
  return matchAny(text, regionAliases[targetRegion] ?? [targetRegion]);
}

function hasAnyExperience(value: string | undefined) {
  const text = normalizeText(value);
  return Boolean(text && !["无", "none", "暂无", "没有"].includes(text));
}

function inferGaps(profile: PlannerProfile) {
  const gaps: string[] = [];
  if (!hasAnyExperience(profile.competitions)) {
    gaps.push("竞赛证明不足");
  }
  if (!hasAnyExperience(profile.research)) {
    gaps.push("科研或项目产出不足");
  }
  if (!hasAnyExperience(profile.summerSchools) && ["G9", "G10", "G11"].includes(profile.grade)) {
    gaps.push("夏校或课堂探索经历不足");
  }
  if (!profile.languageScore) {
    gaps.push("语言成绩信息待补充");
  }
  return gaps.length ? gaps : ["当前背景信息较完整，建议补充更高质量产出"];
}

function budgetMatches(program: Program, budget: PlannerProfile["budget"]) {
  const costText = program.costText ?? "";
  if (budget === "all" || budget === "high") {
    return true;
  }
  if (budget === "low") {
    return includesAny(costText, ["免费", "无", "资助", "承担"]);
  }
  return !includesAny(costText, ["$10k", "$20k", "高昂"]);
}

function stageForProgram(program: Program, profile: PlannerProfile) {
  if (program.type === "Competition") {
    return ["G9", "G10"].includes(profile.grade) ? "现在 - 3 个月" : "尽快补强";
  }
  if (program.type === "Research Program") {
    return ["G11", "G12"].includes(profile.grade) ? "3 - 6 个月" : "6 - 12 个月";
  }
  if (program.type === "Summer School") {
    return "暑期窗口";
  }
  return "灵活安排";
}

function pushReason(reasons: string[], evidenceTags: string[], reason: string, tag: string) {
  reasons.push(reason);
  evidenceTags.push(tag);
}

function scoreProgram(program: Program, profile: PlannerProfile, gaps: string[]) {
  const text = searchTextForProgram(program);
  const reasons: string[] = [];
  const evidenceTags: string[] = [];
  let score = 20;

  if (program.gradeRange.includes(profile.grade)) {
    score += 18;
    pushReason(reasons, evidenceTags, `适合年级覆盖 ${profile.grade}`, profile.grade);
  }
  if (subjectMatches(text, profile.subjectArea)) {
    score += 20;
    pushReason(reasons, evidenceTags, `与 ${profile.subjectArea} 方向相关`, profile.subjectArea);
  }
  if (regionMatches(text, profile.targetRegion)) {
    score += 8;
    pushReason(reasons, evidenceTags, `资料中包含 ${profile.targetRegion} 相关线索`, profile.targetRegion);
  }
  if (profile.format !== "all" && program.format === profile.format) {
    score += 8;
    pushReason(reasons, evidenceTags, `符合 ${formatLabel(profile.format)} 形式偏好`, formatLabel(profile.format));
  }
  if (budgetMatches(program, profile.budget)) {
    score += profile.budget === "low" ? 10 : 4;
    if (profile.budget === "low") {
      pushReason(reasons, evidenceTags, "更贴近低成本或资助偏好", "低成本");
    }
  } else if (profile.budget === "low") {
    score -= 12;
  }
  if (gaps.includes("竞赛证明不足") && program.type === "Competition") {
    score += 14;
    pushReason(reasons, evidenceTags, "可补充外部竞赛证明", "竞赛补强");
  }
  if (gaps.includes("科研或项目产出不足") && program.type === "Research Program") {
    score += 14;
    pushReason(reasons, evidenceTags, "可补充科研或项目产出", "科研补强");
  }
  if (gaps.includes("夏校或课堂探索经历不足") && program.type === "Summer School") {
    score += 10;
    pushReason(reasons, evidenceTags, "适合作为课堂探索或暑期经历", "夏校探索");
  }
  if (profile.intent === "challenge" && ["Competition", "Research Program"].includes(program.type)) {
    score += 8;
  }
  if (profile.intent === "cost_effective" && budgetMatches(program, "low")) {
    score += 8;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.length ? reasons : ["与当前画像存在基础相关性"],
    evidenceTags: Array.from(new Set(evidenceTags))
  };
}

function scoreCase(studentCase: StudentCase, profile: PlannerProfile, gaps: string[]) {
  const text = searchTextForCase(studentCase);
  const reasons: string[] = [];
  const evidenceTags: string[] = [];
  let score = 18;

  if (studentCase.grade === profile.grade) {
    score += 14;
    pushReason(reasons, evidenceTags, `同为 ${profile.grade} 阶段`, profile.grade);
  }
  if (matchAny(text, [profile.curriculum])) {
    score += 12;
    pushReason(reasons, evidenceTags, `包含 ${profile.curriculum} 体系信息`, profile.curriculum);
  }
  if (subjectMatches(text, profile.subjectArea)) {
    score += 18;
    pushReason(reasons, evidenceTags, `申请或活动路径与 ${profile.subjectArea} 相关`, profile.subjectArea);
  }
  if (regionMatches(text, profile.targetRegion)) {
    score += 12;
    pushReason(reasons, evidenceTags, `结果或申请地区涉及 ${profile.targetRegion}`, profile.targetRegion);
  }
  if (
    gaps.includes("竞赛证明不足") &&
    studentCase.activityExperience.some((activity) => activity.type === "Competition")
  ) {
    score += 8;
    pushReason(reasons, evidenceTags, "案例中有竞赛经历可参考", "竞赛案例");
  }
  if (
    gaps.includes("科研或项目产出不足") &&
    studentCase.activityExperience.some((activity) => activity.type === "Research Program")
  ) {
    score += 8;
    pushReason(reasons, evidenceTags, "案例中有科研项目可参考", "科研案例");
  }
  if (profile.intent === "challenge" && studentCase.resultTier === "顶尖") {
    score += 10;
  }
  if (profile.intent === "support" && ["普通", "中等"].includes(studentCase.resultTier ?? "")) {
    score += 8;
  }
  if (profile.intent === "case_reference") {
    score += 6;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.length ? reasons : ["可作为路径对照案例"],
    evidenceTags: Array.from(new Set(evidenceTags))
  };
}

function formatLabel(format: PlannerProfile["format"]) {
  const labels = {
    all: "不限形式",
    online: "线上",
    offline: "线下",
    hybrid: "混合"
  };
  return labels[format];
}

function intentLabel(intent: PlannerProfile["intent"]) {
  const labels = {
    balanced: "均衡规划",
    challenge: "冲刺挑战",
    support: "稳妥补强",
    cost_effective: "低成本优先",
    case_reference: "案例参考优先"
  };
  return labels[intent];
}

function buildProfileSummary(profile: PlannerProfile, gaps: string[]) {
  return `${profile.grade} / ${profile.curriculum} / ${profile.subjectArea} / 目标${profile.targetRegion} / ${intentLabel(profile.intent)}。当前主要关注：${gaps.slice(0, 3).join("、")}。`;
}

function buildExplanation(
  profile: PlannerProfile,
  programs: PlannerProgramRecommendation[],
  cases: PlannerCaseRecommendation[],
  gaps: string[]
) {
  const topProgram = programs[0]?.program.name ?? "当前活动库中的相关项目";
  const topCase = cases[0]?.studentCase.anonymousCode ?? "相近案例";
  return `建议先围绕 ${profile.subjectArea} 建立可证明的活动主线。系统优先选择 ${topProgram}，因为它与年级、方向或履历缺口更接近；同时参考 ${topCase} 等案例，帮助你判断活动组合如何服务申请叙事。当前不做外部联网搜索，时间、费用和官网仍以活动库维护数据为准。重点补强项：${gaps.slice(0, 3).join("、")}。`;
}

function buildTimeline(
  profile: PlannerProfile,
  programs: PlannerProgramRecommendation[],
  cases: PlannerCaseRecommendation[]
) {
  const competitionPrograms = programs
    .filter((item) => item.program.type === "Competition")
    .slice(0, 2)
    .map((item) => item.program.id);
  const researchPrograms = programs
    .filter((item) => item.program.type === "Research Program")
    .slice(0, 2)
    .map((item) => item.program.id);
  const summerPrograms = programs
    .filter((item) => item.program.type === "Summer School")
    .slice(0, 2)
    .map((item) => item.program.id);
  const caseIds = cases.slice(0, 3).map((item) => item.studentCase.id);

  return [
    {
      phase: "现在",
      title: "建立可量化证明",
      description: competitionPrograms.length
        ? "优先选择竞赛或标准化活动，形成外部评价。"
        : "先选择门槛合适的项目，补齐基础活动记录。",
      programIds: competitionPrograms,
      caseIds: caseIds.slice(0, 1)
    },
    {
      phase: "3-6 个月",
      title: "补充项目产出",
      description: researchPrograms.length
        ? "通过科研或项目制活动形成论文、展示或作品。"
        : "围绕目标方向沉淀一个可展示成果。",
      programIds: researchPrograms,
      caseIds: caseIds.slice(0, 2)
    },
    {
      phase: "暑期窗口",
      title: "强化方向确认",
      description: summerPrograms.length
        ? "用夏校或课程型项目验证专业兴趣。"
        : "安排课程、志愿或线上项目补充申请叙事。",
      programIds: summerPrograms,
      caseIds: caseIds.slice(1, 3)
    },
    {
      phase: "申请前",
      title: "对照案例复盘",
      description: "回看相似案例的活动组合、申请方向和结果，整理个人主线。",
      programIds: programs.slice(0, 3).map((item) => item.program.id),
      caseIds
    }
  ];
}

function findRelatedCaseIds(program: Program, cases: PlannerCaseRecommendation[]) {
  const programText = searchTextForProgram(program);
  return cases
    .filter((item) => {
      const caseText = searchTextForCase(item.studentCase);
      return (
        item.studentCase.activityExperience.some(
          (activity) => activity.programId === program.id || activity.programName === program.name
        ) ||
        program.tags.some((tag) => normalizeText(caseText).includes(normalizeText(tag))) ||
        subjectMatches(caseText, program.subjectArea) ||
        program.tags.some((tag) => normalizeText(programText).includes(normalizeText(tag)))
      );
    })
    .slice(0, 3)
    .map((item) => item.studentCase.id);
}

export function buildPlannerRecommendations(
  profile: PlannerProfile,
  programs: Program[],
  studentCases: StudentCase[]
): PlannerRecommendationResponse {
  const gaps = inferGaps(profile);
  const caseRecommendations: PlannerCaseRecommendation[] = studentCases
    .map((studentCase) => ({
      studentCase,
      ...scoreCase(studentCase, profile, gaps)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  const programRecommendations: PlannerProgramRecommendation[] = programs
    .map((program) => {
      const scored = scoreProgram(program, profile, gaps);
      return {
        program,
        score: scored.score,
        stage: stageForProgram(program, profile),
        reasons: scored.reasons,
        evidenceTags: scored.evidenceTags,
        relatedCaseIds: []
      };
    })
    .filter((item) => item.score >= 28)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      relatedCaseIds: findRelatedCaseIds(item.program, caseRecommendations)
    }));

  return {
    profileSummary: buildProfileSummary(profile, gaps),
    gaps,
    programs: programRecommendations,
    cases: caseRecommendations,
    timeline: buildTimeline(profile, programRecommendations, caseRecommendations),
    explanation: buildExplanation(profile, programRecommendations, caseRecommendations, gaps),
    nextAdjustments: [
      "只看线上活动",
      "降低预算要求",
      "更偏竞赛证明",
      "更偏科研产出",
      "参考更稳妥案例"
    ],
    generatedBy: "internal_rules"
  };
}

export async function buildPlannerRecommendationsFromCatalog(profile: PlannerProfile) {
  const { listCases, listPrograms } = await import("@/lib/server/catalog");
  const [programResult, caseResult] = await Promise.all([
    listPrograms({}, { page: 1, pageSize: 300, sortBy: "updatedAt", sortOrder: "desc" }),
    listCases({}, { page: 1, pageSize: 300, sortBy: "updatedAt", sortOrder: "desc" })
  ]);

  return buildPlannerRecommendations(profile, programResult.items, caseResult.items);
}
