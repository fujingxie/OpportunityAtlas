import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import type { Program } from "@/lib/types";

type ParsedImportProgram = Partial<Program> & {
  name: string;
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
    const isSectionHeading = /^#{1,6}\s*[一二三四五六七八九十]+[、.)]\s+/.test(trimmed);
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
