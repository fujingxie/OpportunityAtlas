import { toProgramMergeUpdateInput } from "@/lib/server/program-drafts";

describe("program draft merge", () => {
  it("fills missing fields and merges array fields without overwriting curated data", () => {
    const update = toProgramMergeUpdateInput(
      {
        id: "p-existing",
        name: "Existing Program",
        type: "Other",
        organization: "待补充",
        officialUrl: null,
        applicationStartDate: null,
        applicationEndDate: null,
        programStartDate: "2026-07",
        programEndDate: null,
        duration: null,
        gradeRange: "G10",
        subjectArea: "STEM",
        requirements: null,
        location: "待补充",
        format: "offline",
        costText: null,
        scholarshipText: null,
        description: "已有简介",
        coreTopics: ["数学"],
        highlights: [],
        applicationMethod: null,
        requiredMaterials: [],
        capacityLimit: null,
        tags: ["STEM"],
        status: "published",
        source: "manual",
        completeness: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Existing Program",
        type: "Research Program",
        organization: "Imported Org",
        officialUrl: "https://example.org",
        programStartDate: "2026-08",
        gradeRange: "G11",
        subjectArea: "Research",
        location: "线上",
        format: "online",
        description: "导入简介",
        coreTopics: ["数学", "科研"],
        highlights: ["导师指导"],
        requiredMaterials: ["成绩单"],
        tags: ["STEM", "Research"],
        status: "draft",
        source: "document_import",
        completeness: 80
      }
    );

    expect(update).toMatchObject({
      type: "Research Program",
      organization: "Imported Org",
      officialUrl: "https://example.org",
      programStartDate: "2026-07",
      location: "线上",
      description: "已有简介",
      completeness: 80
    });
    expect(update.coreTopics).toEqual({ set: ["数学", "科研"] });
    expect(update.highlights).toEqual({ set: ["导师指导"] });
    expect(update.requiredMaterials).toEqual({ set: ["成绩单"] });
    expect(update.tags).toEqual({ set: ["STEM", "Research"] });
  });
});
