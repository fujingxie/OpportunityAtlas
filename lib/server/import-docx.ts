import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import type { Program, StudentCase } from "@/lib/types";

type ParsedImportProgram = Partial<Program> & {
  name: string;
};

type ParsedImportCase = Partial<StudentCase> & {
  anonymousCode: string;
};

export type ImportSourceType = "program" | "case" | "mixed" | "unknown";

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, "_");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\d+[.、)]\s*/, "")
    .trim();
}

function extractField(block: string, labels: string[]) {
  const lines = block
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  for (const label of labels) {
    const labelPattern = escapeRegExp(label);
    for (const line of lines) {
      const match = line.match(new RegExp(`^${labelPattern}\\s*[:：]\\s*(.+)$`, "i"));
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }
  return undefined;
}

function splitList(value: string | undefined) {
  if (!value) {
    return [];
  }
  return value
    .split(/[、,，;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferType(text: string): Program["type"] {
  const explicitType = extractField(text, ["活动类型", "项目类型", "类型"]);
  const source = explicitType ?? text;
  if (/竞赛|competition|olympiad/i.test(source)) {
    return "Competition";
  }
  if (/夏校|summer/i.test(source)) {
    return "Summer School";
  }
  if (/科研|研究|research/i.test(source)) {
    return "Research Program";
  }
  return "Other";
}

function inferFormat(text: string): Program["format"] {
  const explicitFormat = extractField(text, ["活动形式", "形式"]);
  const source = explicitFormat ?? text;
  if (/线上|online/i.test(source)) {
    return "online";
  }
  if (/混合|hybrid/i.test(source)) {
    return "hybrid";
  }
  return "offline";
}

function getHeadingTitle(block: string) {
  const firstLine = block
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) {
    return undefined;
  }

  const cleaned = cleanLine(firstLine)
    .replace(/^\d+[.、)]\s*/, "")
    .replace(/(?:基本信息|时间信息|学生条件|地理&形式|成本信息|内容与亮点|报名信息)$/u, "")
    .trim();
  return cleaned || undefined;
}

function extractGrades(gradeRange: string) {
  const matches = gradeRange.match(/G\d{1,2}/gi) ?? [];
  return Array.from(new Set(matches.map((grade) => grade.toUpperCase())));
}

function extractCaseIndex(text: string, fallbackIndex: number) {
  const match = text.match(/案例\s*(\d+)/);
  return match?.[1] ? Number(match[1]) : fallbackIndex + 1;
}

function inferCaseTier(sectionTitle: string) {
  if (/顶尖/.test(sectionTitle)) {
    return "顶尖";
  }
  if (/优秀|中等|Top20/i.test(sectionTitle)) {
    return "中等";
  }
  if (/普通|主流/.test(sectionTitle)) {
    return "普通";
  }
  if (/滑档|反面|失败/.test(sectionTitle)) {
    return "失败";
  }
  return "普通";
}

function extractCaseMajor(pathPosition: string | undefined) {
  const cleaned = (pathPosition ?? "")
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/^(顶尖|优秀|普通|滑档|失败|中等)/, "")
    .trim();
  return cleaned || pathPosition || "待补充";
}

function inferCaseSchoolType(curriculum: string | undefined): StudentCase["schoolType"] {
  return curriculum ? "international" : "other";
}

function inferLanguageTag(languageScore: string | undefined) {
  if (!languageScore) {
    return undefined;
  }
  if (/雅思|IELTS/i.test(languageScore)) {
    return "雅思";
  }
  if (/托福|TOEFL/i.test(languageScore)) {
    return "托福";
  }
  if (/SAT/i.test(languageScore)) {
    return "SAT";
  }
  return undefined;
}

function buildCaseActivityExperience(block: string): StudentCase["activityExperience"] {
  const activityFields: Array<{
    label: string;
    type: string;
    stage: string;
  }> = [
    { label: "竞赛", type: "Competition", stage: "竞赛" },
    { label: "夏校", type: "Summer School", stage: "夏校" },
    { label: "科研", type: "Research Program", stage: "科研" }
  ];
  const activities: StudentCase["activityExperience"] = [];

  for (const field of activityFields) {
    const value = extractField(block, [field.label]);
    if (value) {
      activities.push({
        programName: value,
        type: field.type,
        stage: field.stage,
        description: value
      });
    }
  }

  return activities;
}

function calculateCaseCompleteness(studentCase: Partial<StudentCase>) {
  const keys: Array<keyof StudentCase> = [
    "anonymousCode",
    "grade",
    "schoolType",
    "gpaRange",
    "academicSummary",
    "activityExperience",
    "intendedMajor",
    "resultSummary",
    "resultTier",
    "personalSummary",
    "consultantReview",
    "tags"
  ];
  const present = keys.filter((key) => {
    const value = studentCase[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;

  return Math.round((present / keys.length) * 100);
}

function inferSubjectTag(subjectArea: string) {
  if (/数学|物理|化学|生物|信息|工程|科研|STEM|理科/i.test(subjectArea)) {
    return "STEM";
  }
  if (/商|经济|金融|创业|商业/i.test(subjectArea)) {
    return "商科/经济";
  }
  if (/人文|社科|写作|历史|政治|国际关系|社会/i.test(subjectArea)) {
    return "人文社科";
  }
  if (/艺术|设计|媒体|电影|音乐/i.test(subjectArea)) {
    return "艺术";
  }
  return "综合";
}

function calculateCompleteness(program: Partial<Program>) {
  const keys: Array<keyof Program> = [
    "name",
    "type",
    "organization",
    "officialUrl",
    "applicationEndDate",
    "programStartDate",
    "duration",
    "gradeRange",
    "subjectArea",
    "requirements",
    "location",
    "format",
    "costText",
    "description",
    "coreTopics",
    "highlights",
    "applicationMethod",
    "requiredMaterials",
    "capacityLimit"
  ];
  const present = keys.filter((key) => {
    const value = program[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;

  return Math.round((present / keys.length) * 100);
}

function joinOptional(...values: Array<string | undefined>) {
  return values.filter(Boolean).join("；") || undefined;
}

function parseProgramBlock(block: string, index: number): ParsedImportProgram {
  const lines = block
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
  const name =
    extractField(block, ["活动名称", "项目名称", "名称"]) ??
    getHeadingTitle(block) ??
    lines[0]?.replace(/^\d+[.、)\s-]*/, "").trim() ??
    `未命名活动 ${index + 1}`;
  const description =
    extractField(block, ["活动简介", "项目简介", "简介", "描述"]) ??
    lines.slice(1, 4).join(" ");
  const subjectArea = extractField(block, ["学科/方向", "学科方向", "学科", "方向"]) ?? "综合";
  const type = inferType(block);
  const format = inferFormat(block);
  const gradeRange = extractField(block, ["适合年级", "年级"]) ?? "待补充";
  const tags = Array.from(
    new Set([
      type,
      inferSubjectTag(subjectArea),
      subjectArea,
      format,
      ...extractGrades(gradeRange),
      ...splitList(extractField(block, ["标签", "关键词"]))
    ])
  ).filter(Boolean);
  const requirements = joinOptional(
    extractField(block, ["成绩/GPA要求", "GPA要求", "成绩要求"]),
    extractField(block, ["其他申请条件", "申请条件", "要求", "学生条件"])
  );
  const costText = joinOptional(
    extractField(block, ["报名费/学费", "学费", "报名费", "费用", "成本"]),
    extractField(block, ["住宿/交通费用", "住宿费用", "交通费用"])
  );

  const program: ParsedImportProgram = {
    name,
    type,
    organization: extractField(block, ["主办方/组织机构", "主办方", "组织机构", "机构", "组织"]) ?? "待补充",
    officialUrl: extractField(block, ["活动网址/官网链接", "官网链接", "官网", "官方网站", "链接"]),
    applicationStartDate: extractField(block, ["报名开始日期", "申请开始日期", "申请开始", "报名开始"]),
    applicationEndDate: extractField(block, ["报名截止日期", "申请截止日期", "申请截止", "报名截止", "截止时间"]),
    programStartDate: extractField(block, ["活动开始日期", "项目开始日期", "活动开始", "项目开始"]),
    programEndDate: extractField(block, ["活动结束日期", "项目结束日期", "活动结束", "项目结束"]),
    duration: extractField(block, ["周期", "持续时间", "时长"]),
    gradeRange,
    subjectArea,
    requirements,
    location: extractField(block, ["地点", "位置"]) ?? "待补充",
    format,
    costText,
    scholarshipText: extractField(block, ["奖学金/资助机会", "奖学金", "资助"]),
    description: description || "待补充",
    coreTopics: splitList(extractField(block, ["核心课程/主题", "核心主题", "核心课程", "主题"])),
    highlights: splitList(extractField(block, ["特色亮点", "亮点", "特色"])),
    applicationMethod: extractField(block, ["报名方式", "申请方式"]),
    requiredMaterials: splitList(extractField(block, ["提交材料", "申请材料", "材料"])),
    capacityLimit: extractField(block, ["名额", "人数限制", "容量"]),
    tags,
    status: "draft",
    source: "document_import",
    completeness: 0
  };

  return {
    ...program,
    completeness: calculateCompleteness(program)
  };
}

function parseCaseBlock(block: string, index: number, sectionTitle: string): ParsedImportCase {
  const caseIndex = extractCaseIndex(block, index);
  const curriculum = extractField(block, ["就读体系", "课程体系", "体系"]);
  const standardizedScore = extractField(block, ["标化成绩", "成绩"]);
  const languageScore = extractField(block, ["语言成绩", "语言"]);
  const competitions = extractField(block, ["竞赛"]);
  const summerSchool = extractField(block, ["夏校"]);
  const research = extractField(block, ["科研"]);
  const applicationRegion = extractField(block, ["申请地区", "申请国家/地区", "地区"]);
  const pathPosition = extractField(block, ["路径定位", "定位"]);
  const resultTier = inferCaseTier(sectionTitle);
  const intendedMajor = extractCaseMajor(pathPosition);
  const warning = pathPosition?.match(/[（(](.*?)[）)]/)?.[1];
  const languageTag = inferLanguageTag(languageScore);
  const tags = Array.from(
    new Set(
      [
        curriculum,
        resultTier,
        intendedMajor,
        languageTag,
        ...splitList(applicationRegion),
        competitions ? "竞赛" : undefined,
        summerSchool ? "夏校" : undefined,
        research ? "科研" : undefined
      ].filter(Boolean) as string[]
    )
  );

  const studentCase: ParsedImportCase = {
    anonymousCode: `OA-${String(caseIndex).padStart(3, "0")}`,
    grade: "G11",
    schoolType: inferCaseSchoolType(curriculum),
    gpaRange: [curriculum, standardizedScore].filter(Boolean).join(" ") || "待补充",
    academicSummary: joinOptional(
      curriculum ? `就读体系：${curriculum}` : undefined,
      standardizedScore ? `标化成绩：${standardizedScore}` : undefined,
      languageScore ? `语言成绩：${languageScore}` : undefined,
      applicationRegion ? `申请地区：${applicationRegion}` : undefined
    ),
    activityExperience: buildCaseActivityExperience(block),
    intendedMajor,
    resultSummary: joinOptional(pathPosition, applicationRegion ? `申请地区：${applicationRegion}` : undefined) ?? "待补充",
    resultTier,
    personalSummary: joinOptional(
      competitions ? `竞赛：${competitions}` : undefined,
      summerSchool ? `夏校：${summerSchool}` : undefined,
      research ? `科研：${research}` : undefined
    ),
    consultantReview: warning ? `避坑提示：${warning}` : undefined,
    tags,
    status: "draft",
    completeness: 0
  };

  return {
    ...studentCase,
    completeness: calculateCaseCompleteness(studentCase)
  };
}

export function parseProgramsFromText(text: string) {
  const normalized = text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isProgramHeading = /^#{2,6}\s*\d+[.、)]\s+/.test(trimmed);
    const isSectionHeading = /^#{1,6}\s*[一二三四五六七八九十]+[、.)]\s*/.test(trimmed);
    if (isProgramHeading && current.length) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
    if (isSectionHeading) {
      continue;
    }
    if (isProgramHeading || current.length) {
      current.push(line);
    }
  }

  if (current.length) {
    blocks.push(current.join("\n").trim());
  }

  const fallbackBlocks = normalized
    .split(/\n(?=\s*(?:[-*•]\s*)?(?:活动名称|项目名称)\s*[:：])/)
    .map((block) => block.trim())
    .filter((block) => block.length > 20);
  const sourceBlocks = blocks.length ? blocks : [normalized];
  const parsedBlocks = sourceBlocks.length > 1 ? sourceBlocks : fallbackBlocks;

  return (parsedBlocks.length ? parsedBlocks : sourceBlocks)
    .slice(0, 120)
    .map((block, index) => {
      const parsedData = parseProgramBlock(block, index);
      return {
        title: parsedData.name,
        rawText: block,
        parsedData
      };
    });
}

export function parseCasesFromText(text: string) {
  const normalized = text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const blocks: Array<{ sectionTitle: string; text: string }> = [];
  let currentSectionTitle = "普通";
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isSectionHeading = /^#{1,6}\s*[一二三四五六七八九十]+[、.)]\s*/.test(trimmed);
    const isCaseHeading = /^#{1,6}\s*案例\s*\d+/i.test(trimmed) || /^案例\s*\d+/i.test(trimmed);

    if (isSectionHeading) {
      if (current.length) {
        blocks.push({
          sectionTitle: currentSectionTitle,
          text: current.join("\n").trim()
        });
        current = [];
      }
      currentSectionTitle = cleanLine(trimmed);
      continue;
    }

    if (isCaseHeading && current.length) {
      blocks.push({
        sectionTitle: currentSectionTitle,
        text: current.join("\n").trim()
      });
      current = [];
    }

    if (isCaseHeading || current.length) {
      current.push(line);
    }
  }

  if (current.length) {
    blocks.push({
      sectionTitle: currentSectionTitle,
      text: current.join("\n").trim()
    });
  }

  const fallbackBlocks = normalized
    .split(/\n(?=\s*(?:#{1,6}\s*)?案例\s*\d+)/i)
    .map((block) => block.trim())
    .filter((block) => block.length > 20)
    .map((block) => ({ sectionTitle: "普通", text: block }));

  return (blocks.length ? blocks : fallbackBlocks)
    .slice(0, 160)
    .map((block, index) => {
      const parsedData = parseCaseBlock(block.text, index, block.sectionTitle);
      return {
        title: parsedData.anonymousCode,
        rawText: block.text,
        parsedData
      };
    });
}

export async function saveUploadedDocx(file: File) {
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${randomUUID()}-${cleanFileName(file.name)}`;
  const storagePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(storagePath, bytes);

  const result = await mammoth.extractRawText({ path: storagePath });

  return {
    fileName: file.name,
    fileSize: bytes.byteLength,
    storagePath,
    text: result.value,
    messages: result.messages
  };
}
