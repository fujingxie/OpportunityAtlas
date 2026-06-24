import { notFound } from "next/navigation";
import { Badge, Card, PageHeading, PageShell, TextLink } from "@/components/ui";
import { mockPrograms } from "@/lib/mock/programs";
import { getProgramById, getRelatedCases } from "@/lib/mock/service";

export function generateStaticParams() {
  return mockPrograms.map((program) => ({ programId: program.id }));
}

export default function ProgramDetailPage({
  params
}: {
  params: { programId: string };
}) {
  const program = getProgramById(params.programId);
  if (!program) {
    notFound();
  }

  const relatedCases = getRelatedCases(program);

  return (
    <PageShell>
      <PageHeading
        actions={<TextLink href="/programs">返回活动库</TextLink>}
        description={program.description}
        eyebrow={program.type}
        title={program.name}
      />

      <div className="detail-grid">
        <div className="space-y-5">
          <Card className="bg-navy text-white">
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">{program.type}</Badge>
              <Badge>{program.gradeRange}</Badge>
              <Badge>{program.format}</Badge>
            </div>
            <p className="mt-5 text-sm font-bold text-white/70">{program.organization}</p>
            <dl className="mt-6 grid gap-3 md:grid-cols-3">
              <HeroMeta label="报名截止" value={program.applicationEndDate ?? "待补充"} />
              <HeroMeta label="活动时间" value={program.programStartDate ?? "待补充"} />
              <HeroMeta label="费用" value={program.costText ?? "待补充"} />
            </dl>
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoCard
              items={[
                ["主办方", program.organization],
                ["官网", program.officialUrl ?? "待补充"],
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

          <Card>
            <h2 className="text-xl font-extrabold tracking-normal text-ink">内容与亮点</h2>
            <p className="mt-3 leading-8 text-secondary">{program.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ListBlock items={program.coreTopics} title="核心课程 / 主题" />
              <ListBlock items={program.highlights} title="特色亮点" />
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <h2 className="text-lg font-extrabold tracking-normal text-ink">相关案例</h2>
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
    <div className="rounded-sm border border-white/15 bg-white/10 p-4">
      <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-bold text-white">{value}</dd>
    </div>
  );
}

function InfoCard({
  title,
  items
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <Card>
      <h2 className="text-lg font-extrabold tracking-normal text-ink">{title}</h2>
      <dl className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div className="border-b border-border pb-3 last:border-b-0 last:pb-0" key={label}>
            <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-bold leading-7 text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-sm border border-border bg-soft p-4">
      <h3 className="font-extrabold tracking-normal text-ink">{title}</h3>
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
