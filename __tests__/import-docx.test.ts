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

  it("extracts program drafts from documents with 新增 numbered headings and spaced labels", () => {
    const items = parseProgramsFromText(`
新增 1. AMC 8 美国初中数学竞赛

基本信息

活动名称：AMC 8 (American Mathematics Competition 8)
主办方 / 组织机构：美国数学协会 MAA
活动类型：竞赛
活动网址 / 官网链接：https://maa.org/amc

时间信息

报名开始日期：通常每年 9-10 月
报名截止日期：通常次年 1 月初
活动开始日期：每年 1 月下旬
活动结束日期：每年 1 月下旬
持续时间：40 分钟

学生条件

适合年级：G8 及以下，年龄≤14.5 岁
学科 / 方向：理科 - 数学
成绩 / GPA 要求：无硬性要求
其他申请条件：通过授权学校 / 合作考点报名，不可个人直报

地理 & 形式

地点：全球各授权考点
活动形式：线下纸笔

成本信息

报名费 / 学费：约 120 元人民币
住宿 / 交通费用：学生自理
奖学金 / 资助机会：无

内容与亮点

活动简介：全球普及度最高的初中数学竞赛。
核心课程 / 主题：算术、代数、平面几何
特色亮点：门槛友好、全球统一试卷

报名信息

报名方式：授权学校、官方合作考点统一报名
提交材料：学生学籍信息、报名费缴费凭证
名额限制：无统一名额限制，以考点考位为准

新增 2. AMC 10 美国高中数学竞赛

基本信息

活动名称：AMC 10 (American Mathematics Competition 10)
主办方 / 组织机构：美国数学协会 MAA
活动类型：竞赛
活动网址 / 官网链接：https://maa.org/amc
`);

    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("AMC 8 (American Mathematics Competition 8)");
    expect(items[0].parsedData).toMatchObject({
      organization: "美国数学协会 MAA",
      officialUrl: "https://maa.org/amc",
      gradeRange: "G8 及以下，年龄≤14.5 岁",
      subjectArea: "理科 - 数学",
      location: "全球各授权考点",
      costText: "约 120 元人民币；学生自理",
      applicationEndDate: "通常次年 1 月初",
      programStartDate: "每年 1 月下旬",
      applicationMethod: "授权学校、官方合作考点统一报名"
    });
    expect(items[0].parsedData.completeness).toBeGreaterThanOrEqual(90);
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
