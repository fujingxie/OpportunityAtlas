import {
  buildProgramImportQualityContext,
  evaluateProgramImportQuality
} from "@/lib/server/import-quality";

describe("program import quality", () => {
  it("blocks missing names and invalid official urls", () => {
    const quality = evaluateProgramImportQuality({
      name: "",
      type: "Competition",
      organization: "Example Org",
      officialUrl: "example.com",
      gradeRange: "G10",
      subjectArea: "STEM",
      location: "线上",
      format: "online",
      description: "示例活动",
      coreTopics: ["科研"],
      highlights: ["导师指导"],
      requiredMaterials: ["成绩单"],
      status: "draft",
      source: "document_import",
      completeness: 80
    });

    expect(quality.level).toBe("error");
    expect(quality.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name", severity: "error" }),
        expect.objectContaining({ field: "officialUrl", severity: "error" })
      ])
    );
  });

  it("warns for incomplete fields and existing activity names", () => {
    const context = buildProgramImportQualityContext(
      [],
      [{ id: "p-existing", name: "Example Research", status: "published" }]
    );
    const quality = evaluateProgramImportQuality(
      {
        name: "Example Research",
        type: "Research Program",
        organization: "待补充",
        officialUrl: "https://example.org",
        gradeRange: "待补充",
        subjectArea: "STEM",
        location: "待补充",
        format: "online",
        description: "Example",
        coreTopics: [],
        highlights: [],
        requiredMaterials: [],
        status: "draft",
        source: "document_import",
        completeness: 50
      },
      context
    );

    expect(quality.level).toBe("warning");
    expect(quality.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name", severity: "warning" }),
        expect.objectContaining({ field: "organization", severity: "warning" }),
        expect.objectContaining({ field: "requiredMaterials", severity: "warning" })
      ])
    );
    expect(quality.duplicatePrograms).toEqual([
      { id: "p-existing", name: "Example Research", status: "published" }
    ]);
  });

  it("blocks duplicate names within the same import job", () => {
    const context = buildProgramImportQualityContext(
      [
        {
          itemType: "program",
          status: "draft",
          parsedData: { name: "Duplicate Program" }
        },
        {
          itemType: "program",
          status: "draft",
          parsedData: { name: "Duplicate Program" }
        }
      ] as never,
      []
    );
    const quality = evaluateProgramImportQuality(
      {
        name: "Duplicate Program",
        type: "Other",
        organization: "Org",
        gradeRange: "G10",
        subjectArea: "综合",
        location: "线上",
        format: "online",
        description: "Description",
        status: "draft",
        source: "document_import",
        completeness: 80
      },
      context
    );

    expect(quality.level).toBe("error");
    expect(quality.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name", severity: "error" })
      ])
    );
  });
});
