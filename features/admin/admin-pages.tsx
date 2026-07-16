"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Badge, Card, PageHeading, TextLink } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type {
  ImportJob,
  ImportQualitySummary,
  Program,
  ProgramCaseRelation,
  StudentCase
} from "@/lib/types";

type ImportItemView = {
  id: string;
  rawText?: string;
  title: string;
  itemType: string;
  status: string;
  parsedData: unknown;
  quality?: ImportQualitySummary;
};

type ImportJobView = ImportJob & {
  updatedAt?: string;
  storagePath?: string | null;
  items?: ImportItemView[];
};

type UploadSourceType = "program" | "case";

type ProgramDraftForm = {
  name: string;
  type: Program["type"];
  organization: string;
  officialUrl: string;
  applicationStartDate: string;
  applicationEndDate: string;
  programStartDate: string;
  programEndDate: string;
  duration: string;
  gradeRange: string;
  subjectArea: string;
  requirements: string;
  location: string;
  format: Program["format"];
  costText: string;
  scholarshipText: string;
  description: string;
  coreTopicsText: string;
  highlightsText: string;
  requiredMaterialsText: string;
  tagsText: string;
  applicationMethod: string;
  capacityLimit: string;
  status: Program["status"];
  source: Program["source"];
};

type CaseDraftForm = {
  anonymousCode: string;
  grade: StudentCase["grade"];
  schoolType: StudentCase["schoolType"];
  gpaRange: string;
  academicSummary: string;
  activityExperienceText: string;
  intendedMajor: string;
  resultSummary: string;
  resultTier: string;
  personalSummary: string;
  consultantReview: string;
  tagsText: string;
  status: StudentCase["status"];
};

type TagView = {
  id: string;
  name: string;
  group: string;
  enabled: boolean;
};

type RelationView = ProgramCaseRelation & {
  programName: string;
  anonymousCode: string;
};

type TagDraftForm = {
  name: string;
  group: TagView["group"];
  enabled: boolean;
};

const emptyProgramDraftForm: ProgramDraftForm = {
  name: "",
  type: "Other",
  organization: "",
  officialUrl: "",
  applicationStartDate: "",
  applicationEndDate: "",
  programStartDate: "",
  programEndDate: "",
  duration: "",
  gradeRange: "",
  subjectArea: "",
  requirements: "",
  location: "",
  format: "offline",
  costText: "",
  scholarshipText: "",
  description: "",
  coreTopicsText: "",
  highlightsText: "",
  requiredMaterialsText: "",
  tagsText: "",
  applicationMethod: "",
  capacityLimit: "",
  status: "draft",
  source: "manual"
};

const emptyCaseDraftForm: CaseDraftForm = {
  anonymousCode: "",
  grade: "G11",
  schoolType: "international",
  gpaRange: "",
  academicSummary: "",
  activityExperienceText: "",
  intendedMajor: "",
  resultSummary: "",
  resultTier: "",
  personalSummary: "",
  consultantReview: "",
  tagsText: "",
  status: "draft"
};

const emptyTagDraftForm: TagDraftForm = {
  name: "",
  group: "subject",
  enabled: true
};

const programTypeOptions: Array<{ label: string; value: Program["type"] }> = [
  { label: "竞赛", value: "Competition" },
  { label: "夏校", value: "Summer School" },
  { label: "科研项目", value: "Research Program" },
  { label: "其他", value: "Other" }
];

const programFormatOptions: Array<{ label: string; value: Program["format"] }> = [
  { label: "线下", value: "offline" },
  { label: "线上", value: "online" },
  { label: "混合", value: "hybrid" }
];

const programStatusOptions: Array<{ label: string; value: Program["status"] }> = [
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已归档", value: "archived" }
];

const caseGradeOptions: Array<{ label: string; value: StudentCase["grade"] }> = [
  { label: "G9", value: "G9" },
  { label: "G10", value: "G10" },
  { label: "G11", value: "G11" },
  { label: "G12", value: "G12" }
];

const caseSchoolTypeOptions: Array<{ label: string; value: StudentCase["schoolType"] }> = [
  { label: "国际学校", value: "international" },
  { label: "公立学校", value: "public" },
  { label: "其他", value: "other" }
];

const caseStatusOptions: Array<{ label: string; value: StudentCase["status"] }> = [
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已归档", value: "archived" }
];

const tagGroupOptions: Array<{ label: string; value: TagView["group"] }> = [
  { label: "活动类型", value: "program_type" },
  { label: "学科", value: "subject" },
  { label: "年级", value: "grade" },
  { label: "申请方向", value: "major" },
  { label: "地点", value: "location" },
  { label: "形式", value: "format" }
];

const relationTypeOptions: Array<{
  label: string;
  value: ProgramCaseRelation["relationType"];
}> = [
  { label: "参与活动", value: "participated" },
  { label: "相似学科", value: "similar_subject" },
  { label: "相似路径", value: "similar_path" },
  { label: "人工关联", value: "manual_related" }
];

function tagGroupLabel(group: string) {
  return tagGroupOptions.find((option) => option.value === group)?.label ?? group;
}

function relationTypeLabel(type: string) {
  return relationTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isProgramType(value: unknown): value is Program["type"] {
  return value === "Competition" || value === "Summer School" || value === "Research Program" || value === "Other";
}

function isProgramFormat(value: unknown): value is Program["format"] {
  return value === "online" || value === "offline" || value === "hybrid";
}

function isProgramStatus(value: unknown): value is Program["status"] {
  return (
    value === "draft" ||
    value === "pending_review" ||
    value === "published" ||
    value === "rejected" ||
    value === "archived"
  );
}

function isProgramSource(value: unknown): value is Program["source"] {
  return value === "document_import" || value === "manual";
}

function isCaseGrade(value: unknown): value is StudentCase["grade"] {
  return value === "G9" || value === "G10" || value === "G11" || value === "G12";
}

function isSchoolType(value: unknown): value is StudentCase["schoolType"] {
  return value === "international" || value === "public" || value === "other";
}

function arrayToText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("、") : "";
}

function textToArray(value: string) {
  return value
    .split(/[、,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function activityExperienceToText(value: StudentCase["activityExperience"]) {
  return value
    .map((activity) =>
      [
        activity.programName,
        activity.type,
        activity.stage,
        activity.description ?? ""
      ]
        .map((part) => part.trim())
        .join(" | ")
    )
    .join("\n");
}

function textToActivityExperience(value: string): StudentCase["activityExperience"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [programName, type, stage, ...descriptionParts] = line
        .split("|")
        .map((part) => part.trim());
      return {
        programName: programName || "未命名活动",
        type: type || "活动",
        stage: stage || "参与",
        description: descriptionParts.join(" | ") || undefined
      };
    });
}

function toProgramDraftForm(value: unknown): ProgramDraftForm {
  const data = asRecord(value);
  return {
    name: asString(data.name),
    type: isProgramType(data.type) ? data.type : "Other",
    organization: asString(data.organization),
    officialUrl: asString(data.officialUrl),
    applicationStartDate: asString(data.applicationStartDate),
    applicationEndDate: asString(data.applicationEndDate),
    programStartDate: asString(data.programStartDate),
    programEndDate: asString(data.programEndDate),
    duration: asString(data.duration),
    gradeRange: asString(data.gradeRange),
    subjectArea: asString(data.subjectArea),
    requirements: asString(data.requirements),
    location: asString(data.location),
    format: isProgramFormat(data.format) ? data.format : "offline",
    costText: asString(data.costText),
    scholarshipText: asString(data.scholarshipText),
    description: asString(data.description),
    coreTopicsText: arrayToText(data.coreTopics),
    highlightsText: arrayToText(data.highlights),
    requiredMaterialsText: arrayToText(data.requiredMaterials),
    tagsText: arrayToText(data.tags),
    applicationMethod: asString(data.applicationMethod),
    capacityLimit: asString(data.capacityLimit),
    status: isProgramStatus(data.status) ? data.status : "draft",
    source: isProgramSource(data.source) ? data.source : "manual"
  };
}

function toProgramDraftData(
  original: unknown,
  form: ProgramDraftForm,
  overrides: Partial<Pick<Program, "status" | "source">> = {}
) {
  return {
    ...asRecord(original),
    name: form.name.trim(),
    type: form.type,
    organization: form.organization.trim() || "待补充",
    officialUrl: form.officialUrl.trim(),
    applicationStartDate: form.applicationStartDate.trim(),
    applicationEndDate: form.applicationEndDate.trim(),
    programStartDate: form.programStartDate.trim(),
    programEndDate: form.programEndDate.trim(),
    duration: form.duration.trim(),
    gradeRange: form.gradeRange.trim() || "待补充",
    subjectArea: form.subjectArea.trim() || "综合",
    requirements: form.requirements.trim(),
    location: form.location.trim() || "待补充",
    format: form.format,
    costText: form.costText.trim(),
    scholarshipText: form.scholarshipText.trim(),
    description: form.description.trim() || "待补充",
    coreTopics: textToArray(form.coreTopicsText),
    highlights: textToArray(form.highlightsText),
    requiredMaterials: textToArray(form.requiredMaterialsText),
    tags: textToArray(form.tagsText),
    applicationMethod: form.applicationMethod.trim(),
    capacityLimit: form.capacityLimit.trim(),
    status: overrides.status ?? form.status,
    source: overrides.source ?? form.source
  };
}

function toCaseDraftForm(value: unknown): CaseDraftForm {
  const data = asRecord(value);
  if (!Object.keys(data).length) {
    return emptyCaseDraftForm;
  }
  const activities = Array.isArray(data.activityExperience)
    ? (data.activityExperience as StudentCase["activityExperience"])
    : [];
  return {
    anonymousCode: asString(data.anonymousCode),
    grade: isCaseGrade(data.grade) ? data.grade : "G11",
    schoolType: isSchoolType(data.schoolType) ? data.schoolType : "international",
    gpaRange: asString(data.gpaRange),
    academicSummary: asString(data.academicSummary),
    activityExperienceText: activityExperienceToText(activities),
    intendedMajor: asString(data.intendedMajor),
    resultSummary: asString(data.resultSummary),
    resultTier: asString(data.resultTier),
    personalSummary: asString(data.personalSummary),
    consultantReview: asString(data.consultantReview),
    tagsText: arrayToText(data.tags),
    status: isProgramStatus(data.status) ? data.status : "draft"
  };
}

function toCaseDraftData(
  form: CaseDraftForm,
  overrides: Partial<Pick<StudentCase, "status">> = {}
) {
  return {
    anonymousCode: form.anonymousCode.trim(),
    grade: form.grade,
    schoolType: form.schoolType,
    gpaRange: form.gpaRange.trim(),
    academicSummary: form.academicSummary.trim(),
    activityExperience: textToActivityExperience(form.activityExperienceText),
    intendedMajor: form.intendedMajor.trim(),
    resultSummary: form.resultSummary.trim(),
    resultTier: form.resultTier.trim(),
    personalSummary: form.personalSummary.trim(),
    consultantReview: form.consultantReview.trim(),
    tags: textToArray(form.tagsText),
    status: overrides.status ?? form.status,
    completeness: 80
  };
}

function statusTone(status: string): "default" | "blue" | "green" | "amber" | "red" {
  if (status === "published" || status === "merged") {
    return "green";
  }
  if (status === "failed" || status === "rejected") {
    return "red";
  }
  if (status === "draft" || status === "parsed") {
    return "blue";
  }
  return "amber";
}

function recordStatusLabel(status: string) {
  const labels: Record<string, string> = {
    all: "全部",
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
    pending_review: "待审核",
    rejected: "已拒绝",
    needs_review: "待补全",
    enabled: "已启用",
    disabled: "已停用"
  };
  return labels[status] ?? status;
}

function qualityTone(level: ImportQualitySummary["level"]): "default" | "blue" | "green" | "amber" | "red" {
  if (level === "error") {
    return "red";
  }
  if (level === "warning") {
    return "amber";
  }
  return "green";
}

function qualityLabel(quality?: ImportQualitySummary) {
  if (!quality) {
    return "未检查";
  }
  if (quality.level === "error") {
    return "需修复";
  }
  if (quality.level === "warning") {
    return "建议完善";
  }
  return "可发布";
}

function qualityStats(items: ImportItemView[] = []) {
  return items
    .filter((item) => item.status === "draft")
    .reduce(
      (stats, item) => {
        const issues = item.quality?.issues ?? [];
        return {
          errors: stats.errors + issues.filter((issue) => issue.severity === "error").length,
          warnings: stats.warnings + issues.filter((issue) => issue.severity === "warning").length
        };
      },
      { errors: 0, warnings: 0 }
    );
}

function hasQualityErrors(job: ImportJobView) {
  return qualityStats(job.items).errors > 0;
}

function updateSelection(current: string[], id: string, checked: boolean) {
  if (checked) {
    return current.includes(id) ? current : [...current, id];
  }
  return current.filter((itemId) => itemId !== id);
}

function useApiList<T>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<T[]>(path);
      setItems(response.data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, reload: load };
}

