import { parseProgramsFromText } from "@/lib/server/import-docx";

describe("DOCX import parser", () => {
  it("extracts program draft fields from structured text", () => {
    const items = parseProgramsFromText(`
1. 活动名称：Example Research Program
主办方：Example Institute
学科方向：STEM
适合年级：G10-G11
形式：线上
费用：免费
简介：一个示例科研项目。
亮点：导师指导、成果展示
`);

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Example Research Program");
    expect(items[0].parsedData).toMatchObject({
      name: "Example Research Program",
      organization: "Example Institute",
      subjectArea: "STEM",
      gradeRange: "G10-G11",
      format: "online",
      costText: "免费",
      status: "draft",
      source: "document_import"
    });
  });
});
