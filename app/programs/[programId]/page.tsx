"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Badge, Card, EmptyState, PageShell, TextLink } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { Program, StudentCase } from "@/lib/types";

export default function ProgramDetailPage({
  params
}: {
  params: { programId: string };
}) {
  const [program, setProgram] = useState<Program | null>(null);
  const [relatedCases, setRelatedCases] = useState<StudentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<Program>(`/api/programs/${params.programId}`),
      apiFetch<StudentCase[]>(`/api/programs/${params.programId}/cases`)
    ])
      .then(([programResponse, casesResponse]) => {
        setProgram(programResponse.data);
        setRelatedCases(casesResponse.data);
        setError("");
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "活动详情加载失败");
      })
      .finally(() => setLoading(false));
  }, [params.programId]);

  if (loading) {
    return (
      <PageShell>
        <EmptyState description="正在请求后端活动详情接口。" title="加载活动详情中" />
      </PageShell>
    );
  }

  if (error || !program) {
    return (
      <PageShell>
        <EmptyState description={error || "活动不存在或未发布"} title="活动详情加载失败" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-4">
        <TextLink href="/programs">返回活动库</TextLink>
      </div>

      <div className="detail-grid">
        <div className="space-y-5">
          <Card className="relative min-h-[250px] overflow-hidden rounded-[34px] !bg-navy p-9 text-white">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[image:var(--gradient-primary)] opacity-[0.45]" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{program.type}</Badge>
                <Badge>{program.gradeRange}</Badge>
                <Badge>{program.format}</Badge>
              </div>
              <p className="mt-6 text-sm font-black text-white/70">
                活动库 / {program.type} /{" "}
                {program.tags.find((tag) => tag !== program.type && tag !== program.format) ??
                  "综合"}
              </p>
              <h2 className="mt-5 max-w-3xl text-[42px] font-black leading-tight tracking-normal text-white">
                {program.name}
              </h2>
              <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-white/80">
                {program.description}
              </p>
              <dl className="mt-7 grid gap-3 md:grid-cols-4">
                <HeroMeta label="报名截止" value={program.applicationEndDate ?? "待补充"} />
                <HeroMeta label="活动时间" value={program.programStartDate ?? "待补充"} />
                <HeroMeta label="费用" value={program.costText ?? "待补充"} />
                <HeroMeta label="关联案例" value={`${relatedCases.length} 个`} />
              </dl>
            </div>
          </Card>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              items={[
                ["主办方", program.organization],
                [
                  "官网",
                  program.officialUrl ? (
                    <a
                      className="text-primary underline-offset-4 hover:underline"
                      href={program.officialUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {program.officialUrl}
                    </a>
                  ) : (
                    "待补充"
                  )
                ],
                ["持续时间", program.duration ?? "待补充"]
              ]}
              title="基本信息"
            />
            <InfoCard
              items={[
                ["适合年级", program.gradeRange],
                ["学科方向", program.subjectArea],
                ["申请条件", program.requirements ?? "待补充"]
              ]}
              title="学生条件"
            />
            <InfoCard
              items={[
                ["地点", program.location],
                ["形式", program.format],
                ["奖学金/资助", program.scholarshipText ?? "待补充"]
              ]}
              title="地理与成本"
            />
            <InfoCard
              items={[
                ["报名方式", program.applicationMethod ?? "待补充"],
                ["提交材料", (program.requiredMaterials ?? []).join("、") || "待补充"],
                ["名额限制", program.capacityLimit ?? "待补充"]
              ]}
              title="报名信息"
            />
          </section>

          <Card className="rounded-[30px] p-7">
            <h2 className="text-2xl font-black tracking-normal text-ink">内容与亮点</h2>
            <p className="mt-3 leading-8 text-secondary">{program.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ListBlock items={program.coreTopics} title="核心课程 / 主题" />
              <ListBlock items={program.highlights} title="特色亮点" />
            </div>
          </Card>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:h-max">
          <Card className="rounded-[30px] p-7">
            <h2 className="text-xl font-black tracking-normal text-ink">适合学生参考</h2>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-border">
              <div className="h-full w-4/5 rounded-full bg-[image:var(--gradient-primary)]" />
            </div>
            <p className="mt-5 text-sm font-bold leading-7 text-secondary">
              适合与该活动学科、年级或路径相近的学生做资料参考。当前仅展示关联案例，不提供自动判断结论。
            </p>
          </Card>
          <Card className="rounded-[30px] p-7">
            <h2 className="text-xl font-black tracking-normal text-ink">相关案例</h2>
            <p className="mt-2 text-sm leading-7 text-secondary">
              以下案例来自参与活动或相近学科路径，不展示真实身份信息。
            </p>
            <div className="mt-4 space-y-3">
              {relatedCases.map((studentCase) => (
                <TextLink href={`/cases/${studentCase.id}`} key={studentCase.id}>
                  <span className="block rounded-sm border border-border bg-soft p-3 hover:border-primary">
                    <span className="block font-extrabold text-ink">
                      {studentCase.anonymousCode}｜{studentCase.intendedMajor}
                    </span>
                    <span className="mt-1 block text-sm font-normal leading-6 text-secondary">
                      {studentCase.resultSummary}
                    </span>
                  </span>
                </TextLink>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-black text-white">{value}</dd>
    </div>
  );
}

function InfoCard({
  title,
  items
}: {
  title: string;
  items: Array<[string, ReactNode]>;
}) {
  return (
    <Card className="rounded-[26px] p-6">
      <h2 className="text-lg font-black tracking-normal text-ink">{title}</h2>
      <dl className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div className="border-b border-border pb-3 last:border-b-0 last:pb-0" key={label}>
            <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-black leading-7 text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-soft p-5">
      <h3 className="font-black tracking-normal text-ink">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-7 text-secondary">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-secondary">待补充</p>
      )}
    </div>
  );
}
