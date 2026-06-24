import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { Badge } from "@/components/ui";
import { getRelatedCases } from "@/lib/mock/service";
import { mockPrograms } from "@/lib/mock/programs";

export default function HomePage() {
  const featuredPrograms = ["p-015", "p-018", "p-031"]
    .map((id) => mockPrograms.find((program) => program.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <main className="min-h-[calc(100vh-76px)] px-4 py-8 sm:px-6 lg:px-9">
      <section className="mx-auto grid max-w-[1440px] gap-10 overflow-hidden rounded-[42px] border border-white/80 bg-surface/92 px-7 py-16 shadow-panel lg:grid-cols-[1.02fr_0.98fr] lg:px-16 lg:py-20">
        <div className="animate-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-black text-primary">
            <LogoMark className="h-5 w-5" />
            Opportunity Atlas
          </div>
          <h1 className="mt-8 max-w-4xl text-[48px] font-black leading-[1.04] tracking-normal text-ink sm:text-[64px]">
            把活动资料
            <br />
            <span className="bg-[image:var(--gradient-title)] bg-clip-text text-transparent">
              整理成可信赖的机会地图
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-medium leading-9 text-secondary">
            面向顾问、学生与家长的活动策划案例管理网站：先清晰沉淀活动库和匿名案例库，再用真实路径辅助决策。
          </p>

          <div className="mt-10 grid max-w-[680px] gap-4 sm:grid-cols-2">
            <Link
              className="group flex min-h-[132px] gap-4 rounded-lg border border-border bg-surface p-6 shadow-card hover:-translate-y-1 hover:border-primary"
              href="/programs"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary/10 text-2xl">
                <LogoMark className="h-8 w-8 text-primary" />
              </span>
              <span>
                <span className="block text-2xl font-black tracking-normal text-ink group-hover:text-primary">
                  浏览活动
                </span>
                <span className="mt-2 block text-sm font-bold leading-7 text-secondary">
                  按竞赛、夏校、科研、学科和年级快速筛选。
                </span>
              </span>
            </Link>
            <Link
              className="group flex min-h-[132px] gap-4 rounded-lg border border-border bg-surface p-6 shadow-card hover:-translate-y-1 hover:border-primary"
              href="/cases"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-warning/10 text-2xl font-black text-warning">
                C
              </span>
              <span>
                <span className="block text-2xl font-black tracking-normal text-ink group-hover:text-primary">
                  浏览案例
                </span>
                <span className="mt-2 block text-sm font-bold leading-7 text-secondary">
                  按成绩段、申请方向和活动路径找到相似学生。
                </span>
              </span>
            </Link>
          </div>
        </div>

        <aside className="rounded-[34px] border border-border bg-surface/90 p-6 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black tracking-normal text-ink">精选活动与相关案例</h2>
            <div className="flex rounded-full bg-soft p-1 text-xs font-black text-secondary">
              <span className="rounded-full bg-surface px-3 py-2 text-primary shadow-card">全部</span>
              <span className="px-3 py-2">竞赛</span>
              <span className="px-3 py-2">科研</span>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {featuredPrograms.map((program) => {
              if (!program) return null;
              const relatedCount = getRelatedCases(program).length;
              return (
                <Link
                  className="grid grid-cols-[1fr_auto] gap-4 rounded-md border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:border-primary"
                  href={`/programs/${program.id}`}
                  key={program.id}
                >
                  <span>
                    <span className="flex flex-wrap gap-2">
                      <Badge tone={program.type === "Competition" ? "green" : "blue"}>
                        {program.type}
                      </Badge>
                      <Badge tone="green">{program.gradeRange}</Badge>
                    </span>
                    <span className="mt-3 block text-xl font-black tracking-normal text-ink">
                      {program.name}
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm font-bold leading-7 text-secondary">
                      {program.description}
                    </span>
                  </span>
                  <span className="grid h-20 w-20 place-items-center rounded-md bg-cyan/10 text-center text-primary">
                    <span className="text-2xl font-black leading-none">{relatedCount}</span>
                    <span className="block text-xs font-black text-secondary">案例</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat value="50+" label="活动资料" />
            <Stat value="3" label="核心分类" />
            <Stat value="10" label="案例样本" />
          </div>
          <div className="mt-5 overflow-hidden rounded-lg bg-navy p-6 text-white">
            <h3 className="text-xl font-black tracking-normal">案例路径预览</h3>
            <p className="mt-3 text-sm font-bold leading-7 text-white/80">
              相似背景 → 活动组合 → 申请方向 → 结果复盘
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["G10 入门", "G11 科研", "夏季项目", "申请复盘"].map((step) => (
                <div className="rounded-md border border-white/10 bg-white/10 p-3 text-sm font-bold text-white/85" key={step}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-soft p-4">
      <div className="text-3xl font-black tracking-normal text-ink">{value}</div>
      <div className="mt-1 text-xs font-black text-secondary">{label}</div>
    </div>
  );
}
