import type {
  PlannerAdvisorExplanation,
  PlannerCaseRecommendation,
  PlannerProfile,
  PlannerProgramRecommendation,
  PlannerSourceContext,
  PlannerTimelineItem
} from "@/lib/types";

type PlannerExplanationInput = {
  profile: PlannerProfile;
  sourceContexts: PlannerSourceContext[];
  gaps: string[];
  programs: PlannerProgramRecommendation[];
  cases: PlannerCaseRecommendation[];
  timeline: PlannerTimelineItem[];
  riskWarnings: string[];
  ruleExplanation: string;
};

function sourceContextText(sourceContexts: PlannerSourceContext[]) {
  if (!sourceContexts.length) {
    return "从学生画像开始规划";
  }
  return sourceContexts
    .map((context) => {
      if (context.type === "program") {
        return `当前活动「${context.label}」`;
      }
      if (context.type === "case") {
        return `参考案例「${context.label}」`;
      }
      return `搜索关键词「${context.label}」`;
    })
    .join("，");
}

function buildStageAdvice(timeline: PlannerTimelineItem[]) {
  return timeline.map((item) => ({
    phase: item.phase,
    advice: `${item.title}：${item.description}`
  }));
}

function buildEvidence(input: PlannerExplanationInput) {
  const topPrograms = input.programs.slice(0, 3).map((item) => item.program.name);
  const topCases = input.cases
    .slice(0, 2)
    .map((item) => `${item.studentCase.anonymousCode}（${item.studentCase.intendedMajor}）`);

  return [
    `学生画像：${input.profile.grade} / ${input.profile.curriculum} / ${input.profile.subjectArea} / 目标${input.profile.targetRegion}`,
    `主要缺口：${input.gaps.slice(0, 3).join("、")}`,
    topPrograms.length ? `优先活动：${topPrograms.join("、")}` : "优先活动：暂无高置信活动",
    topCases.length ? `参考案例：${topCases.join("、")}` : "参考案例：暂无高置信案例"
  ];
}

export function buildPlannerAdvisorExplanation(
  input: PlannerExplanationInput
): PlannerAdvisorExplanation {
  const topProgram = input.programs[0]?.program.name ?? "当前活动库中的相关活动";
  const sourceText = sourceContextText(input.sourceContexts);
  const leadingGap = input.gaps[0] ?? "活动主线需要进一步明确";

  return {
    mode: "ai_ready",
    headline: "规划解读",
    summary: `${sourceText}。建议先围绕 ${input.profile.subjectArea} 建立一条可解释的活动主线，近期优先处理「${leadingGap}」。当前结果把「${topProgram}」放在较高优先级，是因为它与年级窗口、方向证据或已有路径上下文更接近。`,
    stageAdvice: buildStageAdvice(input.timeline),
    evidence: buildEvidence(input),
    guardrails: [
      "不编造活动官网、费用、时间和录取结果，所有事实字段以活动库和案例库为准。",
      "AI 解释层只负责组织表达，不直接改动活动排序、案例排序和风险提示。",
      "若活动资料完整度偏低，结果页必须保留人工复核提醒。"
    ],
    nextStep:
      input.riskWarnings[0] ??
      "先确认推荐活动的官网、报名截止和产出形式，再决定是否纳入个人路径。"
  };
}

export function buildPlannerAiPrompt(input: PlannerExplanationInput) {
  return {
    system:
      "你是升学活动规划顾问。只能基于给定活动库、案例库和规则结果做解释，不能编造外部事实、官网、费用、日期或录取结果。",
    user: JSON.stringify(
      {
        profile: input.profile,
        sourceContexts: input.sourceContexts,
        gaps: input.gaps,
        programs: input.programs.map((item) => ({
          name: item.program.name,
          type: item.program.type,
          score: item.score,
          priority: item.priority,
          fitSummary: item.fitSummary,
          reasons: item.reasons,
          cautions: item.cautions,
          actionItems: item.actionItems
        })),
        cases: input.cases.map((item) => ({
          anonymousCode: item.studentCase.anonymousCode,
          intendedMajor: item.studentCase.intendedMajor,
          resultSummary: item.studentCase.resultSummary,
          pathSummary: item.pathSummary,
          reasons: item.reasons
        })),
        timeline: input.timeline,
        riskWarnings: input.riskWarnings,
        ruleExplanation: input.ruleExplanation
      },
      null,
      2
    )
  };
}
