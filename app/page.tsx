import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

const quickTags = ["STEM 科研", "G10-G11 夏校", "数学竞赛", "中等背景案例"];

const entryCards = [
  {
    href: "/programs",
    title: "浏览活动",
    description: "检索竞赛、夏校、科研项目，按年级、学科与形式快速筛选。",
    label: "50+ 活动资料",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    icon: "program"
  },
  {
    href: "/cases",
    title: "浏览案例",
    description: "查看匿名学生路径，比较活动组合、申请方向与结果复盘。",
    label: "10 个案例样本",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    icon: "case"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-76px)] px-4 py-12 sm:px-6 lg:h-[calc(100vh-76px)] lg:overflow-hidden lg:px-9 lg:py-8">
      <section className="mx-auto flex max-w-[1180px] flex-col items-center">
        <div className="animate-enter flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-5 py-2 text-sm font-black text-primary shadow-card">
            <LogoMark className="h-5 w-5" />
            Opportunity Atlas
          </div>
          <h1 className="mt-14 max-w-3xl text-[44px] font-black leading-[1.08] tracking-normal text-ink sm:text-[56px] lg:mt-16">
            发现活动机会，
            <br />
            连接真实案例路径
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-secondary sm:text-lg">
            检索竞赛、夏校、科研项目，也查看不同背景学生的活动组合与结果复盘。
          </p>

          <form
            action="/programs"
            className="mt-8 flex w-full max-w-[560px] overflow-hidden rounded-md border border-border bg-surface shadow-card focus-within:border-primary"
          >
            <input
              aria-label="搜索活动与案例"
              className="min-h-14 flex-1 border-0 bg-transparent px-5 text-base font-bold text-ink outline-none placeholder:text-muted"
              name="q"
              placeholder="搜索活动、案例、学科或年级"
              type="search"
            />
            <button
              aria-label="搜索"
              className="grid w-16 place-items-center bg-navy text-white hover:bg-primary"
              type="submit"
            >
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path
                  d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                />
              </svg>
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickTags.map((tag) => (
              <Link
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-black text-secondary shadow-card hover:border-primary hover:text-primary"
                href={`/programs?q=${encodeURIComponent(tag)}`}
                key={tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 grid w-full gap-8 md:grid-cols-2 lg:mt-14">
          {entryCards.map((card) => (
            <Link
              className="group relative min-h-[210px] overflow-hidden rounded-lg border border-border bg-navy shadow-panel hover:-translate-y-1"
              href={card.href}
              key={card.href}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0 bg-navy/70" />
              <div className="relative flex h-full min-h-[210px] flex-col justify-end p-7 text-white">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-white/14 text-white">
                  {card.icon === "program" ? (
                    <LogoMark className="h-9 w-9" />
                  ) : (
                    <span className="text-2xl font-black">C</span>
                  )}
                </div>
                <p className="text-sm font-black text-white/70">{card.label}</p>
                <h2 className="mt-2 text-3xl font-black tracking-normal">{card.title}</h2>
                <p className="mt-3 max-w-md text-sm font-bold leading-7 text-white/78">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
