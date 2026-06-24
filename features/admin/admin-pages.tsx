import type { ReactNode } from "react";
import { Badge, Card, PageHeading, TextLink } from "@/components/ui";
import { mockImportJobs, mockReviewRecords, mockTags } from "@/lib/mock/admin";
import { mockCases } from "@/lib/mock/cases";
import { mockPrograms } from "@/lib/mock/programs";

export function AdminImportPage() {
  const parsedCount = mockPrograms.filter((program) => program.status === "published").length;
  const archivedCount = mockPrograms.filter((program) => program.status === "archived").length;

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
              当前版本不做真实上传，后续接入 `POST /api/admin/import/jobs`。
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-extrabold tracking-normal text-ink">上传队列</h2>
            <div className="mt-4 space-y-3">
              {mockImportJobs.map((job) => (
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
              <AdminStat label="待补字段" value={`${archivedCount}`} />
              <AdminStat label="来源文档" value="活动.docx" />
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
  return (
    <div>
      <PageHeading
        description="运营人员维护活动资料、完整度和发布状态。"
        eyebrow="Admin"
        title="活动管理"
      />
      <Card>
        <DataTable
          headers={["活动名称", "类型", "形式", "完整度", "状态", "操作"]}
          rows={mockPrograms.slice(0, 12).map((program) => [
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
      </Card>
    </div>
  );
}

export function AdminCasesPage() {
  return (
    <div>
      <PageHeading
        description="维护匿名案例、活动路径、结果摘要和关联活动。"
        eyebrow="Admin"
        title="案例管理"
      />
      <Card>
        <DataTable
          headers={["案例 ID", "背景", "申请方向", "关联活动数", "结果", "操作"]}
          rows={mockCases.map((studentCase) => [
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
      </Card>
    </div>
  );
}

export function AdminReviewPage() {
  return (
    <div>
      <PageHeading
        description="审核自动解析或人工录入后的结构化资料，确认后发布到前台。"
        eyebrow="Admin"
        title="审核发布"
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <DataTable
            headers={["标题", "类型", "状态", "提交时间", "审核意见"]}
            rows={mockReviewRecords.map((record) => [
              record.title,
              record.targetType,
              record.status,
              record.submittedAt,
              record.reviewerNote
            ])}
          />
        </Card>
        <Card>
          <h2 className="text-lg font-extrabold tracking-normal text-ink">审核动作</h2>
          <div className="mt-4 space-y-3">
            {["通过", "退回修改", "发布上线"].map((label) => (
              <button
                className="block min-h-11 w-full rounded-sm border border-border bg-soft px-4 text-left text-sm font-bold text-ink hover:border-primary hover:text-primary"
                key={label}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AdminTagsPage() {
  return (
    <div>
      <PageHeading
        description="维护基础标签体系：活动类型、学科、年级、地点和形式。不包含规则权重。"
        eyebrow="Admin"
        title="标签管理"
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mockTags.map((tag) => (
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
