import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeading, PageShell, TextLink } from "@/components/ui";
import { mockCases } from "@/lib/mock/cases";
import { getCaseById, getRelatedPrograms } from "@/lib/mock/service";

export function generateStaticParams() {
  return mockCases.map((studentCase) => ({ caseId: studentCase.id }));
}

export default function CaseDetailPage({ params }: { params: { caseId: string } }) {
  const studentCase = getCaseById(params.caseId);
  if (!studentCase) {
    notFound();
  }

  const relatedPrograms = getRelatedPrograms(studentCase);

  return (
    <PageShell>
      <PageHeading
        actions={<TextLink href="/cases">返回案例库</TextLink>}
        description={studentCase.academicSummary}
        eyebrow="Anonymous Case"
        title={`${studentCase.anonymousCode}｜${studentCase.intendedMajor}`}
      />

      <div className="detail-grid">
        <section className="space-y-5">
          <Card>
            <div className="flex flex-wrap gap-2">
              <Badge tone="amber">{studentCase.gpaRange}</Badge>
              <Badge>{studentCase.grade}</Badge>
              <Badge>{studentCase.schoolType}</Badge>
              {studentCase.resultTier ? <Badge tone="green">{studentCase.resultTier}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <Meta label="申请方向" value={studentCase.intendedMajor} />
              <Meta label="结果摘要" value={studentCase.resultSummary} />
            </dl>
            <p className="mt-5 leading-8 text-secondary">{studentCase.personalSummary}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-extrabold tracking-normal text-ink">
              活动路径与决策逻辑
            </h2>
            <div className="mt-5 space-y-4">
              {studentCase.activityExperience.map((activity) => (
                <div
                  className="grid gap-3 rounded-sm border border-border bg-soft p-4 sm:grid-cols-[96px_1fr]"
                  key={`${activity.stage}-${activity.programName}`}
                >
                  <div className="text-sm font-extrabold text-primary">{activity.stage}</div>
                  <div>
                    {activity.programId ? (
                      <Link
                        className="text-base font-extrabold tracking-normal text-ink hover:text-primary"
                        href={`/programs/${activity.programId}`}
                      >
                        {activity.programName}
                      </Link>
                    ) : (
                      <h3 className="text-base font-extrabold tracking-normal text-ink">
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
          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">顾问复盘</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              {studentCase.consultantReview}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">关联活动</h2>
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
      <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold leading-7 text-ink">{value}</dd>
    </div>
  );
}

