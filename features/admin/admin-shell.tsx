"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const adminNav = [
  { href: "/admin/import", label: "文档录入" },
  { href: "/admin/programs", label: "活动管理" },
  { href: "/admin/cases", label: "案例管理" },
  { href: "/admin/relations", label: "关联管理" },
  { href: "/admin/tags", label: "标签管理" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="h-[calc(100vh-76px)] overflow-hidden px-4 py-6 sm:px-6 lg:px-9">
      <div className="mx-auto grid h-full max-w-[1440px] gap-0 overflow-hidden rounded-[34px] border border-border bg-soft shadow-panel lg:grid-cols-[250px_1fr]">
        <aside className="scroll-pane bg-navy p-5 text-white lg:h-full lg:overflow-y-auto">
          <p className="px-2 text-xs font-black uppercase tracking-[0.22em] text-white/55">
            Admin
          </p>
          <h1 className="mt-2 px-2 text-xl font-black tracking-normal">
            数据管理
          </h1>
          <nav className="mt-6 space-y-2" aria-label="Admin navigation">
            {adminNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-12 items-center rounded-sm px-4 text-sm font-black text-white/70 hover:bg-white/10 hover:text-white",
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
        <section className="scroll-pane min-w-0 overflow-y-auto p-5 lg:p-8">{children}</section>
      </div>
    </main>
  );
}
