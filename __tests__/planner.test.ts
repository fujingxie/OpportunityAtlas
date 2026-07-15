import { buildPlannerRecommendations } from "@/lib/server/planner";
import { buildPlannerAdvisorExplanationWithProvider } from "@/lib/server/planner-explanation";
import { mockCases } from "@/lib/mock/cases";
import { mockPrograms } from "@/lib/mock/programs";
import type { PlannerProfile } from "@/lib/types";

describe("path planner recommendations", () => {
  it("builds explainable recommendations from internal programs and cases", () => {
    const profile: PlannerProfile = {
      grade: "G10",
      curriculum: "A-Level",
      targetRegion: "美国",
      subjectArea: "STEM",
      standardizedScore: "数学较强",
      languageScore: "托福 105",
      gpa: "年级前 10%",
      competitions: "",
      summerSchools: "",
      research: "",
      budget: "all",
      format: "all",
      intent: "balanced"
    };

    const result = buildPlannerRecommendations(profile, mockPrograms, mockCases);

    expect(result.profileSummary).toContain("G10");
    expect(result.gaps).toEqual(expect.arrayContaining(["竞赛证明不足", "科研或项目产出不足"]));
    expect(result.programs.length).toBeGreaterThan(0);
    expect(result.cases.length).toBeGreaterThan(0);
    expect(result.timeline).toHaveLength(4);
    expect(result.programs[0].reasons.length).toBeGreaterThan(0);
    expect(result.programs[0].fitSummary).toBeTruthy();
    expect(result.programs[0].cautions.length).toBeGreaterThan(0);
    expect(result.programs[0].actionItems.length).toBeGreaterThan(0);
    expect(result.programs.some((item) => item.program.type === "Research Program")).toBe(true);
    expect(result.cases[0].pathSummary).toContain(result.cases[0].studentCase.anonymousCode);
    expect(result.riskWarnings.length).toBeGreaterThan(0);
    expect(result.advisorExplanation.mode).toBe("ai_ready");
    expect(result.advisorExplanation.guardrails).toEqual(
      expect.arrayContaining([expect.stringContaining("不编造活动官网")])
    );
    expect(result.explanation).toContain("活动库");
  });

  it("keeps source program and source case as planning anchors", () => {
    const profile: PlannerProfile = {
      grade: "G10",
      curriculum: "A-Level",
      targetRegion: "美国",
      subjectArea: "STEM",
      standardizedScore: "数学较强",
      languageScore: "托福 105",
      gpa: "年级前 10%",
      competitions: "",
      summerSchools: "",
      research: "",
      budget: "all",
      format: "all",
      intent: "case_reference",
      sourceProgramId: mockPrograms[0].id,
      sourceCaseId: mockCases[0].id,
      sourceQuery: "STEM"
    };

    const result = buildPlannerRecommendations(profile, mockPrograms, mockCases, {
      sourceProgram: mockPrograms[0],
      sourceCase: mockCases[0],
      sourceQuery: "STEM"
    });

    expect(result.sourceContexts.map((context) => context.type)).toEqual([
      "program",
      "case",
      "query"
    ]);
    expect(result.programs.map((item) => item.program.id)).toContain(mockPrograms[0].id);
    expect(result.cases.map((item) => item.studentCase.id)).toContain(mockCases[0].id);
    expect(result.explanation).toContain(mockPrograms[0].name);
    expect(result.riskWarnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("当前活动只是规划锚点")
      ])
    );
  });

  it("falls back to template explanation when deepseek key is missing", async () => {
    const previousProvider = process.env.PLANNER_EXPLANATION_PROVIDER;
    const previousKey = process.env.DEEPSEEK_API_KEY;
    process.env.PLANNER_EXPLANATION_PROVIDER = "deepseek";
    delete process.env.DEEPSEEK_API_KEY;

    const profile: PlannerProfile = {
      grade: "G10",
      curriculum: "A-Level",
      targetRegion: "美国",
      subjectArea: "STEM",
      standardizedScore: "数学较强",
      languageScore: "托福 105",
      gpa: "年级前 10%",
      competitions: "",
      summerSchools: "",
      research: "",
      budget: "all",
      format: "all",
      intent: "balanced"
    };
    const result = buildPlannerRecommendations(profile, mockPrograms, mockCases);
    const explanation = await buildPlannerAdvisorExplanationWithProvider({
      profile,
      sourceContexts: result.sourceContexts,
      gaps: result.gaps,
      programs: result.programs,
      cases: result.cases,
      timeline: result.timeline,
      riskWarnings: result.riskWarnings,
      ruleExplanation: result.explanation
    });

    expect(explanation.mode).toBe("ai_ready");
    expect(explanation.guardrails).toEqual(
      expect.arrayContaining([expect.stringContaining("DeepSeek API key 未配置")])
    );

    if (previousProvider === undefined) {
      delete process.env.PLANNER_EXPLANATION_PROVIDER;
    } else {
      process.env.PLANNER_EXPLANATION_PROVIDER = previousProvider;
    }
    if (previousKey === undefined) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = previousKey;
    }
  });
});
