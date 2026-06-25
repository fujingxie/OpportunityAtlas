import { parseProgramsFromText } from "@/lib/server/import-docx";
import path from "path";
import { TextDecoder, TextEncoder } from "util";

Object.assign(globalThis, { TextDecoder, TextEncoder });

const mammoth = require("mammoth") as typeof import("mammoth");

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

  it("extracts all activity entries from the source DOCX", async () => {
    const result = await mammoth.extractRawText({
      path: path.join(process.cwd(), "docs/活动.docx")
    });
    const items = parseProgramsFromText(result.value);

    expect(items).toHaveLength(50);
    expect(items[0].parsedData).toMatchObject({
      name: "IMO (International Mathematical Olympiad)",
      type: "Competition",
      organization: "国际数学奥林匹克组委会",
      officialUrl: "https://www.imo-official.org/",
      gradeRange: "G10-G12（需通过本国选拔）",
      subjectArea: "理科 - 数学",
      format: "offline"
    });
    expect(items[0].parsedData.coreTopics).toEqual(
      expect.arrayContaining(["代数", "几何", "数论", "组合数学"])
    );
    expect(items[0].parsedData.completeness).toBeGreaterThanOrEqual(90);
    expect(items[21].title).toBe("CMU Pre-College Programs");
    expect(items[21].title).not.toContain("基本信息");
  });
});
