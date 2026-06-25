"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Badge, Card, PageHeading, TextLink } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { ImportJob, Program, StudentCase } from "@/lib/types";

type ImportItemView = {
  id: string;
  rawText?: string;
  title: string;
  itemType: string;
  status: string;
  parsedData: unknown;
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
  applicationEndDate: string;
  programStartDate: string;
  duration: string;
  gradeRange: string;
  subjectArea: string;
  location: string;
  format: Program["format"];
  costText: string;
  description: string;
  coreTopicsText: string;
  highlightsText: string;
  requiredMaterialsText: string;
  tagsText: string;
  applicationMethod: string;
  capacityLimit: string;
};

type TagView = {
  id: string;
  name: string;
  group: string;
  enabled: boolean;
};

const emptyProgramDraftForm: ProgramDraftForm = {
  name: "",
  type: "Other",
  organization: "",
  officialUrl: "",
  applicationEndDate: "",
  programStartDate: "",
  duration: "",
  gradeRange: "",
  subjectArea: "",
  location: "",
  format: "offline",
  costText: "",
  description: "",
  coreTopicsText: "",
  highlightsText: "",
  requiredMaterialsText: "",
  tagsText: "",
  applicationMethod: "",
  capacityLimit: ""
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

function arrayToText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("、") : "";
}

