import { z } from "zod";
import type {
  PlannerCaseRecommendation,
  PlannerProfile,
  PlannerProgramRecommendation,
  PlannerRecommendationResponse,
  PlannerSourceContext,
  Program,
  StudentCase
} from "@/lib/types";
import { buildPlannerAdvisorExplanation } from "@/lib/server/planner-explanation";
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
  notes: z.string().trim().optional(),
  sourceProgramId: z.string().trim().optional(),
  sourceCaseId: z.string().trim().optional(),
  sourceQuery: z.string().trim().optional()
});

type PlannerSourceOptions = {
  sourceProgram?: Program;
  sourceCase?: StudentCase;
  sourceQuery?: string;
};

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
  if (targetRegion === "不确定") {
    return false;
  }
  return matchAny(text, regionAliases[targetRegion] ?? [targetRegion]);
}

function hasAnyExperience(value: string | undefined) {
  const text = normalizeText(value);
  return Boolean(text && !["无", "none", "暂无", "没有"].includes(text));
}

function gradeNumber(grade: string) {
  const match = grade.match(/G(\d{1,2})/i);
  return match?.[1] ? Number(match[1]) : null;
}

function gradeFit(program: Program, profile: PlannerProfile) {
  const profileGrade = gradeNumber(profile.grade);
  const programGrades = Array.from(program.gradeRange.matchAll(/G(\d{1,2})/gi)).map((match) =>
    Number(match[1])
  );

  if (!profileGrade || programGrades.length === 0) {
    return program.gradeRange.includes(profile.grade) ? "exact" : "unknown";
  }
  if (programGrades.includes(profileGrade)) {
    return "exact";
  }
  if (programGrades.some((grade) => Math.abs(grade - profileGrade) === 1)) {
    return "near";
  }
  if (/及以下/.test(program.gradeRange) && profileGrade <= Math.max(...programGrades)) {
    return "exact";
  }
  return "mismatch";
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

function recommendationPriority(program: Program, gaps: string[]) {
  if (program.type === "Competition" && gaps.includes("竞赛证明不足")) {
    return "core" as const;
  }
  if (program.type === "Research Program" && gaps.includes("科研或项目产出不足")) {
    return "core" as const;
  }
  if (program.type === "Summer School" && gaps.includes("夏校或课堂探索经历不足")) {
    return "supplement" as const;
  }
  if (program.completeness < 70) {
    return "watch" as const;
  }
  return "supplement" as const;
}

function buildProgramFitSummary(program: Program, profile: PlannerProfile, gaps: string[]) {
  if (program.type === "Competition") {
    return gaps.includes("竞赛证明不足")
      ? "适合作为近期外部学术证明，先建立可量化成果。"
      : "适合作为学术能力补充，帮助申请材料形成更清晰证据。";
  }
  if (program.type === "Research Program") {
    return gaps.includes("科研或项目产出不足")
      ? "适合作为中期项目产出，补足论文、展示或研究叙事。"
      : "适合作为专业方向深化，强化已有活动主线。";
  }
  if (program.type === "Summer School") {
    return ["G9", "G10", "G11"].includes(profile.grade)
      ? "适合作为暑期方向确认，帮助判断专业兴趣和课堂适应度。"
      : "适合作为申请前补充经历，但需要注意时间窗口。";
  }
  return "适合作为补充活动，完善申请叙事中的空白环节。";
}

function buildProgramCautions(program: Program, profile: PlannerProfile) {
  const cautions: string[] = [];
  const fit = gradeFit(program, profile);
  if (fit === "near") {
    cautions.push("年级只做到相邻匹配，报名前需要核对官方适龄要求。");
  }
  if (fit === "mismatch") {
    cautions.push("年级匹配较弱，建议仅作为备选或后续阶段关注。");
  }
  if (profile.budget === "low" && !budgetMatches(program, "low")) {
    cautions.push("费用可能不符合低成本偏好，需要确认学费、报名费和交通成本。");
  }
  if (profile.format !== "all" && profile.format !== program.format) {
    cautions.push(`活动形式为${formatLabel(program.format)}，与当前偏好不完全一致。`);
  }
  if (!program.applicationEndDate || program.applicationEndDate === "待补充") {
    cautions.push("报名截止时间未完整维护，提交前需要核对官网。");
  }
  if (program.completeness < 80) {
    cautions.push("活动资料完整度偏低，建议先补官网、时间、费用等关键字段。");
  }
  return cautions.length ? cautions : ["无明显风险，仍建议以官网和顾问判断复核。"];
}

function buildProgramActionItems(program: Program) {
  if (program.type === "Competition") {
    return ["确认报名窗口和考点", "安排 4-8 周训练节奏", "记录成绩与晋级结果"];
  }
  if (program.type === "Research Program") {
    return ["确认导师制或产出形式", "准备相关课程/项目材料", "规划论文、展示或作品沉淀"];
  }
  if (program.type === "Summer School") {
    return ["确认申请材料清单", "核对住宿、签证和费用", "提前设计课程后的成果复盘"];
  }
  return ["核对官网信息", "确认投入时间", "明确活动产出如何服务申请主线"];
}

function sourceQueryMatches(text: string, sourceQuery?: string) {
  return Boolean(sourceQuery && normalizeText(text).includes(normalizeText(sourceQuery)));
}

function programAppearsInCase(program: Program, studentCase?: StudentCase) {
  return Boolean(
    studentCase?.activityExperience.some(
      (activity) => activity.programId === program.id || activity.programName === program.name
    )
  );
}

function scoreProgram(
  program: Program,
  profile: PlannerProfile,
  gaps: string[],
  source: PlannerSourceOptions = {}
) {
  const text = searchTextForProgram(program);
  const reasons: string[] = [];
  const evidenceTags: string[] = [];
  const fit = gradeFit(program, profile);
  let score = 20;

  if (source.sourceProgram?.id === program.id) {
    score += 26;
    pushReason(reasons, evidenceTags, "当前查看的活动已作为规划锚点", "当前活动");
  } else if (source.sourceProgram && subjectMatches(text, source.sourceProgram.subjectArea)) {
    score += 6;
    pushReason(reasons, evidenceTags, "与当前活动方向相近，可作为组合补充", "同方向活动");
  }

  if (programAppearsInCase(program, source.sourceCase)) {
    score += 18;
    pushReason(reasons, evidenceTags, "参考案例中出现过该活动", "案例参与活动");
  } else if (source.sourceCase && subjectMatches(text, source.sourceCase.intendedMajor)) {
    score += 6;
    pushReason(reasons, evidenceTags, "与参考案例申请方向相近", "案例方向");
  }

  if (sourceQueryMatches(text, source.sourceQuery)) {
    score += 8;
    pushReason(reasons, evidenceTags, `命中搜索关键词「${source.sourceQuery}」`, "搜索关键词");
  }

  if (fit === "exact") {
    score += 18;
    pushReason(reasons, evidenceTags, `适合年级覆盖 ${profile.grade}`, profile.grade);
  } else if (fit === "near") {
    score += 8;
    pushReason(reasons, evidenceTags, `与 ${profile.grade} 处于相邻阶段`, "年级相邻");
  } else if (fit === "mismatch") {
    score -= 14;
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
  if (profile.intent === "support" && fit === "exact") {
    score += 5;
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

function scoreCase(
  studentCase: StudentCase,
  profile: PlannerProfile,
  gaps: string[],
  source: PlannerSourceOptions = {}
) {
  const text = searchTextForCase(studentCase);
  const reasons: string[] = [];
  const evidenceTags: string[] = [];
  let score = 18;

  if (source.sourceCase?.id === studentCase.id) {
    score += 24;
    pushReason(reasons, evidenceTags, "当前查看的案例已作为路径参考", "当前案例");
  }
  if (
    source.sourceProgram &&
    studentCase.activityExperience.some(
      (activity) =>
        activity.programId === source.sourceProgram?.id ||
        activity.programName === source.sourceProgram?.name
    )
  ) {
    score += 18;
    pushReason(reasons, evidenceTags, "该案例与当前活动存在参与关系", "活动关联案例");
  }
  if (sourceQueryMatches(text, source.sourceQuery)) {
    score += 8;
    pushReason(reasons, evidenceTags, `命中搜索关键词「${source.sourceQuery}」`, "搜索关键词");
  }

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
    pathSummary: buildCasePathSummary(studentCase),
    reasons: reasons.length ? reasons : ["可作为路径对照案例"],
    evidenceTags: Array.from(new Set(evidenceTags))
  };
}

function buildCasePathSummary(studentCase: StudentCase) {
  const activities = studentCase.activityExperience
    .slice(0, 3)
    .map((activity) => activity.programName)
    .join(" / ");
  return activities
    ? `${studentCase.anonymousCode}：${activities}，结果方向 ${studentCase.intendedMajor}`
    : `${studentCase.anonymousCode}：${studentCase.intendedMajor}，${studentCase.resultSummary}`;
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

function buildSourceContexts(source: PlannerSourceOptions): PlannerSourceContext[] {
  const contexts: PlannerSourceContext[] = [];
  if (source.sourceProgram) {
    contexts.push({
      type: "program",
      id: source.sourceProgram.id,
      label: source.sourceProgram.name,
      description: `当前活动：${source.sourceProgram.type} / ${source.sourceProgram.gradeRange} / ${source.sourceProgram.subjectArea}`
    });
  }
  if (source.sourceCase) {
    contexts.push({
      type: "case",
      id: source.sourceCase.id,
      label: source.sourceCase.anonymousCode,
      description: `参考案例：${source.sourceCase.grade} / ${source.sourceCase.intendedMajor} / ${source.sourceCase.resultSummary}`
    });
  }
  if (source.sourceQuery) {
    contexts.push({
      type: "query",
      label: source.sourceQuery,
      description: "来自首页或搜索入口的关键词"
    });
  }
  return contexts;
}

function buildExplanation(
  profile: PlannerProfile,
  programs: PlannerProgramRecommendation[],
  cases: PlannerCaseRecommendation[],
  gaps: string[],
  source: PlannerSourceOptions = {}
) {
  const topProgram = programs[0]?.program.name ?? "当前活动库中的相关项目";
  const topCase = cases[0]?.studentCase.anonymousCode ?? "相近案例";
  if (source.sourceProgram) {
    return `本次以活动「${source.sourceProgram.name}」为锚点，先判断它在 ${profile.subjectArea} 路径里更适合作为核心动作还是补充选择，再补充同方向活动与相关案例。系统优先选择 ${topProgram}，并参考 ${topCase} 等案例解释活动组合。当前不做外部联网搜索，时间、费用和官网仍以活动库维护数据为准。重点补强项：${gaps.slice(0, 3).join("、")}。`;
  }
  if (source.sourceCase) {
    return `本次以案例「${source.sourceCase.anonymousCode}」为参考路径，先提取该案例中的活动组合和申请方向，再反推你当前阶段需要补齐的活动证据。系统优先选择 ${topProgram}，并用 ${topCase} 等案例做对照。当前不做外部联网搜索，时间、费用和官网仍以活动库维护数据为准。重点补强项：${gaps.slice(0, 3).join("、")}。`;
  }
  if (source.sourceQuery) {
    return `本次参考搜索关键词「${source.sourceQuery}」生成路径，系统会优先考虑命中关键词的活动与案例，同时结合年级、方向和履历缺口做排序。当前优先选择 ${topProgram}，并参考 ${topCase} 等案例。时间、费用和官网仍以活动库维护数据为准。重点补强项：${gaps.slice(0, 3).join("、")}。`;
  }
  return `建议先围绕 ${profile.subjectArea} 建立可证明的活动主线。系统优先选择 ${topProgram}，因为它与年级、方向或履历缺口更接近；同时参考 ${topCase} 等案例，帮助你判断活动组合如何服务申请叙事。当前不做外部联网搜索，时间、费用和官网仍以活动库维护数据为准。重点补强项：${gaps.slice(0, 3).join("、")}。`;
}

function buildRiskWarnings(
  profile: PlannerProfile,
  programs: PlannerProgramRecommendation[],
  gaps: string[],
  source: PlannerSourceOptions = {}
) {
  const warnings = [
    "推荐基于内部活动库和案例库生成，活动时间、费用、官网仍需以官方信息复核。"
  ];
  if (source.sourceProgram) {
    warnings.push("当前活动只是规划锚点，不代表必须参加；若年级、费用或时间不合适，应选择替代活动。");
  }
  if (source.sourceCase) {
    warnings.push("参考案例不能直接复制，需要结合你的成绩、时间窗口和活动产出重新取舍。");
  }
  if (profile.grade === "G12" && gaps.length >= 2) {
    warnings.push("当前已接近申请窗口，建议优先选择周期短、产出明确的活动。");
  }
  if (profile.budget === "low" && programs.some((item) => item.cautions.some((text) => text.includes("费用")))) {
    warnings.push("部分高分活动不完全满足低成本偏好，建议同时准备免费或线上备选。");
  }
  if (gaps.includes("语言成绩信息待补充")) {
    warnings.push("语言成绩缺失会影响案例相似度判断，补充分数后结果会更准。");
  }
  return warnings;
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

function selectRelevantCases(
  cases: PlannerCaseRecommendation[],
  source: PlannerSourceOptions = {}
) {
  const selected: PlannerCaseRecommendation[] = [];
  const selectedIds = new Set<string>();

  const sourceCase = source.sourceCase
    ? cases.find((item) => item.studentCase.id === source.sourceCase?.id)
    : null;
  if (sourceCase) {
    selected.push(sourceCase);
    selectedIds.add(sourceCase.studentCase.id);
  }

  cases.forEach((item) => {
    if (selected.length >= 5 || selectedIds.has(item.studentCase.id)) {
      return;
    }
    selected.push(item);
    selectedIds.add(item.studentCase.id);
  });

  return selected.sort((left, right) => right.score - left.score);
}

function selectDiversePrograms(
  programs: PlannerProgramRecommendation[],
  source: PlannerSourceOptions = {}
) {
  const selected: PlannerProgramRecommendation[] = [];
  const selectedIds = new Set<string>();

  const sourceProgram = source.sourceProgram
    ? programs.find((item) => item.program.id === source.sourceProgram?.id)
    : null;
  if (sourceProgram) {
    selected.push(sourceProgram);
    selectedIds.add(sourceProgram.program.id);
  }

  ["Competition", "Research Program", "Summer School"].forEach((type) => {
    const item = programs.find((program) => program.program.type === type);
    if (item && !selectedIds.has(item.program.id)) {
      selected.push(item);
      selectedIds.add(item.program.id);
    }
  });

  programs.forEach((item) => {
    if (selected.length >= 8 || selectedIds.has(item.program.id)) {
      return;
    }
    selected.push(item);
    selectedIds.add(item.program.id);
  });

  return selected.sort((left, right) => right.score - left.score);
}

export function buildPlannerRecommendations(
  profile: PlannerProfile,
  programs: Program[],
  studentCases: StudentCase[],
  source: PlannerSourceOptions = {}
): PlannerRecommendationResponse {
  const gaps = inferGaps(profile);
  const caseRecommendations: PlannerCaseRecommendation[] = studentCases
    .map((studentCase) => ({
      studentCase,
      ...scoreCase(studentCase, profile, gaps, source)
    }))
    .sort((left, right) => right.score - left.score);
  const selectedCases = selectRelevantCases(caseRecommendations, source);

  const scoredPrograms: PlannerProgramRecommendation[] = programs
    .map((program) => {
      const scored = scoreProgram(program, profile, gaps, source);
      return {
        program,
        score: scored.score,
        stage: stageForProgram(program, profile),
        priority: recommendationPriority(program, gaps),
        fitSummary: buildProgramFitSummary(program, profile, gaps),
        reasons: scored.reasons,
        cautions: buildProgramCautions(program, profile),
        actionItems: buildProgramActionItems(program),
        evidenceTags: scored.evidenceTags,
        relatedCaseIds: []
      };
    })
    .filter((item) => item.score >= 28 || item.program.id === source.sourceProgram?.id)
    .sort((left, right) => right.score - left.score);

  const programRecommendations = selectDiversePrograms(scoredPrograms, source)
    .map((item) => ({
      ...item,
      relatedCaseIds: findRelatedCaseIds(item.program, selectedCases)
    }));
  const sourceContexts = buildSourceContexts(source);
  const timeline = buildTimeline(profile, programRecommendations, selectedCases);
  const explanation = buildExplanation(profile, programRecommendations, selectedCases, gaps, source);
  const riskWarnings = buildRiskWarnings(profile, programRecommendations, gaps, source);
  const advisorExplanation = buildPlannerAdvisorExplanation({
    profile,
    sourceContexts,
    gaps,
    programs: programRecommendations,
    cases: selectedCases,
    timeline,
    riskWarnings,
    ruleExplanation: explanation
  });

  return {
    sourceContexts,
    profileSummary: buildProfileSummary(profile, gaps),
    gaps,
    programs: programRecommendations,
    cases: selectedCases,
    timeline,
    explanation,
    advisorExplanation,
    riskWarnings,
    nextAdjustments: [
      "只看线上活动",
      "降低预算要求",
      "更偏竞赛证明",
      "更偏科研产出",
      "补充夏校探索",
      "参考更稳妥案例"
    ],
    generatedBy: "internal_rules"
  };
}

export async function buildPlannerRecommendationsFromCatalog(profile: PlannerProfile) {
  const { getProgram, getStudentCase, listCases, listPrograms } = await import("@/lib/server/catalog");
  const [programResult, caseResult, sourceProgram, sourceCase] = await Promise.all([
    listPrograms({}, { page: 1, pageSize: 300, sortBy: "updatedAt", sortOrder: "desc" }),
    listCases({}, { page: 1, pageSize: 300, sortBy: "updatedAt", sortOrder: "desc" }),
    profile.sourceProgramId ? getProgram(profile.sourceProgramId) : Promise.resolve(null),
    profile.sourceCaseId ? getStudentCase(profile.sourceCaseId) : Promise.resolve(null)
  ]);
  const sourceQuery = profile.sourceQuery?.trim();

  return buildPlannerRecommendations(profile, programResult.items, caseResult.items, {
    sourceProgram: sourceProgram ?? undefined,
    sourceCase: sourceCase ?? undefined,
    sourceQuery: sourceQuery || undefined
  });
}
