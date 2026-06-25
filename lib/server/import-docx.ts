import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import type { Program } from "@/lib/types";

type ParsedImportProgram = Partial<Program> & {
  name: string;
};

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, "_");
}

function extractField(block: string, labels: string[]) {
  for (const label of labels) {
    const match = block.match(new RegExp(`${label}\\s*[:：]\\s*([^\\n]+)`, "i"));
    if (match?.[1]) {
      return match[1].trim();
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
  if (/竞赛|competition|olympiad/i.test(text)) {
    return "Competition";
  }
  if (/夏校|summer/i.test(text)) {
    return "Summer School";
  }
  if (/科研|research/i.test(text)) {
    return "Research Program";
  }
  return "Other";
}

function inferFormat(text: string): Program["format"] {
  if (/线上|online/i.test(text)) {
    return "online";
  }
  if (/混合|hybrid/i.test(text)) {
    return "hybrid";
  }
  return "offline";
}

function parseProgramBlock(block: string, index: number): ParsedImportProgram {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const name =
    extractField(block, ["活动名称", "项目名称", "名称"]) ??
    lines[0]?.replace(/^\d+[.、)\s-]*/, "").trim() ??
    `未命名活动 ${index + 1}`;
  const description =
    extractField(block, ["简介", "项目简介", "活动简介", "描述"]) ??
    lines.slice(1, 4).join(" ");
  const subjectArea = extractField(block, ["学科", "学科方向", "方向"]) ?? "综合";
  const tags = Array.from(
    new Set([
      inferType(block),
      subjectArea,
      ...splitList(extractField(block, ["标签", "关键词"])),
      ...splitList(extractField(block, ["年级", "适合年级"]))
    ])
  ).filter(Boolean);

  return {
    name,
    type: inferType(block),
    organization: extractField(block, ["主办方", "机构", "组织"]) ?? "待补充",
    officialUrl: extractField(block, ["官网", "官方网站", "链接"]),
    applicationStartDate: extractField(block, ["申请开始", "报名开始"]),
    applicationEndDate: extractField(block, ["申请截止", "报名截止", "截止时间"]),
    programStartDate: extractField(block, ["活动开始", "项目开始"]),
    programEndDate: extractField(block, ["活动结束", "项目结束"]),
    duration: extractField(block, ["周期", "持续时间", "时长"]),
    gradeRange: extractField(block, ["适合年级", "年级"]) ?? "待补充",
    subjectArea,
    requirements: extractField(block, ["申请条件", "要求", "学生条件"]),
    location: extractField(block, ["地点", "位置"]) ?? "待补充",
    format: inferFormat(block),
    costText: extractField(block, ["费用", "成本"]),
    scholarshipText: extractField(block, ["奖学金", "资助"]),
    description: description || "待补充",
    coreTopics: splitList(extractField(block, ["核心主题", "核心课程", "主题"])),
    highlights: splitList(extractField(block, ["亮点", "特色"])),
    applicationMethod: extractField(block, ["报名方式", "申请方式"]),
    requiredMaterials: splitList(extractField(block, ["材料", "申请材料", "提交材料"])),
    capacityLimit: extractField(block, ["名额", "人数限制", "容量"]),
    tags,
    status: "draft",
    source: "document_import",
    completeness: 55
  };
}

export function parseProgramsFromText(text: string) {
  const normalized = text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks = normalized
    .split(/\n(?=\s*(?:\d+[.、)]|活动名称|项目名称))/)
    .map((block) => block.trim())
    .filter((block) => block.length > 20);
  const sourceBlocks = blocks.length ? blocks : [normalized];

  return sourceBlocks.slice(0, 120).map((block, index) => ({
    title: parseProgramBlock(block, index).name,
    rawText: block,
    parsedData: parseProgramBlock(block, index)
  }));
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
