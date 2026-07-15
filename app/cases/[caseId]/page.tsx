"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, PageShell, TextLink } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { Program, StudentCase } from "@/lib/types";

export default function CaseDetailPage({ params }: { params: { caseId: string } }) {
  const [studentCase, setStudentCase] = useState<StudentCase | null>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<StudentCase>(`/api/cases/${params.caseId}`),
      apiFetch<Program[]>(`/api/cases/${params.caseId}/programs`)
    ])
      .then(([caseResponse, programResponse]) => {
        setStudentCase(caseResponse.data);
        setRelatedPrograms(programResponse.data);
        setError("");
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "案例详情加载失败");
      })
      .finally(() => setLoading(false));
  }, [params.caseId]);

  if (loading) {
    return (
      <PageShell>
        <EmptyState description="正在请求后端案例详情接口。" title="加载案例详情中" />
      </PageShell>
    );
  }

  if (error || !studentCase) {
    return (
      <PageShell>
        <EmptyState description={error || "案例不存在或未发布"} title="案例详情加载失败" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-3">
        <TextLink href="/cases">返回案例库</TextLink>
      </div>

      <Card className="rounded-[26px] p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge tone="amber">{studentCase.gpaRange}</Badge>
              <Badge>{studentCase.grade}</Badge>
              <Badge>{schoolTypeLabel(studentCase.schoolType)}</Badge>
              {studentCase.resultTier ? <Badge tone="green">{studentCase.resultTier}</Badge> : null}
            </div>
            <h1 className="mt-3 text-[30px] font-black leading-tight tracking-normal text-ink lg:text-[38px]">
              {studentCase.anonymousCode}｜{studentCase.intendedMajor}
            </h1>
            <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-secondary lg:text-base">
              {studentCase.academicSummary}
            </p>
          </div>
          <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-[360px]">
            <Meta label="申请方向" value={studentCase.intendedMajor} />
            <Meta label="结果" value={studentCase.resultSummary} />
            <Link
              className="flex min-h-12 items-center justify-center rounded-sm bg-primary px-4 text-sm font-black text-white shadow-card hover:-translate-y-0.5 sm:col-span-2"
              href={`/planner?caseId=${encodeURIComponent(studentCase.id)}`}
            >
              参考此案例生成路径
            </Link>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
        <section className="space-y-5">
          <Card className="rounded-[24px] p-5 lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                  Path
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-normal text-ink">活动路径</h2>
              </div>
              <p className="text-sm font-bold text-secondary">
                共 {studentCase.activityExperience.length} 段经历
              </p>
            </div>
            <div className="mt-4 divide-y divide-border overflow-hidden rounded-md border border-border bg-soft">
              {studentCase.activityExperience.map((activity) => (
                <div
                  className="grid gap-3 bg-surface/55 p-4 sm:grid-cols-[88px_1fr]"
                  key={`${activity.stage}-${activity.programName}`}
                >
                  <div className="text-sm font-black text-primary">{activity.stage}</div>
                  <div>
                    {activity.programId ? (
                      <Link
                        className="text-base font-black tracking-normal text-ink hover:text-primary"
                        href={`/programs/${activity.programId}`}
                      >
                        {activity.programName}
                      </Link>
                    ) : (
                      <h3 className="text-base font-black tracking-normal text-ink">
                        {activity.programName}
                      </h3>
                    )}
                    {activity.description ? (
                      <p className="mt-1 text-sm leading-6 text-secondary">
                        {activity.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:h-max">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-lg font-black tracking-normal text-ink">关键信息</h2>
            <dl className="mt-4 space-y-3">
              <CompactMeta label="案例编号" value={studentCase.anonymousCode} />
              <CompactMeta label="学术背景" value={studentCase.gpaRange} />
              <CompactMeta label="就读类型" value={schoolTypeLabel(studentCase.schoolType)} />
              {studentCase.resultTier ? (
                <CompactMeta label="案例等级" value={studentCase.resultTier} />
              ) : null}
            </dl>
            {studentCase.consultantReview ? (
              <div className="mt-4 rounded-sm border border-warning/25 bg-warning/10 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-warning">复盘提示</p>
                <p className="mt-2 text-sm font-bold leading-6 text-secondary">
                  {studentCase.consultantReview}
                </p>
              </div>
            ) : null}
            <Link
              className="mt-4 flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-black text-white shadow-card hover:-translate-y-0.5"
              href={`/planner?caseId=${encodeURIComponent(studentCase.id)}`}
            >
              用该案例倒推活动
            </Link>
          </Card>

          {relatedPrograms.length ? (
            <Card className="rounded-[24px] p-5">
              <h2 className="text-lg font-black tracking-normal text-ink">关联活动</h2>
              <div className="mt-3 space-y-2">
                {relatedPrograms.map((program) => (
                  <Link
                    className="block rounded-sm border border-border bg-soft p-3 hover:border-primary"
                    href={`/programs/${program.id}`}
                    key={program.id}
                  >
                    <span className="line-clamp-2 text-sm font-extrabold leading-6 text-ink">
                      {program.name}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-secondary">
                      {program.type} / {program.gradeRange}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {studentCase.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {studentCase.tags.slice(0, 8).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-soft p-3">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-black leading-6 text-ink">{value}</dd>
    </div>
  );
}

function CompactMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="shrink-0 text-sm font-bold text-secondary">{label}</dt>
      <dd className="text-right text-sm font-black leading-6 text-ink">{value}</dd>
    </div>
  );
}

function schoolTypeLabel(value: StudentCase["schoolType"]) {
  if (value === "international") {
    return "国际学校";
  }
  if (value === "public") {
    return "公立学校";
  }
  return "其他";
}
