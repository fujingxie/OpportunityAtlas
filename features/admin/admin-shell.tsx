"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const adminNav = [
  { href: "/admin/import", label: "文档录入" },
  { href: "/admin/programs", label: "活动管理" },
  { href: "/admin/cases", label: "案例管理" },
  { href: "/admin/review", label: "审核发布" },
  { href: "/admin/tags", label: "标签管理" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-[calc(100vh-73px)] bg-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-lg bg-navy p-4 text-white shadow-panel">
          <p className="px-2 text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">
            Admin
          </p>
          <h1 className="mt-2 px-2 text-xl font-extrabold tracking-normal">
            数据管理
          </h1>
          <nav className="mt-6 space-y-2" aria-label="Admin navigation">
            {adminNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-11 items-center rounded-sm px-3 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white",
                    active && "bg-white/15 text-white"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}

