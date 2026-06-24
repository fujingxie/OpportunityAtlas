import { filterCases, filterPrograms, getRelatedCases, getRelatedPrograms } from "@/lib/mock/service";
import { mockPrograms } from "@/lib/mock/programs";
import { mockCases } from "@/lib/mock/cases";

describe("mock service", () => {
  it("filters programs by query and type", () => {
    const programs = filterPrograms({ q: "RSI", type: "Research Program" });

    expect(programs.some((program) => program.id === "p-015")).toBe(true);
  });

  it("filters cases by activity type", () => {
    const cases = filterCases({ activityType: "Research Program" });

    expect(cases.length).toBeGreaterThan(0);
    expect(
      cases.every((studentCase) =>
        studentCase.activityExperience.some((activity) => activity.type === "Research Program")
      )
    ).toBe(true);
  });

  it("keeps program and case relations bidirectional", () => {
    const rsi = mockPrograms.find((program) => program.id === "p-015");
    const case018 = mockCases.find((studentCase) => studentCase.id === "c-018");

    expect(rsi).toBeDefined();
    expect(case018).toBeDefined();
    expect(getRelatedCases(rsi!)).toEqual(expect.arrayContaining([case018]));
    expect(getRelatedPrograms(case018!)).toEqual(expect.arrayContaining([rsi]));
  });
});
