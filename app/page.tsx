import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

const quickTags = ["STEM 科研", "G10-G11 夏校", "数学竞赛", "中等背景案例"];

const entryCards = [
  {
    href: "/programs",
    eyebrow: "50+ 活动资料",
    title: "浏览活动",
    description: "搜索竞赛、夏校、科研项目，按年级、学科与形式快速筛选。",
    mark: "program"
  },
  {
    href: "/cases",
    eyebrow: "12 个案例样本",
    title: "浏览案例",
    description: "查看匿名学生路径，比较活动细节、申请方向与结果复盘。",
    mark: "case"
  }
];

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-76px)] overflow-hidden px-4 py-10 sm:px-6 lg:h-[calc(100vh-76px)] lg:px-9 lg:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,hsl(var(--color-primary)/0.12),transparent_30%),radial-gradient(circle_at_33%_48%,hsl(var(--color-cyan)/0.12),transparent_28%),linear-gradient(180deg,hsl(var(--color-bg-soft)),hsl(var(--color-bg-surface))_52%,hsl(var(--color-bg-page)))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[44%] hidden text-[170px] font-black leading-none tracking-normal text-primary/10 lg:block"
      >
        OA
      </div>
      <section className="relative mx-auto flex h-full max-w-[1180px] flex-col items-center justify-start pt-4 lg:pt-8">
        <div className="animate-enter flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="mt-2 max-w-5xl text-[40px] font-black leading-[1.12] tracking-normal text-ink sm:text-[58px] lg:text-[68px]">
            发现活动机会，
            <span className="hidden sm:inline"> </span>
            <br className="sm:hidden" />
            连接真实案例路径
          </h1>
          <p className="mt-6 max-w-4xl text-base font-medium leading-8 text-secondary sm:text-xl">
            检索竞赛、夏校、科研项目，也查看不同背景学生的活动组合与结果复盘
          </p>

          <form
            action="/programs"
            className="mt-8 flex w-full max-w-[680px] overflow-hidden rounded-full border border-border/80 bg-surface/95 shadow-panel focus-within:border-primary"
          >
            <span className="grid w-16 shrink-0 place-items-center text-muted">
              <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
                <path
                  d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
            <input
              aria-label="搜索活动与案例"
              className="min-h-16 flex-1 border-0 bg-transparent pr-4 text-base font-bold text-ink outline-none placeholder:text-muted"
              name="q"
              placeholder="搜索活动、案例、学科或年级"
              type="search"
            />
            <button
              aria-label="搜索"
              className="m-1.5 min-w-[132px] rounded-full bg-[image:var(--gradient-primary)] px-6 text-sm font-black text-white shadow-card hover:-translate-y-0.5"
              type="submit"
            >
              搜索
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {quickTags.map((tag, index) => (
              <Link
                className={
                  index === 0
                    ? "rounded-full bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-black text-white shadow-card hover:-translate-y-0.5"
                    : "rounded-full border border-border bg-surface/90 px-5 py-2.5 text-sm font-black text-secondary shadow-card hover:border-primary hover:text-primary"
                }
                href={`/programs?q=${encodeURIComponent(tag)}`}
                key={tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mt-12 grid w-full max-w-[840px] gap-8 md:grid-cols-2 lg:mt-14">
          {entryCards.map((card) => (
            <Link
              className="group relative min-h-[220px] overflow-visible rounded-lg"
              href={card.href}
              key={card.href}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-10 bottom-[-42px] h-28 rounded-[45%] bg-primary/20 opacity-70 shadow-[0_24px_55px_hsl(var(--color-primary)/0.28)] transition-transform duration-300 group-hover:translate-y-1"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-14 bottom-[-58px] h-24 rounded-[45%] bg-cyan/15 opacity-75 transition-transform duration-300 group-hover:translate-y-1"
              />
              <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-[30px] border border-border/80 bg-surface/92 p-8 shadow-panel transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-primary/40">
                <span className="absolute right-8 top-8 text-3xl font-light text-muted/35 transition-transform duration-300 group-hover:translate-x-1">
                  /
                </span>
                <div>
                  <p className="text-[34px] font-black leading-tight tracking-normal text-ink sm:text-[38px]">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-2 text-[30px] font-black leading-tight tracking-normal text-ink">
                    {card.title}
                  </h2>
                </div>
                <div className="mt-6 flex items-end justify-between gap-5">
                  <p className="max-w-[280px] text-base font-bold leading-8 text-secondary">
                    {card.description}
                  </p>
                  {card.mark === "program" ? (
                    <LogoMark className="h-12 w-12 shrink-0 rounded-md opacity-90 shadow-card" />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[image:var(--gradient-primary)] text-xl font-black text-white shadow-card">
                      C
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
