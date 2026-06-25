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
      <div className="mb-4">
        <TextLink href="/cases">返回案例库</TextLink>
      </div>

      <div className="grid gap-6 xl:grid-cols-[370px_1fr_340px]">
        <aside className="space-y-5">
          <Card className="rounded-[30px] p-7">
            <div className="grid h-20 w-20 place-items-center rounded-[27px] bg-[image:var(--gradient-primary)] text-3xl font-black text-white shadow-card">
              C
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="amber">{studentCase.gpaRange}</Badge>
              <Badge>{studentCase.grade}</Badge>
              <Badge>{studentCase.schoolType}</Badge>
              {studentCase.resultTier ? <Badge tone="green">{studentCase.resultTier}</Badge> : null}
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-normal text-ink">
              {studentCase.anonymousCode}｜{studentCase.intendedMajor}
            </h2>
            <p className="mt-3 text-sm font-bold leading-7 text-secondary">
              {studentCase.academicSummary}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <Meta label="申请方向" value={studentCase.intendedMajor} />
              <Meta label="结果摘要" value={studentCase.resultSummary} />
            </dl>
          </Card>
        </aside>

        <section className="space-y-5">
          <Card className="rounded-[30px] p-7">
            <h2 className="text-[30px] font-black tracking-normal text-ink">
              活动路径与决策逻辑
            </h2>
            <div className="mt-5 space-y-4">
              {studentCase.activityExperience.map((activity) => (
                <div
                  className="grid gap-4 rounded-md border border-border bg-soft p-5 sm:grid-cols-[84px_1fr]"
                  key={`${activity.stage}-${activity.programName}`}
                >
                  <div className="text-sm font-black text-primary">{activity.stage}</div>
                  <div>
                    {activity.programId ? (
                      <Link
                        className="text-lg font-black tracking-normal text-ink hover:text-primary"
                        href={`/programs/${activity.programId}`}
                      >
                        {activity.programName}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-black tracking-normal text-ink">
                        {activity.programName}
                      </h3>
                    )}
                    <p className="mt-2 text-sm leading-7 text-secondary">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="rounded-[28px] !bg-navy p-7 text-white">
            <h2 className="text-xl font-black tracking-normal text-white">个人总结</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-white/80">
              {studentCase.personalSummary}
            </p>
          </Card>
          <Card className="rounded-[28px] p-7">
            <h2 className="text-xl font-black tracking-normal text-ink">顾问复盘</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              {studentCase.consultantReview}
            </p>
          </Card>

          <Card className="rounded-[28px] p-7">
            <h2 className="text-xl font-black tracking-normal text-ink">关联活动</h2>
            <div className="mt-4 space-y-3">
              {relatedPrograms.map((program) => (
                <Link
                  className="block rounded-sm border border-border bg-soft p-3 hover:border-primary"
                  href={`/programs/${program.id}`}
                  key={program.id}
                >
                  <span className="block text-sm font-extrabold text-ink">{program.name}</span>
                  <span className="mt-1 block text-xs font-bold text-secondary">
                    {program.type} / {program.gradeRange}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
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
      <dd className="mt-1 text-sm font-black leading-7 text-ink">{value}</dd>
    </div>
  );
}