function textToArray(value: string) {
  return value
    .split(/[、,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toProgramDraftForm(value: unknown): ProgramDraftForm {
  const data = asRecord(value);
  return {
    name: asString(data.name),
    type: isProgramType(data.type) ? data.type : "Other",
    organization: asString(data.organization),
    officialUrl: asString(data.officialUrl),
    applicationEndDate: asString(data.applicationEndDate),
    programStartDate: asString(data.programStartDate),
    duration: asString(data.duration),
    gradeRange: asString(data.gradeRange),
    subjectArea: asString(data.subjectArea),
    location: asString(data.location),
    format: isProgramFormat(data.format) ? data.format : "offline",
    costText: asString(data.costText),
    description: asString(data.description),
    coreTopicsText: arrayToText(data.coreTopics),
    highlightsText: arrayToText(data.highlights),
    requiredMaterialsText: arrayToText(data.requiredMaterials),
    tagsText: arrayToText(data.tags),
    applicationMethod: asString(data.applicationMethod),
    capacityLimit: asString(data.capacityLimit)
  };
}

function toProgramDraftData(original: unknown, form: ProgramDraftForm) {
  return {
    ...asRecord(original),
    name: form.name.trim(),
    type: form.type,
    organization: form.organization.trim() || "待补充",
    officialUrl: form.officialUrl.trim(),
    applicationEndDate: form.applicationEndDate.trim(),
    programStartDate: form.programStartDate.trim(),
    duration: form.duration.trim(),
    gradeRange: form.gradeRange.trim() || "待补充",
    subjectArea: form.subjectArea.trim() || "综合",
    location: form.location.trim() || "待补充",
    format: form.format,
    costText: form.costText.trim(),
    description: form.description.trim() || "待补充",
    coreTopics: textToArray(form.coreTopicsText),
    highlights: textToArray(form.highlightsText),
    requiredMaterials: textToArray(form.requiredMaterialsText),
    tags: textToArray(form.tagsText),
    applicationMethod: form.applicationMethod.trim(),
    capacityLimit: form.capacityLimit.trim(),
    status: "draft",
    source: "document_import"
  };
}

function statusTone(status: string): "default" | "blue" | "green" | "amber" | "red" {
  if (status === "published") {
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
      return;
    }
    if (!selectedItemId || !selectedItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(selectedItems[0].id);
      return;
    }
    if (selectedItem) {
      setDraftForm(toProgramDraftForm(selectedItem.parsedData));
    }
  }, [selectedItem, selectedItemId, selectedItems]);

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
    try {
      await apiFetch<ImportJobView>(`/api/admin/import/jobs/${jobId}/publish`, {
        method: "POST"
      });
      setActionMessage("已发布到活动库。");
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

  const saveSelectedItem = async () => {
    if (!selectedJob || !selectedItem) {
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
            parsedData: toProgramDraftData(selectedItem.parsedData, draftForm)
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

  return (
    <div>
      <PageHeading
        description="上传文档后由后端解析为结构化草稿，管理员可直接发布到活动库。"
        eyebrow="Admin"
        title="文档录入"
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="rounded-md border border-dashed border-border bg-soft p-8 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
              Upload Zone
            </p>
            <h2 className="mt-2 text-xl font-extrabold tracking-normal text-ink">
              拖拽 Word / PDF / Excel 文件开始录入
            </h2>
            <p className="mt-2 text-sm leading-7 text-secondary">
              当前一期支持 DOCX 解析，PDF / XLSX / CSV 会返回不支持类型。
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <select
                className="min-h-11 rounded-sm border border-border bg-surface px-3 text-sm font-black text-ink"
                onChange={(event) => setSourceType(event.target.value as UploadSourceType)}
                value={sourceType}
              >
                <option value="program">活动文档</option>
                <option value="case">案例文档</option>
              </select>
              <input
                accept=".docx"
                className="max-w-[280px] rounded-sm border border-border bg-surface px-3 py-3 text-sm font-bold text-secondary"
                onChange={handleFileChange}
                type="file"
              />
              <button
                className="min-h-11 rounded-sm bg-primary px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={uploading}
                onClick={() => void uploadFile()}
                type="button"
              >
                {uploading ? "上传中" : "上传解析"}
              </button>
            </div>
            {actionMessage ? (
              <p className="mt-4 text-sm font-bold text-secondary">{actionMessage}</p>
            ) : null}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-extrabold tracking-normal text-ink">上传队列</h2>
            <div className="mt-4 space-y-3">
              {loading ? <p className="text-sm font-bold text-secondary">加载上传队列中...</p> : null}
              {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
              {jobs.map((job) => (
                <div
                  className="rounded-sm border border-border bg-soft p-4"
                  key={job.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-ink">{job.fileName}</p>
                      <p className="mt-1 text-sm font-bold text-secondary">
                        {job.fileType} / {Math.round(job.fileSize / 1024)} KB / {job.sourceType}
                      </p>
                    </div>
                    <Badge tone={statusTone(job.status)}>{job.status}</Badge>
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
                      disabled={job.status === "failed" || job.status === "published" || job.sourceType !== "program"}
                      onClick={() => void publishJob(job.id)}
                      type="button"
                    >
                      发布到活动库
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">结构化预览</h2>
            <dl className="mt-4 space-y-3">
              <AdminStat label="已解析活动" value={`${parsedCount}`} />
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
                        </span>
                        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
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
                  <span className="text-sm font-bold text-secondary">{selectedItem.title}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DraftTextField
                    label="活动名称"
                    onChange={(value) => updateDraftField("name", value)}
                    value={draftForm.name}
                  />
                  <DraftTextField
                    label="主办方"
                    onChange={(value) => updateDraftField("organization", value)}
                    value={draftForm.organization}
                  />
                  <DraftSelectField
                    label="活动类型"
                    onChange={(value) => updateDraftField("type", value as Program["type"])}
                    options={programTypeOptions}
                    value={draftForm.type}
                  />
                  <DraftSelectField
                    label="形式"
                    onChange={(value) => updateDraftField("format", value as Program["format"])}
                    options={programFormatOptions}
                    value={draftForm.format}
                  />
                  <DraftTextField
                    label="官网"
                    onChange={(value) => updateDraftField("officialUrl", value)}
                    value={draftForm.officialUrl}
                  />
                  <DraftTextField
                    label="适合年级"
                    onChange={(value) => updateDraftField("gradeRange", value)}
                    value={draftForm.gradeRange}
                  />
                  <DraftTextField
                    label="学科方向"
                    onChange={(value) => updateDraftField("subjectArea", value)}
                    value={draftForm.subjectArea}
                  />
                  <DraftTextField
                    label="地点"
                    onChange={(value) => updateDraftField("location", value)}
                    value={draftForm.location}
                  />
                  <DraftTextField
                    label="报名截止"
                    onChange={(value) => updateDraftField("applicationEndDate", value)}
                    value={draftForm.applicationEndDate}
                  />
                  <DraftTextField
                    label="活动开始"
                    onChange={(value) => updateDraftField("programStartDate", value)}
                    value={draftForm.programStartDate}
                  />
                  <DraftTextField
                    label="周期"
                    onChange={(value) => updateDraftField("duration", value)}
                    value={draftForm.duration}
                  />
                  <DraftTextField
                    label="费用"
                    onChange={(value) => updateDraftField("costText", value)}
                    value={draftForm.costText}
                  />
                </div>
                <DraftTextField
                  label="活动简介"
                  onChange={(value) => updateDraftField("description", value)}
                  textarea
                  value={draftForm.description}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DraftTextField
                    label="核心主题"
                    onChange={(value) => updateDraftField("coreTopicsText", value)}
                    value={draftForm.coreTopicsText}
                  />
                  <DraftTextField
                    label="特色亮点"
                    onChange={(value) => updateDraftField("highlightsText", value)}
                    value={draftForm.highlightsText}
                  />
                  <DraftTextField
                    label="申请材料"
                    onChange={(value) => updateDraftField("requiredMaterialsText", value)}
                    value={draftForm.requiredMaterialsText}
                  />
                  <DraftTextField
                    label="标签"
                    onChange={(value) => updateDraftField("tagsText", value)}
                    value={draftForm.tagsText}
                  />
                  <DraftTextField
                    label="报名方式"
                    onChange={(value) => updateDraftField("applicationMethod", value)}
                    value={draftForm.applicationMethod}
                  />
                  <DraftTextField
                    label="名额限制"
                    onChange={(value) => updateDraftField("capacityLimit", value)}
                    value={draftForm.capacityLimit}
                  />
                </div>
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
  const { items: programs, loading, error } = useApiList<Program>("/api/admin/programs?pageSize=100");

  return (
    <div>
      <PageHeading
        description="运营人员维护活动资料、完整度和发布状态。"
        eyebrow="Admin"
        title="活动管理"
      />
      <Card>
        {loading ? <p className="text-sm font-bold text-secondary">加载活动列表中...</p> : null}
        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
        {!loading && !error ? (
          <DataTable
            headers={["活动名称", "类型", "形式", "完整度", "状态", "操作"]}
            rows={programs.slice(0, 12).map((program) => [
              program.name,
              program.type,
              program.format,
              `${program.completeness}%`,
              program.status,
              <TextLink href={`/programs/${program.id}`} key={program.id}>
                查看
              </TextLink>
            ])}
          />
        ) : null}
      </Card>
    </div>
  );
}

export function AdminCasesPage() {
  const { items: cases, loading, error } = useApiList<StudentCase>("/api/admin/cases?pageSize=100");

  return (
    <div>
      <PageHeading
        description="维护匿名案例、活动路径、结果摘要和关联活动。"
        eyebrow="Admin"
        title="案例管理"
      />
      <Card>
        {loading ? <p className="text-sm font-bold text-secondary">加载案例列表中...</p> : null}
        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
        {!loading && !error ? (
          <DataTable
            headers={["案例 ID", "背景", "申请方向", "关联活动数", "结果", "操作"]}
            rows={cases.map((studentCase) => [
              studentCase.anonymousCode,
              `${studentCase.grade} / ${studentCase.schoolType} / ${studentCase.gpaRange}`,
              studentCase.intendedMajor,
              `${studentCase.activityExperience.length}`,
              studentCase.resultSummary,
              <TextLink href={`/cases/${studentCase.id}`} key={studentCase.id}>
                查看
              </TextLink>
            ])}
          />
        ) : null}
      </Card>
    </div>
  );
}

export function AdminTagsPage() {
  const { items: tags, loading, error } = useApiList<TagView>("/api/admin/tags");

  return (
    <div>
      <PageHeading
        description="维护基础标签体系：活动类型、学科、年级、地点和形式。不包含规则权重。"
        eyebrow="Admin"
        title="标签管理"
      />
      <Card>
        {loading ? <p className="text-sm font-bold text-secondary">加载标签中...</p> : null}
        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tags.map((tag) => (
            <div className="rounded-sm border border-border bg-soft p-4" key={tag.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-ink">{tag.name}</p>
                  <p className="mt-1 text-sm font-bold text-secondary">{tag.group}</p>
                </div>
                <Badge tone={tag.enabled ? "green" : "amber"}>
                  {tag.enabled ? "enabled" : "disabled"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <p className="mt-4 text-sm leading-7 text-secondary">
        后端接口参考项目文件 `docs/backend-api.md`。
      </p>
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
    <div className="table-scroll">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {headers.map((header) => (
              <th
                className="px-3 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted"
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-b border-border last:border-b-0" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  className="max-w-[320px] px-3 py-4 text-sm font-bold leading-6 text-secondary"
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