export function AdminImportPage() {
  const { items: jobs, loading, error, reload } = useApiList<ImportJobView>("/api/admin/import/jobs");
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<UploadSourceType>("program");
  const [uploading, setUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [draftForm, setDraftForm] = useState<ProgramDraftForm>(emptyProgramDraftForm);
  const [caseDraftForm, setCaseDraftForm] = useState<CaseDraftForm>(emptyCaseDraftForm);
  const [savingItemId, setSavingItemId] = useState("");
  const parsedCount = jobs.reduce((total, job) => total + (job.items?.length ?? 0), 0);
  const selectedJob = useMemo(() => {
    return (
      jobs.find((job) => job.id === selectedJobId) ??
      jobs.find((job) => (job.items?.length ?? 0) > 0) ??
      jobs[0]
    );
  }, [jobs, selectedJobId]);
  const selectedItems = selectedJob?.items ?? [];
  const selectedItem = useMemo(() => {
    return selectedItems.find((item) => item.id === selectedItemId) ?? selectedItems[0];
  }, [selectedItemId, selectedItems]);
  const selectedJobIsCase = selectedJob?.sourceType === "case" || selectedItem?.itemType === "case";

  useEffect(() => {
    if (!jobs.length) {
      return;
    }
    if (!selectedJobId || !jobs.some((job) => job.id === selectedJobId)) {
      const nextJob = jobs.find((job) => (job.items?.length ?? 0) > 0) ?? jobs[0];
      setSelectedJobId(nextJob.id);
      setSelectedItemId(nextJob.items?.[0]?.id ?? "");
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (!selectedItems.length) {
      setSelectedItemId("");
      setDraftForm(emptyProgramDraftForm);
      setCaseDraftForm(emptyCaseDraftForm);
      return;
    }
    if (!selectedItemId || !selectedItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(selectedItems[0].id);
      return;
    }
    if (selectedItem) {
      if (selectedItem.itemType === "case" || selectedJob?.sourceType === "case") {
        setCaseDraftForm(toCaseDraftForm(selectedItem.parsedData));
      } else {
        setDraftForm(toProgramDraftForm(selectedItem.parsedData));
      }
    }
  }, [selectedItem, selectedItemId, selectedItems, selectedJob?.sourceType]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const uploadFile = async () => {
    if (!file) {
      setActionMessage("请先选择 DOCX 文件");
      return;
    }

    setUploading(true);
    setActionMessage("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("sourceType", sourceType);
    try {
      await apiFetch<ImportJobView>("/api/admin/import/jobs", {
        method: "POST",
        body: formData
      });
      setFile(null);
      setActionMessage("上传解析完成，已生成预览项。");
      await reload();
    } catch (uploadError) {
      setActionMessage(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const publishJob = async (jobId: string) => {
    setActionMessage("");
    const job = jobs.find((item) => item.id === jobId);
    if (job?.sourceType === "program" && hasQualityErrors(job)) {
      setActionMessage("存在质量检查错误，请修复后再发布。");
      return;
    }
    try {
      await apiFetch<ImportJobView>(`/api/admin/import/jobs/${jobId}/publish`, {
        method: "POST"
      });
      setActionMessage(`已发布到${job?.sourceType === "case" ? "案例库" : "活动库"}。`);
      await reload();
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "操作失败");
    }
  };

  const openPreview = (job: ImportJobView) => {
    setSelectedJobId(job.id);
    setSelectedItemId(job.items?.[0]?.id ?? "");
  };

  const updateDraftField = <K extends keyof ProgramDraftForm>(
    field: K,
    value: ProgramDraftForm[K]
  ) => {
    setDraftForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateCaseDraftField = <K extends keyof CaseDraftForm>(
    field: K,
    value: CaseDraftForm[K]
  ) => {
    setCaseDraftForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const saveSelectedItem = async () => {
    if (!selectedJob || !selectedItem) {
      return;
    }
    if (selectedJobIsCase) {
      if (!caseDraftForm.anonymousCode.trim()) {
        setActionMessage("案例编号不能为空");
        return;
      }
      if (!caseDraftForm.intendedMajor.trim()) {
        setActionMessage("申请方向不能为空");
        return;
      }
      if (!caseDraftForm.resultSummary.trim()) {
        setActionMessage("结果摘要不能为空");
        return;
      }

      setSavingItemId(selectedItem.id);
      setActionMessage("");
      try {
        await apiFetch<ImportItemView>(
          `/api/admin/import/jobs/${selectedJob.id}/items/${selectedItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              title: caseDraftForm.anonymousCode.trim(),
              status: "draft",
              parsedData: toCaseDraftData(caseDraftForm, {
                status: "draft"
              })
            })
          }
        );
        setActionMessage("预览项已保存。");
        await reload();
      } catch (saveError) {
        setActionMessage(saveError instanceof Error ? saveError.message : "保存失败");
      } finally {
        setSavingItemId("");
      }
      return;
    }
    if (!draftForm.name.trim()) {
      setActionMessage("活动名称不能为空");
      return;
    }

    setSavingItemId(selectedItem.id);
    setActionMessage("");
    try {
      await apiFetch<ImportItemView>(
        `/api/admin/import/jobs/${selectedJob.id}/items/${selectedItem.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: draftForm.name.trim(),
            status: "draft",
            parsedData: toProgramDraftData(selectedItem.parsedData, draftForm, {
              status: "draft",
              source: "document_import"
            })
          })
        }
      );
      setActionMessage("预览项已保存。");
      await reload();
    } catch (saveError) {
      setActionMessage(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSavingItemId("");
    }
  };

  const skipSelectedItem = async () => {
    if (!selectedJob || !selectedItem) {
      return;
    }

    setSavingItemId(selectedItem.id);
    setActionMessage("");
    try {
      await apiFetch<ImportItemView>(
        `/api/admin/import/jobs/${selectedJob.id}/items/${selectedItem.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "rejected"
          })
        }
      );
      setActionMessage("该预览项已跳过发布。");
      await reload();
    } catch (skipError) {
      setActionMessage(skipError instanceof Error ? skipError.message : "操作失败");
    } finally {
      setSavingItemId("");
    }
  };

  const mergeSelectedItem = async (programId: string) => {
    if (!selectedJob || !selectedItem) {
      return;
    }
    if (!window.confirm("确认将当前预览项合并到已有活动？")) {
      return;
    }

    setSavingItemId(selectedItem.id);
    setActionMessage("");
    try {
      await apiFetch<{ item: ImportItemView; programId: string }>(
        `/api/admin/import/jobs/${selectedJob.id}/items/${selectedItem.id}/merge`,
        {
          method: "POST",
          body: JSON.stringify({
            programId,
            strategy: "fill_missing"
          })
        }
      );
      setActionMessage("预览项已合并到已有活动。");
      await reload();
    } catch (mergeError) {
      setActionMessage(mergeError instanceof Error ? mergeError.message : "合并失败");
    } finally {
      setSavingItemId("");
    }
  };

  return (
    <div>
      <PageHeading
        description="上传文档后由后端解析为结构化草稿，管理员可直接发布到活动库或案例库。"
        eyebrow="Admin"
        title="文档录入"
      />
      <AdminMetricStrip
        items={[
          { label: "上传任务", value: `${jobs.length}` },
          { label: "已解析条目", value: `${parsedCount}` },
          { label: "已发布任务", value: `${jobs.filter((job) => job.status === "published").length}` },
          { label: "当前预览", value: `${selectedItems.length}` }
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden rounded-md p-0">
          <div className="border-b border-border bg-surface px-5 py-4">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  Upload
                </p>
                <h2 className="mt-1 text-lg font-black tracking-normal text-ink">
                  上传 DOCX 并解析为结构化草稿
                </h2>
                <p className="mt-1 text-sm font-bold leading-6 text-secondary">
                  PDF / XLSX / CSV 先返回不支持类型，上传不会自动发布。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                className="min-h-11 shrink-0 whitespace-nowrap rounded-sm border border-border bg-surface px-3 text-sm font-black text-ink"
                onChange={(event) => setSourceType(event.target.value as UploadSourceType)}
                value={sourceType}
              >
                <option value="program">活动文档</option>
                <option value="case">案例文档</option>
              </select>
              <input
                accept=".docx"
                className="w-full min-w-0 rounded-sm border border-border bg-surface px-3 py-3 text-sm font-bold text-secondary sm:w-[280px] sm:shrink-0"
                onChange={handleFileChange}
                type="file"
              />
              <button
                className="inline-flex min-h-11 min-w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-sm bg-primary px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={uploading}
                onClick={() => void uploadFile()}
                type="button"
              >
                {uploading ? "上传中" : "上传解析"}
              </button>
              </div>
            </div>
            {actionMessage ? (
              <p className="mt-4 rounded-sm border border-border bg-soft px-3 py-2 text-sm font-bold text-secondary">
                {actionMessage}
              </p>
            ) : null}
          </div>

          <div className="px-5 py-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-normal text-ink">上传队列</h2>
                <p className="mt-1 text-sm font-bold text-secondary">
                  共 {jobs.length} 个任务，点击查看预览后在右侧编辑字段。
                </p>
              </div>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() => void reload()}
                type="button"
              >
                刷新队列
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? <p className="text-sm font-bold text-secondary">加载上传队列中...</p> : null}
              {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
              {jobs.map((job) => {
                const stats = qualityStats(job.items);
                return (
                <div
                  className={`rounded-sm border p-4 ${
                    selectedJob?.id === job.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-soft"
                  }`}
                  key={job.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-ink">{job.fileName}</p>
                      <p className="mt-1 text-sm font-bold text-secondary">
                        {job.fileType} / {Math.round(job.fileSize / 1024)} KB / {job.sourceType}
                      </p>
                    </div>
                    <Badge tone={statusTone(job.status)}>{recordStatusLabel(job.status)}</Badge>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  {job.errorMessage ? (
                    <p className="mt-3 text-sm leading-7 text-danger">{job.errorMessage}</p>
                  ) : null}
                  {job.sourceType === "program" && (job.items?.length ?? 0) > 0 ? (
                    <p className="mt-3 text-sm font-bold text-secondary">
                      质量检查：错误 {stats.errors} / 提醒 {stats.warnings}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-ink hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={(job.items?.length ?? 0) === 0}
                      onClick={() => openPreview(job)}
                      type="button"
                    >
                      查看预览 {job.items?.length ?? 0}
                    </button>
                    <button
                      className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        job.status === "failed" ||
                        job.status === "published" ||
                        (job.sourceType !== "program" && job.sourceType !== "case") ||
                        (job.sourceType === "program" && stats.errors > 0)
                      }
                      onClick={() => void publishJob(job.id)}
                      type="button"
                    >
                      发布到{job.sourceType === "case" ? "案例库" : "活动库"}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">结构化预览</h2>
            <dl className="mt-4 space-y-3">
              <AdminStat label="已解析条目" value={`${parsedCount}`} />
              <AdminStat label="已发布任务" value={`${jobs.filter((job) => job.status === "published").length}`} />
              <AdminStat label="来源文档" value={jobs[0]?.fileName ?? "待上传"} />
            </dl>
            {selectedJob ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-extrabold text-ink">{selectedJob.fileName}</p>
                <p className="mt-1 text-xs font-bold text-secondary">
                  预览项 {selectedItems.length} / 待发布{" "}
                  {selectedItems.filter((item) => item.status === "draft").length}
                </p>
                <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
                  {selectedItems.map((item, index) => (
                    <button
                      className={`w-full rounded-sm border px-3 py-3 text-left transition ${
                        item.id === selectedItem?.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-soft hover:border-primary"
                      }`}
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      type="button"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold text-ink">
                            {index + 1}. {item.title}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-secondary">
                            {item.itemType}
                          </span>
                          {item.quality ? (
                            <span className="mt-2 block text-xs font-bold text-secondary">
                              质量 {item.quality.score} / {qualityLabel(item.quality)}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-2">
                          <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                          {item.quality ? (
                            <Badge tone={qualityTone(item.quality.level)}>{qualityLabel(item.quality)}</Badge>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">编辑预览项</h2>
            {selectedItem ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(selectedItem.status)}>{selectedItem.status}</Badge>
                  {selectedItem.quality ? (
                    <Badge tone={qualityTone(selectedItem.quality.level)}>
                      {qualityLabel(selectedItem.quality)} / {selectedItem.quality.score}
                    </Badge>
                  ) : null}
                  <span className="text-sm font-bold text-secondary">{selectedItem.title}</span>
                </div>
                {!selectedJobIsCase ? <ImportQualityPanel quality={selectedItem.quality} /> : null}
                {!selectedJobIsCase && selectedItem.status === "draft" &&
                selectedItem.quality?.duplicatePrograms?.length ? (
                  <div className="rounded-sm border border-warning/25 bg-warning/10 p-4">
                    <h3 className="text-sm font-extrabold text-ink">同名活动候选</h3>
                    <p className="mt-1 text-sm font-bold leading-6 text-secondary">
                      可将当前预览项合并到已有活动。默认只填补空字段，并合并标签、亮点、材料等数组内容。
                    </p>
                    <div className="mt-3 space-y-2">
                      {selectedItem.quality.duplicatePrograms.map((program) => (
                        <div
                          className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-surface px-3 py-3"
                          key={program.id}
                        >
                          <div>
                            <p className="text-sm font-extrabold text-ink">{program.name}</p>
                            <p className="mt-1 text-xs font-bold text-secondary">
                              {program.id} / {program.status}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <TextLink href={`/programs/${program.id}`}>查看</TextLink>
                            <button
                              className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={savingItemId === selectedItem.id}
                              onClick={() => void mergeSelectedItem(program.id)}
                              type="button"
                            >
                              合并到此活动
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selectedJobIsCase ? (
                  <CaseFormFields form={caseDraftForm} onFieldChange={updateCaseDraftField} />
                ) : (
                  <ProgramFormFields form={draftForm} onFieldChange={updateDraftField} />
                )}
                {selectedItem.rawText ? (
                  <details className="rounded-sm border border-border bg-soft p-3 text-sm text-secondary">
                    <summary className="cursor-pointer font-extrabold text-ink">原文片段</summary>
                    <pre className="mt-3 max-h-56 whitespace-pre-wrap text-xs leading-6">
                      {selectedItem.rawText}
                    </pre>
                  </details>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={savingItemId === selectedItem.id || selectedItem.status === "published"}
                    onClick={() => void saveSelectedItem()}
                    type="button"
                  >
                    {savingItemId === selectedItem.id ? "保存中" : "保存预览项"}
                  </button>
                  <button
                    className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-danger disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={savingItemId === selectedItem.id || selectedItem.status === "published"}
                    onClick={() => void skipSelectedItem()}
                    type="button"
                  >
                    跳过发布
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-secondary">选择上传任务后查看解析结果。</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminProgramsPage() {
  const { items: programs, loading, error, reload } = useApiList<Program>("/api/admin/programs?pageSize=100");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [programForm, setProgramForm] = useState<ProgramDraftForm>(emptyProgramDraftForm);
  const [programFormOpen, setProgramFormOpen] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [programMessage, setProgramMessage] = useState("");
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState("all");
  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
  const filteredPrograms = useMemo(() => {
    const query = programSearch.trim().toLowerCase();
    return programs.filter((program) => {
      const statusMatch =
        programStatusFilter === "all" ||
        (programStatusFilter === "needs_review"
          ? program.completeness < 80
          : program.status === programStatusFilter);
      if (!statusMatch) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        program.name,
        program.type,
        program.organization,
        program.gradeRange,
        program.subjectArea,
        program.location,
        program.status,
        ...program.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [programSearch, programStatusFilter, programs]);
  const programStatusTabs = [
    { label: "全部", value: "all", count: programs.length },
    { label: "草稿", value: "draft", count: programs.filter((program) => program.status === "draft").length },
    { label: "已发布", value: "published", count: programs.filter((program) => program.status === "published").length },
    { label: "待补全", value: "needs_review", count: programs.filter((program) => program.completeness < 80).length },
    { label: "已归档", value: "archived", count: programs.filter((program) => program.status === "archived").length }
  ];
  const selectableProgramIds = programs
    .filter((program) => program.status !== "archived")
    .map((program) => program.id);
  const visibleSelectableProgramIds = filteredPrograms
    .filter((program) => program.status !== "archived")
    .map((program) => program.id);

  const startCreateProgram = () => {
    setMode("create");
    setSelectedProgramId("");
    setProgramForm(emptyProgramDraftForm);
    setProgramMessage("");
    setProgramFormOpen(true);
  };

  const startEditProgram = (program: Program) => {
    setMode("edit");
    setSelectedProgramId(program.id);
    setProgramForm(toProgramDraftForm(program));
    setProgramMessage("");
    setProgramFormOpen(true);
  };

  const updateProgramField = <K extends keyof ProgramDraftForm>(
    field: K,
    value: ProgramDraftForm[K]
  ) => {
    setProgramForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const saveProgram = async () => {
    if (!programForm.name.trim()) {
      setProgramMessage("活动名称不能为空");
      return;
    }

    setSavingProgram(true);
    setProgramMessage("");
    const payload = toProgramDraftData(selectedProgram ?? {}, programForm, {
      source: mode === "create" ? "manual" : programForm.source
    });
    try {
      const response = await apiFetch<Program>(
        mode === "edit" && selectedProgram ? `/api/admin/programs/${selectedProgram.id}` : "/api/admin/programs",
        {
          method: mode === "edit" && selectedProgram ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );
      setProgramMessage(mode === "edit" ? "活动已保存。" : "活动已创建。");
      setMode("edit");
      setSelectedProgramId(response.data.id);
      setProgramForm(toProgramDraftForm(response.data));
      await reload();
      setProgramFormOpen(false);
    } catch (saveError) {
      setProgramMessage(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSavingProgram(false);
    }
  };

  const archiveProgram = async () => {
    if (!selectedProgram) {
      return;
    }
    if (!window.confirm(`确认归档「${selectedProgram.name}」？`)) {
      return;
    }

    setSavingProgram(true);
    setProgramMessage("");
    try {
      await apiFetch<Program>(`/api/admin/programs/${selectedProgram.id}`, {
        method: "DELETE"
      });
      setProgramMessage("活动已归档。");
      await reload();
      setMode("create");
      setSelectedProgramId("");
      setProgramForm(emptyProgramDraftForm);
      setProgramFormOpen(false);
    } catch (archiveError) {
      setProgramMessage(archiveError instanceof Error ? archiveError.message : "归档失败");
    } finally {
      setSavingProgram(false);
    }
  };

  const bulkArchivePrograms = async () => {
    const ids = selectedProgramIds.filter((id) => selectableProgramIds.includes(id));
    if (!ids.length) {
      setProgramMessage("请先选择要归档的活动");
      return;
    }
    if (!window.confirm(`确认批量归档 ${ids.length} 个活动？`)) {
      return;
    }

    setSavingProgram(true);
    setProgramMessage("");
    try {
      await Promise.all(
        ids.map((programId) =>
          apiFetch<Program>(`/api/admin/programs/${programId}`, {
            method: "DELETE"
          })
        )
      );
      setSelectedProgramIds([]);
      setProgramMessage(`已归档 ${ids.length} 个活动。`);
      await reload();
      if (selectedProgram && ids.includes(selectedProgram.id)) {
        setMode("create");
        setSelectedProgramId("");
        setProgramForm(emptyProgramDraftForm);
        setProgramFormOpen(false);
      }
    } catch (bulkError) {
      setProgramMessage(bulkError instanceof Error ? bulkError.message : "批量归档失败");
    } finally {
      setSavingProgram(false);
    }
  };

  return (
    <div>
      <PageHeading
        description="运营人员维护活动资料、完整度和发布状态。"
        eyebrow="Admin"
        actions={
          <button
            className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white"
            onClick={startCreateProgram}
            type="button"
          >
            新增活动
          </button>
        }
        title="活动管理"
      />
      <AdminMetricStrip
        items={[
          { label: "活动总数", value: `${programs.length}` },
          { label: "已发布", value: `${programs.filter((program) => program.status === "published").length}` },
          { label: "待补全", value: `${programs.filter((program) => program.completeness < 80).length}` },
          { label: "当前筛选", value: `${filteredPrograms.length}` }
        ]}
      />
      <Card className="overflow-hidden rounded-md p-0">
          <AdminListToolbar
            count={filteredPrograms.length}
            description="点击活动名称或编辑按钮打开右侧维护抽屉。"
            searchPlaceholder="搜索名称、主办方、学科、地点或标签"
            searchValue={programSearch}
            selectedCount={selectedProgramIds.length}
            title="活动列表"
            onSearchChange={setProgramSearch}
          >
            <AdminStatusTabs
              onChange={setProgramStatusFilter}
              options={programStatusTabs}
              value={programStatusFilter}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() =>
                  setSelectedProgramIds(
                    selectedProgramIds.length === visibleSelectableProgramIds.length
                      ? []
                      : visibleSelectableProgramIds
                  )
                }
                type="button"
              >
                {selectedProgramIds.length === visibleSelectableProgramIds.length ? "取消全选" : "全选当前"}
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-danger hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingProgram || selectedProgramIds.length === 0}
                onClick={() => void bulkArchivePrograms()}
                type="button"
              >
                批量归档
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() => void reload()}
                type="button"
              >
                刷新
              </button>
            </div>
          </AdminListToolbar>
          {loading ? <p className="mt-4 text-sm font-bold text-secondary">加载活动列表中...</p> : null}
          {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
          {programMessage ? (
            <p className="mx-5 mt-4 rounded-sm border border-border bg-soft px-3 py-2 text-sm font-bold text-secondary">{programMessage}</p>
          ) : null}
          {!loading && !error ? (
            <div>
              <DataTable
                headers={["选择", "活动名称", "类型", "年级/方向", "形式", "完整度", "状态", "操作"]}
                rows={filteredPrograms.map((program) => [
                  <input
                    checked={selectedProgramIds.includes(program.id)}
                    className="h-4 w-4 accent-primary"
                    disabled={program.status === "archived"}
                    key={`select-${program.id}`}
                    onChange={(event) =>
                      setSelectedProgramIds((current) =>
                        updateSelection(current, program.id, event.target.checked)
                      )
                    }
                    type="checkbox"
                  />,
                  <button
                    className="text-left font-extrabold text-ink hover:text-primary"
                    key={`edit-${program.id}`}
                    onClick={() => startEditProgram(program)}
                    type="button"
                  >
                    {program.name}
                  </button>,
                  program.type,
                  `${program.gradeRange || "待补"} / ${program.subjectArea || "待补"}`,
                  program.format,
                  `${program.completeness}%`,
                  <Badge key={`status-${program.id}`} tone={statusTone(program.status)}>
                    {recordStatusLabel(program.status)}
                  </Badge>,
                  <AdminRowActions
                    key={`actions-${program.id}`}
                    onEdit={() => startEditProgram(program)}
                    viewHref={`/programs/${program.id}`}
                  />
                ])}
              />
            </div>
          ) : null}
      </Card>

      {programFormOpen ? (
        <AdminModal
          badge={
            mode === "edit" && selectedProgram ? (
              <Badge tone={statusTone(selectedProgram.status)}>{selectedProgram.status}</Badge>
            ) : null
          }
          description={
            mode === "create" ? "手动录入运营活动资料" : selectedProgram?.name ?? "选择活动后编辑"
          }
          onClose={() => setProgramFormOpen(false)}
          title={mode === "create" ? "新增活动" : "编辑活动"}
        >
          <div className="space-y-4">
            <ProgramFormFields form={programForm} onFieldChange={updateProgramField} showStatus />
            {programMessage ? (
              <p className="text-sm font-bold text-secondary">{programMessage}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingProgram}
                onClick={() => void saveProgram()}
                type="button"
              >
                {savingProgram ? "保存中" : mode === "create" ? "创建活动" : "保存修改"}
              </button>
              {mode === "edit" && selectedProgram ? (
                <button
                  className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-danger disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={savingProgram || selectedProgram.status === "archived"}
                  onClick={() => void archiveProgram()}
                  type="button"
                >
                  归档活动
                </button>
              ) : null}
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

export function AdminCasesPage() {
  const { items: cases, loading, error, reload } = useApiList<StudentCase>("/api/admin/cases?pageSize=100");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseForm, setCaseForm] = useState<CaseDraftForm>(emptyCaseDraftForm);
  const [caseFormOpen, setCaseFormOpen] = useState(false);
  const [savingCase, setSavingCase] = useState(false);
  const [caseMessage, setCaseMessage] = useState("");
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [caseSearch, setCaseSearch] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");
  const selectedCase = cases.find((studentCase) => studentCase.id === selectedCaseId);
  const filteredCases = useMemo(() => {
    const query = caseSearch.trim().toLowerCase();
    return cases.filter((studentCase) => {
      const statusMatch =
        caseStatusFilter === "all" ||
        (caseStatusFilter === "needs_review"
          ? studentCase.completeness < 80
          : studentCase.status === caseStatusFilter);
      if (!statusMatch) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        studentCase.anonymousCode,
        studentCase.grade,
        studentCase.schoolType,
        studentCase.gpaRange,
        studentCase.intendedMajor,
        studentCase.resultSummary,
        studentCase.resultTier,
        studentCase.status,
        ...studentCase.tags,
        ...studentCase.activityExperience.map((activity) => activity.programName)
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [caseSearch, caseStatusFilter, cases]);
  const caseStatusTabs = [
    { label: "全部", value: "all", count: cases.length },
    { label: "草稿", value: "draft", count: cases.filter((studentCase) => studentCase.status === "draft").length },
    { label: "已发布", value: "published", count: cases.filter((studentCase) => studentCase.status === "published").length },
    { label: "待补全", value: "needs_review", count: cases.filter((studentCase) => studentCase.completeness < 80).length },
    { label: "已归档", value: "archived", count: cases.filter((studentCase) => studentCase.status === "archived").length }
  ];
  const selectableCaseIds = cases
    .filter((studentCase) => studentCase.status !== "archived")
    .map((studentCase) => studentCase.id);
  const visibleSelectableCaseIds = filteredCases
    .filter((studentCase) => studentCase.status !== "archived")
    .map((studentCase) => studentCase.id);

  const startCreateCase = () => {
    setMode("create");
    setSelectedCaseId("");
    setCaseForm(emptyCaseDraftForm);
    setCaseMessage("");
    setCaseFormOpen(true);
  };

  const startEditCase = (studentCase: StudentCase) => {
    setMode("edit");
    setSelectedCaseId(studentCase.id);
    setCaseForm(toCaseDraftForm(studentCase));
    setCaseMessage("");
    setCaseFormOpen(true);
  };

  const updateCaseField = <K extends keyof CaseDraftForm>(field: K, value: CaseDraftForm[K]) => {
    setCaseForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const saveCase = async () => {
    if (!caseForm.anonymousCode.trim()) {
      setCaseMessage("案例编号不能为空");
      return;
    }
    if (!caseForm.intendedMajor.trim()) {
      setCaseMessage("申请方向不能为空");
      return;
    }
    if (!caseForm.resultSummary.trim()) {
      setCaseMessage("结果摘要不能为空");
      return;
    }

    setSavingCase(true);
    setCaseMessage("");
    try {
      const response = await apiFetch<StudentCase>(
        mode === "edit" && selectedCase ? `/api/admin/cases/${selectedCase.id}` : "/api/admin/cases",
        {
          method: mode === "edit" && selectedCase ? "PATCH" : "POST",
          body: JSON.stringify(toCaseDraftData(caseForm))
        }
      );
      setCaseMessage(mode === "edit" ? "案例已保存。" : "案例已创建。");
      setMode("edit");
      setSelectedCaseId(response.data.id);
      setCaseForm(toCaseDraftForm(response.data));
      await reload();
      setCaseFormOpen(false);
    } catch (saveError) {
      setCaseMessage(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSavingCase(false);
    }
  };

  const archiveCase = async () => {
    if (!selectedCase) {
      return;
    }
    if (!window.confirm(`确认归档「${selectedCase.anonymousCode}」？`)) {
      return;
    }

    setSavingCase(true);
    setCaseMessage("");
    try {
      await apiFetch<StudentCase>(`/api/admin/cases/${selectedCase.id}`, {
        method: "DELETE"
      });
      setCaseMessage("案例已归档。");
      await reload();
      setMode("create");
      setSelectedCaseId("");
      setCaseForm(emptyCaseDraftForm);
      setCaseFormOpen(false);
    } catch (archiveError) {
      setCaseMessage(archiveError instanceof Error ? archiveError.message : "归档失败");
    } finally {
      setSavingCase(false);
    }
  };

  const bulkArchiveCases = async () => {
    const ids = selectedCaseIds.filter((id) => selectableCaseIds.includes(id));
    if (!ids.length) {
      setCaseMessage("请先选择要归档的案例");
      return;
    }
    if (!window.confirm(`确认批量归档 ${ids.length} 个案例？`)) {
      return;
    }

    setSavingCase(true);
    setCaseMessage("");
    try {
      await Promise.all(
        ids.map((caseId) =>
          apiFetch<StudentCase>(`/api/admin/cases/${caseId}`, {
            method: "DELETE"
          })
        )
      );
      setSelectedCaseIds([]);
      setCaseMessage(`已归档 ${ids.length} 个案例。`);
      await reload();
      if (selectedCase && ids.includes(selectedCase.id)) {
        setMode("create");
        setSelectedCaseId("");
        setCaseForm(emptyCaseDraftForm);
        setCaseFormOpen(false);
      }
    } catch (bulkError) {
      setCaseMessage(bulkError instanceof Error ? bulkError.message : "批量归档失败");
    } finally {
      setSavingCase(false);
    }
  };

  return (
    <div>
      <PageHeading
        description="维护匿名案例、活动路径、结果摘要和关联活动。"
        eyebrow="Admin"
        actions={
          <button
            className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white"
            onClick={startCreateCase}
            type="button"
          >
            新增案例
          </button>
        }
        title="案例管理"
      />
      <AdminMetricStrip
        items={[
          { label: "案例总数", value: `${cases.length}` },
          { label: "已发布", value: `${cases.filter((studentCase) => studentCase.status === "published").length}` },
          { label: "平均活动数", value: `${averageCaseActivities(cases)}` },
          { label: "当前筛选", value: `${filteredCases.length}` }
        ]}
      />
      <Card className="overflow-hidden rounded-md p-0">
          <AdminListToolbar
            count={filteredCases.length}
            description="按匿名编号、申请方向、结果或活动经历快速定位案例。"
            searchPlaceholder="搜索案例 ID、方向、结果、活动或标签"
            searchValue={caseSearch}
            selectedCount={selectedCaseIds.length}
            title="案例列表"
            onSearchChange={setCaseSearch}
          >
            <AdminStatusTabs
              onChange={setCaseStatusFilter}
              options={caseStatusTabs}
              value={caseStatusFilter}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() =>
                  setSelectedCaseIds(
                    selectedCaseIds.length === visibleSelectableCaseIds.length
                      ? []
                      : visibleSelectableCaseIds
                  )
                }
                type="button"
              >
                {selectedCaseIds.length === visibleSelectableCaseIds.length ? "取消全选" : "全选当前"}
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-danger hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingCase || selectedCaseIds.length === 0}
                onClick={() => void bulkArchiveCases()}
                type="button"
              >
                批量归档
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() => void reload()}
                type="button"
              >
                刷新
              </button>
            </div>
          </AdminListToolbar>
          {loading ? <p className="mt-4 text-sm font-bold text-secondary">加载案例列表中...</p> : null}
          {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
          {caseMessage ? (
            <p className="mx-5 mt-4 rounded-sm border border-border bg-soft px-3 py-2 text-sm font-bold text-secondary">{caseMessage}</p>
          ) : null}
          {!loading && !error ? (
            <div>
              <DataTable
                headers={["选择", "案例 ID", "背景", "申请方向", "结果等级", "活动数", "状态", "操作"]}
                rows={filteredCases.map((studentCase) => [
                  <input
                    checked={selectedCaseIds.includes(studentCase.id)}
                    className="h-4 w-4 accent-primary"
                    disabled={studentCase.status === "archived"}
                    key={`select-${studentCase.id}`}
                    onChange={(event) =>
                      setSelectedCaseIds((current) =>
                        updateSelection(current, studentCase.id, event.target.checked)
                      )
                    }
                    type="checkbox"
                  />,
                  <button
                    className="text-left font-extrabold text-ink hover:text-primary"
                    key={`edit-${studentCase.id}`}
                    onClick={() => startEditCase(studentCase)}
                    type="button"
                  >
                    {studentCase.anonymousCode}
                  </button>,
                  `${studentCase.grade} / ${studentCase.schoolType} / ${studentCase.gpaRange}`,
                  studentCase.intendedMajor,
                  studentCase.resultTier || "待补",
                  `${studentCase.activityExperience.length}`,
                  <Badge key={`status-${studentCase.id}`} tone={statusTone(studentCase.status)}>
                    {recordStatusLabel(studentCase.status)}
                  </Badge>,
                  <AdminRowActions
                    key={`actions-${studentCase.id}`}
                    onEdit={() => startEditCase(studentCase)}
                    viewHref={`/cases/${studentCase.id}`}
                  />
                ])}
              />
            </div>
          ) : null}
      </Card>

      {caseFormOpen ? (
        <AdminModal
          badge={
            mode === "edit" && selectedCase ? (
              <Badge tone={statusTone(selectedCase.status)}>{selectedCase.status}</Badge>
            ) : null
          }
          description={
            mode === "create" ? "手动录入匿名学生路径" : selectedCase?.anonymousCode ?? "选择案例后编辑"
          }
          onClose={() => setCaseFormOpen(false)}
          title={mode === "create" ? "新增案例" : "编辑案例"}
        >
          <div className="space-y-4">
            <CaseFormFields form={caseForm} onFieldChange={updateCaseField} />
            {caseMessage ? (
              <p className="text-sm font-bold text-secondary">{caseMessage}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingCase}
                onClick={() => void saveCase()}
                type="button"
              >
                {savingCase ? "保存中" : mode === "create" ? "创建案例" : "保存修改"}
              </button>
              {mode === "edit" && selectedCase ? (
                <button
                  className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-danger disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={savingCase || selectedCase.status === "archived"}
                  onClick={() => void archiveCase()}
                  type="button"
                >
                  归档案例
                </button>
              ) : null}
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

export function AdminRelationsPage() {
  const {
    items: relations,
    loading: relationsLoading,
    error: relationsError,
    reload: reloadRelations
  } = useApiList<RelationView>("/api/admin/relations?pageSize=100");
  const {
    items: programs,
    loading: programsLoading,
    error: programsError,
    reload: reloadPrograms
  } = useApiList<Program>("/api/admin/programs?pageSize=100");
  const {
    items: cases,
    loading: casesLoading,
    error: casesError,
    reload: reloadCases
  } = useApiList<StudentCase>("/api/admin/cases?pageSize=100");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [relationType, setRelationType] =
    useState<ProgramCaseRelation["relationType"]>("participated");
  const [reasonsText, setReasonsText] = useState("");
  const [relationSearch, setRelationSearch] = useState("");
  const [relationFormOpen, setRelationFormOpen] = useState(false);
  const [savingRelation, setSavingRelation] = useState(false);
  const [relationMessage, setRelationMessage] = useState("");

  const activePrograms = useMemo(
    () => programs.filter((program) => program.status !== "archived"),
    [programs]
  );
  const activeCases = useMemo(
    () => cases.filter((studentCase) => studentCase.status !== "archived"),
    [cases]
  );
  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
  const selectedCase = cases.find((studentCase) => studentCase.id === selectedCaseId);
  const existingRelation = relations.find(
    (relation) =>
      relation.programId === selectedProgramId &&
      relation.caseId === selectedCaseId &&
      relation.relationType === relationType
  );
  const selectedProgramRelations = relations.filter(
    (relation) => relation.programId === selectedProgramId
  );
  const selectedCaseRelations = relations.filter((relation) => relation.caseId === selectedCaseId);
  const filteredRelations = useMemo(() => {
    const q = relationSearch.trim().toLowerCase();
    if (!q) {
      return relations;
    }
    return relations.filter((relation) =>
      [
        relation.programName,
        relation.anonymousCode,
        relationTypeLabel(relation.relationType),
        relation.relationType,
        ...(relation.reasons ?? [])
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [relationSearch, relations]);

  useEffect(() => {
    if (!selectedProgramId && activePrograms[0]) {
      setSelectedProgramId(activePrograms[0].id);
    }
  }, [activePrograms, selectedProgramId]);

  useEffect(() => {
    if (!selectedCaseId && activeCases[0]) {
      setSelectedCaseId(activeCases[0].id);
    }
  }, [activeCases, selectedCaseId]);

  const reloadAllRelationData = async () => {
    await Promise.all([reloadRelations(), reloadPrograms(), reloadCases()]);
  };

  const createRelation = async () => {
    if (!selectedProgramId) {
      setRelationMessage("请先选择活动");
      return;
    }
    if (!selectedCaseId) {
      setRelationMessage("请先选择案例");
      return;
    }
    if (existingRelation) {
      setRelationMessage("该活动与案例已存在相同类型的关联");
      return;
    }

    setSavingRelation(true);
    setRelationMessage("");
    try {
      await apiFetch<ProgramCaseRelation>("/api/admin/relations", {
        method: "POST",
        body: JSON.stringify({
          programId: selectedProgramId,
          caseId: selectedCaseId,
          relationType,
          reasons: textToArray(reasonsText)
        })
      });
      setReasonsText("");
      setRelationMessage("关联已创建。");
      await reloadRelations();
      setRelationFormOpen(false);
    } catch (createError) {
      setRelationMessage(createError instanceof Error ? createError.message : "创建关联失败");
    } finally {
      setSavingRelation(false);
    }
  };

  const deleteRelation = async (relation: RelationView) => {
    if (!window.confirm(`确认移除「${relation.programName}」与「${relation.anonymousCode}」的关联？`)) {
      return;
    }

    setSavingRelation(true);
    setRelationMessage("");
    try {
      await apiFetch<{ success: boolean }>(`/api/admin/relations/${relation.id}`, {
        method: "DELETE"
      });
      setRelationMessage("关联已移除。");
      await reloadRelations();
    } catch (deleteError) {
      setRelationMessage(deleteError instanceof Error ? deleteError.message : "移除关联失败");
    } finally {
      setSavingRelation(false);
    }
  };

  return (
    <div>
      <PageHeading
        description="维护活动与匿名案例之间的显式关联，前台详情页会展示这些相关路径。"
        eyebrow="Admin"
        actions={
          <>
            <button
              className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white"
              onClick={() => {
                setRelationMessage("");
                setRelationFormOpen(true);
              }}
              type="button"
            >
              新增关联
            </button>
            <button
              className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-primary hover:border-primary"
              onClick={() => void reloadAllRelationData()}
              type="button"
            >
              刷新数据
            </button>
          </>
        }
        title="关联管理"
      />
      <AdminMetricStrip
        items={[
          { label: "关联总数", value: `${relations.length}` },
          { label: "活动数量", value: `${activePrograms.length}` },
          { label: "案例数量", value: `${activeCases.length}` },
          { label: "当前筛选", value: `${filteredRelations.length}` }
        ]}
      />
      <Card className="overflow-hidden rounded-md p-0">
          <AdminListToolbar
            count={filteredRelations.length}
            description="从活动或案例入口都能反查关联路径。"
            searchPlaceholder="搜索活动、案例或关联理由"
            searchValue={relationSearch}
            selectedCount={0}
            title="已建立关联"
            onSearchChange={setRelationSearch}
          >
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() => void reloadAllRelationData()}
                type="button"
              >
                刷新数据
              </button>
            </div>
          </AdminListToolbar>
          {relationsLoading ? (
            <p className="mt-4 text-sm font-bold text-secondary">加载关联数据中...</p>
          ) : null}
          {relationsError ? (
            <p className="mt-4 text-sm font-bold text-danger">{relationsError}</p>
          ) : null}
          {relationMessage ? (
            <p className="mx-5 mt-4 rounded-sm border border-border bg-soft px-3 py-2 text-sm font-bold text-secondary">{relationMessage}</p>
          ) : null}
          {!relationsLoading && !relationsError ? (
            <div>
              <DataTable
                headers={["活动", "案例", "关系", "理由", "操作"]}
                rows={filteredRelations.map((relation) => [
                  <div className="space-y-1" key={`program-${relation.id}`}>
                    <button
                      className="text-left font-extrabold text-ink hover:text-primary"
                      onClick={() => setSelectedProgramId(relation.programId)}
                      type="button"
                    >
                      {relation.programName}
                    </button>
                    <TextLink href={`/programs/${relation.programId}`}>查看活动</TextLink>
                  </div>,
                  <div className="space-y-1" key={`case-${relation.id}`}>
                    <button
                      className="text-left font-extrabold text-ink hover:text-primary"
                      onClick={() => setSelectedCaseId(relation.caseId)}
                      type="button"
                    >
                      {relation.anonymousCode}
                    </button>
                    <TextLink href={`/cases/${relation.caseId}`}>查看案例</TextLink>
                  </div>,
                  relationTypeLabel(relation.relationType),
                  relation.reasons?.length ? relation.reasons.join("、") : "未填写",
                  <button
                    className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-danger hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={savingRelation}
                    key={`delete-${relation.id}`}
                    onClick={() => void deleteRelation(relation)}
                    type="button"
                  >
                    移除
                  </button>
                ])}
              />
            </div>
          ) : null}
      </Card>

      {relationFormOpen ? (
        <AdminModal
          badge={existingRelation ? <Badge tone="amber">已存在</Badge> : <Badge tone="blue">新关联</Badge>}
          description="选择一条活动和一条案例，建立运营维护关系。"
          onClose={() => setRelationFormOpen(false)}
          title="新增关联"
        >
          <div className="space-y-4">
            {programsLoading || casesLoading ? (
              <p className="text-sm font-bold text-secondary">加载活动和案例中...</p>
            ) : null}
            {programsError || casesError ? (
              <p className="text-sm font-bold text-danger">{programsError || casesError}</p>
            ) : null}
            <DraftSelectField
              label="选择活动"
              onChange={(value) => setSelectedProgramId(value)}
              options={activePrograms.map((program) => ({
                label: program.name,
                value: program.id
              }))}
              value={selectedProgramId}
            />
            <DraftSelectField
              label="选择案例"
              onChange={(value) => setSelectedCaseId(value)}
              options={activeCases.map((studentCase) => ({
                label: `${studentCase.anonymousCode} / ${studentCase.grade} / ${studentCase.intendedMajor}`,
                value: studentCase.id
              }))}
              value={selectedCaseId}
            />
            <DraftSelectField
              label="关联类型"
              onChange={(value) => setRelationType(value)}
              options={relationTypeOptions}
              value={relationType}
            />
            <DraftTextField
              label="关联理由"
              onChange={setReasonsText}
              textarea
              value={reasonsText}
            />

            <div className="rounded-sm border border-border bg-soft p-4">
              <h3 className="text-sm font-extrabold text-ink">当前选择</h3>
              <dl className="mt-3 space-y-3">
                <AdminStat label="活动" value={selectedProgram?.name ?? "未选择"} />
                <AdminStat label="案例" value={selectedCase?.anonymousCode ?? "未选择"} />
                <AdminStat label="类型" value={relationTypeLabel(relationType)} />
                <AdminStat label="该活动已有案例" value={`${selectedProgramRelations.length}`} />
                <AdminStat label="该案例已有活动" value={`${selectedCaseRelations.length}`} />
              </dl>
            </div>

            {relationMessage ? (
              <p className="text-sm font-bold text-secondary">{relationMessage}</p>
            ) : null}
            <button
              className="min-h-11 w-full rounded-sm bg-primary px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={savingRelation || !selectedProgramId || !selectedCaseId || Boolean(existingRelation)}
              onClick={() => void createRelation()}
              type="button"
            >
              {savingRelation ? "保存中" : "创建关联"}
            </button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

export function AdminTagsPage() {
  const { items: tags, loading, error, reload } = useApiList<TagView>("/api/admin/tags");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [tagForm, setTagForm] = useState<TagDraftForm>(emptyTagDraftForm);
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [tagMessage, setTagMessage] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagGroupFilter, setTagGroupFilter] = useState("all");
  const [tagStateFilter, setTagStateFilter] = useState("all");
  const selectedTag = tags.find((tag) => tag.id === selectedTagId);
  const filteredTags = useMemo(() => {
    const query = tagSearch.trim().toLowerCase();
    return tags.filter((tag) => {
      const groupMatch = tagGroupFilter === "all" || tag.group === tagGroupFilter;
      const stateMatch =
        tagStateFilter === "all" ||
        (tagStateFilter === "enabled" ? tag.enabled : !tag.enabled);
      if (!groupMatch || !stateMatch) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [tag.name, tag.group, tagGroupLabel(tag.group)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [tagGroupFilter, tagSearch, tagStateFilter, tags]);
  const tagStateTabs = [
    { label: "全部", value: "all", count: tags.length },
    { label: "已启用", value: "enabled", count: tags.filter((tag) => tag.enabled).length },
    { label: "已停用", value: "disabled", count: tags.filter((tag) => !tag.enabled).length }
  ];
  const selectableTagIds = tags.filter((tag) => tag.enabled).map((tag) => tag.id);
  const visibleSelectableTagIds = filteredTags.filter((tag) => tag.enabled).map((tag) => tag.id);

  const startCreateTag = () => {
    setMode("create");
    setSelectedTagId("");
    setTagForm(emptyTagDraftForm);
    setTagMessage("");
    setTagFormOpen(true);
  };

  const startEditTag = (tag: TagView) => {
    setMode("edit");
    setSelectedTagId(tag.id);
    setTagForm({
      name: tag.name,
      group: tag.group,
      enabled: tag.enabled
    });
    setTagMessage("");
    setTagFormOpen(true);
  };

  const updateTagField = <K extends keyof TagDraftForm>(field: K, value: TagDraftForm[K]) => {
    setTagForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const saveTag = async () => {
    if (!tagForm.name.trim()) {
      setTagMessage("标签名称不能为空");
      return;
    }

    setSavingTag(true);
    setTagMessage("");
    try {
      const response = await apiFetch<TagView>(
        mode === "edit" && selectedTag ? `/api/admin/tags/${selectedTag.id}` : "/api/admin/tags",
        {
          method: mode === "edit" && selectedTag ? "PATCH" : "POST",
          body: JSON.stringify({
            name: tagForm.name.trim(),
            group: tagForm.group,
            enabled: tagForm.enabled
          })
        }
      );
      setTagMessage(mode === "edit" ? "标签已保存。" : "标签已创建。");
      setMode("edit");
      setSelectedTagId(response.data.id);
      setTagForm({
        name: response.data.name,
        group: response.data.group,
        enabled: response.data.enabled
      });
      await reload();
      setTagFormOpen(false);
    } catch (saveError) {
      setTagMessage(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSavingTag(false);
    }
  };

  const toggleSelectedTag = async () => {
    if (!selectedTag) {
      return;
    }

    setSavingTag(true);
    setTagMessage("");
    try {
      const response = await apiFetch<TagView>(`/api/admin/tags/${selectedTag.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          enabled: !selectedTag.enabled
        })
      });
      setTagMessage(response.data.enabled ? "标签已启用。" : "标签已停用。");
      setTagForm({
        name: response.data.name,
        group: response.data.group,
        enabled: response.data.enabled
      });
      await reload();
    } catch (toggleError) {
      setTagMessage(toggleError instanceof Error ? toggleError.message : "操作失败");
    } finally {
      setSavingTag(false);
    }
  };

  const disableSelectedTag = async () => {
    if (!selectedTag) {
      return;
    }
    if (!window.confirm(`确认停用「${selectedTag.name}」？`)) {
      return;
    }

    setSavingTag(true);
    setTagMessage("");
    try {
      await apiFetch<TagView>(`/api/admin/tags/${selectedTag.id}`, {
        method: "DELETE"
      });
      setTagMessage("标签已停用。");
      await reload();
      setMode("create");
      setSelectedTagId("");
      setTagForm(emptyTagDraftForm);
      setTagFormOpen(false);
    } catch (disableError) {
      setTagMessage(disableError instanceof Error ? disableError.message : "停用失败");
    } finally {
      setSavingTag(false);
    }
  };

  const bulkDisableTags = async () => {
    const ids = selectedTagIds.filter((id) => selectableTagIds.includes(id));
    if (!ids.length) {
      setTagMessage("请先选择要停用的标签");
      return;
    }
    if (!window.confirm(`确认批量停用 ${ids.length} 个标签？`)) {
      return;
    }

    setSavingTag(true);
    setTagMessage("");
    try {
      await Promise.all(
        ids.map((tagId) =>
          apiFetch<TagView>(`/api/admin/tags/${tagId}`, {
            method: "DELETE"
          })
        )
      );
      setSelectedTagIds([]);
      setTagMessage(`已停用 ${ids.length} 个标签。`);
      await reload();
      if (selectedTag && ids.includes(selectedTag.id)) {
        setMode("create");
        setSelectedTagId("");
        setTagForm(emptyTagDraftForm);
        setTagFormOpen(false);
      }
    } catch (bulkError) {
      setTagMessage(bulkError instanceof Error ? bulkError.message : "批量停用失败");
    } finally {
      setSavingTag(false);
    }
  };

  return (
    <div>
      <PageHeading
        description="维护基础标签体系：活动类型、学科、年级、地点和形式。不包含规则权重。"
        eyebrow="Admin"
        actions={
          <button
            className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white"
            onClick={startCreateTag}
            type="button"
          >
            新增标签
          </button>
        }
        title="标签管理"
      />
      <AdminMetricStrip
        items={[
          { label: "标签总数", value: `${tags.length}` },
          { label: "已启用", value: `${tags.filter((tag) => tag.enabled).length}` },
          { label: "分组数量", value: `${new Set(tags.map((tag) => tag.group)).size}` },
          { label: "当前筛选", value: `${filteredTags.length}` }
        ]}
      />
      <Card className="overflow-hidden rounded-md p-0">
          <AdminListToolbar
            count={filteredTags.length}
            description="按分组维护活动库和案例库使用的基础筛选字典。"
            searchPlaceholder="搜索标签名称或分组"
            searchValue={tagSearch}
            selectedCount={selectedTagIds.length}
            title="标签列表"
            onSearchChange={setTagSearch}
          >
            <AdminStatusTabs
              onChange={setTagStateFilter}
              options={tagStateTabs}
              value={tagStateFilter}
            />
            <div className="flex flex-wrap gap-2">
              <select
                className="min-h-9 rounded-sm border border-border bg-surface px-3 text-xs font-black text-ink outline-none focus:border-primary"
                onChange={(event) => setTagGroupFilter(event.target.value)}
                value={tagGroupFilter}
              >
                <option value="all">全部分组</option>
                {tagGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() =>
                  setSelectedTagIds(
                    selectedTagIds.length === visibleSelectableTagIds.length
                      ? []
                      : visibleSelectableTagIds
                  )
                }
                type="button"
              >
                {selectedTagIds.length === visibleSelectableTagIds.length ? "取消全选" : "全选当前"}
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-danger hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingTag || selectedTagIds.length === 0}
                onClick={() => void bulkDisableTags()}
                type="button"
              >
                批量停用
              </button>
              <button
                className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                onClick={() => void reload()}
                type="button"
              >
                刷新
              </button>
            </div>
          </AdminListToolbar>
          {loading ? <p className="mt-4 text-sm font-bold text-secondary">加载标签中...</p> : null}
          {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
          {tagMessage ? (
            <p className="mx-5 mt-4 rounded-sm border border-border bg-soft px-3 py-2 text-sm font-bold text-secondary">{tagMessage}</p>
          ) : null}
          {!loading && !error ? (
            <div>
              <DataTable
                headers={["选择", "标签名称", "分组", "状态", "操作"]}
                rows={filteredTags.map((tag) => [
                  <input
                    checked={selectedTagIds.includes(tag.id)}
                    className="h-4 w-4 accent-primary"
                    disabled={!tag.enabled}
                    key={`select-${tag.id}`}
                    onChange={(event) =>
                      setSelectedTagIds((current) =>
                        updateSelection(current, tag.id, event.target.checked)
                      )
                    }
                    type="checkbox"
                  />,
                  <button
                    className="text-left font-extrabold text-ink hover:text-primary"
                    key={`edit-${tag.id}`}
                    onClick={() => startEditTag(tag)}
                    type="button"
                  >
                    {tag.name}
                  </button>,
                  tagGroupLabel(tag.group),
                  <Badge key={`status-${tag.id}`} tone={tag.enabled ? "green" : "amber"}>
                    {tag.enabled ? "已启用" : "已停用"}
                  </Badge>,
                  <button
                    className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
                    key={`action-${tag.id}`}
                    onClick={() => startEditTag(tag)}
                    type="button"
                  >
                    编辑
                  </button>
                ])}
              />
            </div>
          ) : null}
      </Card>

      {tagFormOpen ? (
        <AdminModal
          badge={
            mode === "edit" && selectedTag ? (
              <Badge tone={selectedTag.enabled ? "green" : "amber"}>
                {selectedTag.enabled ? "enabled" : "disabled"}
              </Badge>
            ) : null
          }
          description={mode === "create" ? "维护筛选和归一化字典" : selectedTag?.name ?? "选择标签后编辑"}
          onClose={() => setTagFormOpen(false)}
          title={mode === "create" ? "新增标签" : "编辑标签"}
        >
          <div className="space-y-4">
            <DraftTextField
              label="标签名称"
              onChange={(value) => updateTagField("name", value)}
              value={tagForm.name}
            />
            <DraftSelectField
              label="标签分组"
              onChange={(value) => updateTagField("group", value)}
              options={tagGroupOptions}
              value={tagForm.group}
            />
            <label className="flex items-center gap-3 rounded-sm border border-border bg-soft px-3 py-3">
              <input
                checked={tagForm.enabled}
                className="h-4 w-4 accent-primary"
                onChange={(event) => updateTagField("enabled", event.target.checked)}
                type="checkbox"
              />
              <span className="text-sm font-extrabold text-ink">启用标签</span>
            </label>
            {tagMessage ? (
              <p className="text-sm font-bold text-secondary">{tagMessage}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-sm bg-primary px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingTag}
                onClick={() => void saveTag()}
                type="button"
              >
                {savingTag ? "保存中" : mode === "create" ? "创建标签" : "保存修改"}
              </button>
              {mode === "edit" && selectedTag ? (
                <button
                  className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={savingTag}
                  onClick={() => void toggleSelectedTag()}
                  type="button"
                >
                  {selectedTag.enabled ? "停用" : "启用"}
                </button>
              ) : null}
              {mode === "edit" && selectedTag?.enabled ? (
                <button
                  className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-black text-danger disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={savingTag}
                  onClick={() => void disableSelectedTag()}
                  type="button"
                >
                  移除
                </button>
              ) : null}
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

function AdminModal({
  title,
  description,
  badge,
  children,
  onClose
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="flex h-full w-full max-w-[760px] flex-col border-l border-border bg-surface shadow-2xl">
        <div className="shrink-0 border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
            <h2 className="text-2xl font-black leading-tight tracking-normal text-ink">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm font-bold leading-7 text-secondary">{description}</p>
            ) : null}
            </div>
            <div className="flex items-center gap-2">
              {badge}
              <button
                aria-label="关闭弹窗"
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface text-lg font-black text-secondary hover:border-primary hover:text-primary"
                onClick={onClose}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        <div className="scroll-pane min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function AdminMetricStrip({
  items
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          className="rounded-md border border-border bg-surface px-4 py-3 shadow-card"
          key={item.label}
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{item.label}</p>
          <p className="mt-2 text-2xl font-black leading-none text-ink">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function AdminListToolbar({
  title,
  description,
  count,
  selectedCount,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  children
}: {
  title: string;
  description: string;
  count: number;
  selectedCount: number;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface px-5 py-4">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-normal text-ink">{title}</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-secondary">
            当前 {count} 条 / 已选 {selectedCount}。{description}
          </p>
        </div>
        <input
          className="min-h-10 w-full rounded-sm border border-border bg-soft px-3 text-sm font-bold text-ink outline-none placeholder:text-muted focus:border-primary xl:w-[360px]"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
      </div>
      <div className="mt-4 flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        {children}
      </div>
    </div>
  );
}

function AdminStatusTabs({
  options,
  value,
  onChange
}: {
  options: Array<{ label: string; value: string; count: number }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            className={`inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full border px-3 text-xs font-black ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-soft text-secondary hover:border-primary hover:text-primary"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label} {option.count}
          </button>
        );
      })}
    </div>
  );
}

function averageCaseActivities(cases: StudentCase[]) {
  if (!cases.length) {
    return "0";
  }
  const total = cases.reduce((sum, studentCase) => sum + studentCase.activityExperience.length, 0);
  return (total / cases.length).toFixed(1);
}

function AdminRowActions({
  onEdit,
  viewHref
}: {
  onEdit: () => void;
  viewHref: string;
}) {
  const actionClass =
    "inline-flex h-9 min-w-[52px] items-center justify-center whitespace-nowrap rounded-sm border border-border bg-surface px-3 text-xs font-black text-primary hover:border-primary";

  return (
    <div className="flex min-w-[116px] items-center gap-2">
      <button className={actionClass} onClick={onEdit} type="button">
        编辑
      </button>
      <Link className={actionClass} href={viewHref}>
        查看
      </Link>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm font-bold text-secondary">{label}</dt>
      <dd className="text-sm font-extrabold text-ink">{value}</dd>
    </div>
  );
}

function ImportQualityPanel({ quality }: { quality?: ImportQualitySummary }) {
  if (!quality) {
    return null;
  }

  const errors = quality.issues.filter((issue) => issue.severity === "error");
  const warnings = quality.issues.filter((issue) => issue.severity === "warning");

  return (
    <div className="rounded-sm border border-border bg-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-ink">质量检查</h3>
          <p className="mt-1 text-xs font-bold text-secondary">
            错误 {errors.length} / 提醒 {warnings.length} / 分数 {quality.score}
          </p>
        </div>
        <Badge tone={qualityTone(quality.level)}>{qualityLabel(quality)}</Badge>
      </div>
      {quality.issues.length ? (
        <div className="mt-3 space-y-2">
          {quality.issues.map((issue, index) => (
            <div
              className="rounded-sm border border-border bg-surface px-3 py-2"
              key={`${issue.field}-${issue.severity}-${index}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={issue.severity === "error" ? "red" : "amber"}>
                  {issue.severity === "error" ? "错误" : "提醒"}
                </Badge>
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
                  {issue.field}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-secondary">{issue.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold text-success">当前预览项质量检查通过。</p>
      )}
    </div>
  );
}

function ProgramFormFields({
  form,
  onFieldChange,
  showStatus = false
}: {
  form: ProgramDraftForm;
  onFieldChange: <K extends keyof ProgramDraftForm>(field: K, value: ProgramDraftForm[K]) => void;
  showStatus?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <DraftTextField
          label="活动名称"
          onChange={(value) => onFieldChange("name", value)}
          value={form.name}
        />
        <DraftTextField
          label="主办方"
          onChange={(value) => onFieldChange("organization", value)}
          value={form.organization}
        />
        <DraftSelectField
          label="活动类型"
          onChange={(value) => onFieldChange("type", value as Program["type"])}
          options={programTypeOptions}
          value={form.type}
        />
        <DraftSelectField
          label="形式"
          onChange={(value) => onFieldChange("format", value as Program["format"])}
          options={programFormatOptions}
          value={form.format}
        />
        {showStatus ? (
          <DraftSelectField
            label="状态"
            onChange={(value) => onFieldChange("status", value as Program["status"])}
            options={programStatusOptions}
            value={form.status}
          />
        ) : null}
        <DraftTextField
          label="官网"
          onChange={(value) => onFieldChange("officialUrl", value)}
          value={form.officialUrl}
        />
        <DraftTextField
          label="适合年级"
          onChange={(value) => onFieldChange("gradeRange", value)}
          value={form.gradeRange}
        />
        <DraftTextField
          label="学科方向"
          onChange={(value) => onFieldChange("subjectArea", value)}
          value={form.subjectArea}
        />
        <DraftTextField
          label="地点"
          onChange={(value) => onFieldChange("location", value)}
          value={form.location}
        />
        <DraftTextField
          label="申请开始"
          onChange={(value) => onFieldChange("applicationStartDate", value)}
          value={form.applicationStartDate}
        />
        <DraftTextField
          label="报名截止"
          onChange={(value) => onFieldChange("applicationEndDate", value)}
          value={form.applicationEndDate}
        />
        <DraftTextField
          label="活动开始"
          onChange={(value) => onFieldChange("programStartDate", value)}
          value={form.programStartDate}
        />
        <DraftTextField
          label="活动结束"
          onChange={(value) => onFieldChange("programEndDate", value)}
          value={form.programEndDate}
        />
        <DraftTextField
          label="周期"
          onChange={(value) => onFieldChange("duration", value)}
          value={form.duration}
        />
        <DraftTextField
          label="费用"
          onChange={(value) => onFieldChange("costText", value)}
          value={form.costText}
        />
        <DraftTextField
          label="奖学金/资助"
          onChange={(value) => onFieldChange("scholarshipText", value)}
          value={form.scholarshipText}
        />
        <DraftTextField
          label="名额限制"
          onChange={(value) => onFieldChange("capacityLimit", value)}
          value={form.capacityLimit}
        />
      </div>
      <DraftTextField
        label="申请条件"
        onChange={(value) => onFieldChange("requirements", value)}
        textarea
        value={form.requirements}
      />
      <DraftTextField
        label="活动简介"
        onChange={(value) => onFieldChange("description", value)}
        textarea
        value={form.description}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <DraftTextField
          label="核心主题"
          onChange={(value) => onFieldChange("coreTopicsText", value)}
          value={form.coreTopicsText}
        />
        <DraftTextField
          label="特色亮点"
          onChange={(value) => onFieldChange("highlightsText", value)}
          value={form.highlightsText}
        />
        <DraftTextField
          label="申请材料"
          onChange={(value) => onFieldChange("requiredMaterialsText", value)}
          value={form.requiredMaterialsText}
        />
        <DraftTextField
          label="标签"
          onChange={(value) => onFieldChange("tagsText", value)}
          value={form.tagsText}
        />
        <DraftTextField
          label="报名方式"
          onChange={(value) => onFieldChange("applicationMethod", value)}
          value={form.applicationMethod}
        />
      </div>
    </div>
  );
}

function CaseFormFields({
  form,
  onFieldChange
}: {
  form: CaseDraftForm;
  onFieldChange: <K extends keyof CaseDraftForm>(field: K, value: CaseDraftForm[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <DraftTextField
          label="案例编号"
          onChange={(value) => onFieldChange("anonymousCode", value)}
          value={form.anonymousCode}
        />
        <DraftSelectField
          label="年级"
          onChange={(value) => onFieldChange("grade", value as StudentCase["grade"])}
          options={caseGradeOptions}
          value={form.grade}
        />
        <DraftSelectField
          label="学校类型"
          onChange={(value) => onFieldChange("schoolType", value as StudentCase["schoolType"])}
          options={caseSchoolTypeOptions}
          value={form.schoolType}
        />
        <DraftTextField
          label="GPA 区间"
          onChange={(value) => onFieldChange("gpaRange", value)}
          value={form.gpaRange}
        />
        <DraftTextField
          label="申请方向"
          onChange={(value) => onFieldChange("intendedMajor", value)}
          value={form.intendedMajor}
        />
        <DraftTextField
          label="结果层级"
          onChange={(value) => onFieldChange("resultTier", value)}
          value={form.resultTier}
        />
        <DraftSelectField
          label="状态"
          onChange={(value) => onFieldChange("status", value as StudentCase["status"])}
          options={caseStatusOptions}
          value={form.status}
        />
        <DraftTextField
          label="标签"
          onChange={(value) => onFieldChange("tagsText", value)}
          value={form.tagsText}
        />
      </div>
      <DraftTextField
        label="学术背景"
        onChange={(value) => onFieldChange("academicSummary", value)}
        textarea
        value={form.academicSummary}
      />
      <DraftTextField
        label="活动经历"
        onChange={(value) => onFieldChange("activityExperienceText", value)}
        textarea
        value={form.activityExperienceText}
      />
      <DraftTextField
        label="结果摘要"
        onChange={(value) => onFieldChange("resultSummary", value)}
        textarea
        value={form.resultSummary}
      />
      <DraftTextField
        label="个人总结"
        onChange={(value) => onFieldChange("personalSummary", value)}
        textarea
        value={form.personalSummary}
      />
      <DraftTextField
        label="顾问点评"
        onChange={(value) => onFieldChange("consultantReview", value)}
        textarea
        value={form.consultantReview}
      />
    </div>
  );
}

function DraftTextField({
  label,
  value,
  onChange,
  textarea = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{label}</span>
      {textarea ? (
        <textarea
          className="mt-2 min-h-28 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-bold leading-6 text-ink outline-none focus:border-primary"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className="mt-2 min-h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm font-bold text-ink outline-none focus:border-primary"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  );
}

function DraftSelectField<TValue extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: TValue;
  options: Array<{ label: string; value: TValue }>;
  onChange: (value: TValue) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{label}</span>
      <select
        className="mt-2 min-h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm font-black text-ink outline-none focus:border-primary"
        onChange={(event) => onChange(event.target.value as TValue)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DataTable({
  headers,
  rows
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <div className="table-scroll bg-surface">
      <table className="min-w-[860px] w-full border-collapse text-left">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-border bg-soft">
            {headers.map((header) => (
              <th
                className={`px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted ${adminTableColumnClass(header)}`}
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              className="border-b border-border transition last:border-b-0 hover:bg-soft/70"
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => (
                <td
                  className={`max-w-[340px] px-4 py-3 text-sm font-bold leading-6 text-secondary align-middle ${adminTableColumnClass(headers[cellIndex])}`}
                  key={cellIndex}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function adminTableColumnClass(header?: string) {
  if (header === "选择") {
    return "w-[64px]";
  }
  if (header === "状态") {
    return "w-[96px] whitespace-nowrap";
  }
  if (header === "操作") {
    return "w-[136px] whitespace-nowrap";
  }
  if (header === "完整度" || header === "活动数") {
    return "w-[92px] whitespace-nowrap";
  }
  return "";
}
