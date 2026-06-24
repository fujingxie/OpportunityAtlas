import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-[1180px] flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 py-20 text-center shadow-panel sm:px-12">
        <div className="animate-enter flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-soft text-primary shadow-card">
          <LogoMark className="h-12 w-12" />
        </div>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-muted">
          Opportunity Atlas
        </p>
        <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-normal text-ink sm:text-6xl">
          把活动资料与学生案例整理成可信赖的机会地图
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-secondary sm:text-lg">
          当前版本聚焦活动库、案例库与管理员数据管理，先用结构化内容支撑顾问和学生做清晰决策。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            className="min-h-11 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-white hover:-translate-y-0.5"
            href="/programs"
          >
            浏览活动库
          </Link>
          <Link
            className="min-h-11 rounded-sm border border-border bg-surface px-5 py-3 text-sm font-bold text-primary hover:-translate-y-0.5 hover:border-primary"
            href="/cases"
          >
            查看案例库
          </Link>
        </div>
      </section>
    </main>
  );
}

