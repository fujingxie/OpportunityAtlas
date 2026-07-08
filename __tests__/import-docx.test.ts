import { parseCasesFromText, parseProgramsFromText } from "@/lib/server/import-docx";
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

  it("extracts case drafts from grouped case library text", () => {
    const items = parseCasesFromText(`
## 一、顶尖冲刺路径（1–10，Top5%，难度⭐⭐⭐⭐⭐）

### 案例1

就读体系：IB
标化成绩：42–45
语言成绩：雅思8.0
竞赛：John Locke经济铜奖、NEC全国决赛
夏校：NYU商科学分夏校
科研：IB EE金融计量独立研究
申请地区：美国、中国香港
路径定位：顶尖商科

## 二、优秀竞争路径（11–25，Top20%，难度⭐⭐⭐⭐）

### 案例11

就读体系：A-Level
标化成绩：3A*1A
语言成绩：雅思7.2
竞赛：BPhO铜奖
夏校：UCL计算机线上夏校
科研：简易小程序开发项目
申请地区：英国
路径定位：优秀计算机

## 三、主流普通路径（26–40，Top40–60%，难度⭐⭐⭐）

### 案例26

就读体系：AP
标化成绩：3–4门4–5分
语言成绩：SAT1420
竞赛：校园商业策划校内赛
夏校：无付费夏校
科研：校园二手市场运营调研
申请地区：澳洲
路径定位：普通商科

## 四、滑档/反面避坑路径（41–50，难度⭐）

### 案例41

就读体系：IB
标化成绩：40
语言成绩：雅思7.6
竞赛：NEC、John Locke
夏校：沃顿商科夏校
科研：金融EE调研
申请地区：美国、澳洲
路径定位：滑档商科（全冲藤校无保底）
`);

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.parsedData.resultTier)).toEqual([
      "顶尖",
      "中等",
      "普通",
      "失败"
    ]);
    expect(items[0].parsedData).toMatchObject({
      anonymousCode: "OA-001",
      grade: "G11",
      schoolType: "international",
      gpaRange: "IB 42–45",
      intendedMajor: "商科",
      resultTier: "顶尖",
      status: "draft"
    });
    expect(items[3].parsedData.consultantReview).toBe("避坑提示：全冲藤校无保底");
  });
});
