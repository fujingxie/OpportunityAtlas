"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { Badge, Card, PageHeading, TextLink } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { ImportJob, Program, StudentCase } from "@/lib/types";

type ImportItemView = {
  id: string;
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

type TagView = {
  id: string;
  name: string;
  group: string;
  enabled: boolean;
};

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
  const [uploading, setUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const parsedCount = jobs.reduce((total, job) => total + (job.items?.length ?? 0), 0);

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

  return (
    <div>
      <PageHeading
        description="上传文档后由后端解析为结构化草稿，前端当前使用 mock 任务展示流程状态。"
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
                    <Badge tone={job.status === "failed" ? "red" : "blue"}>{job.status}</Badge>
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
                      className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-black text-primary hover:border-primary"
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
          </Card>
          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">质量检测</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              已检测到重复/占位编号条目，前端保留为归档状态，等待运营确认是否合并或补齐。
            </p>
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
