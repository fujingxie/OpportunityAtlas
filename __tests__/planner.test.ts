import { buildPlannerRecommendations } from "@/lib/server/planner";
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
    expect(result.explanation).toContain("活动库");
  });
});
