"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { cx } from "@/lib/utils";

const adminNav = [
  { href: "/admin/import", label: "文档录入", hint: "上传、预览、发布" },
  { href: "/admin/programs", label: "活动管理", hint: "活动资料维护" },
  { href: "/admin/cases", label: "案例管理", hint: "匿名案例维护" },
  { href: "/admin/relations", label: "关联管理", hint: "活动案例关系" },
  { href: "/admin/tags", label: "标签管理", hint: "筛选字典维护" },
  { href: "/admin/help", label: "使用说明", hint: "后台操作说明" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <main className="h-[calc(100vh-76px)] overflow-hidden border-t border-border bg-soft">
      <div className="grid h-full lg:grid-cols-[236px_1fr]">
        <aside className="scroll-pane flex flex-col border-r border-white/10 bg-navy px-4 py-5 text-white lg:h-full lg:overflow-y-auto">
          <div className="min-w-0 flex-1">
            <div className="px-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">
                Admin Console
              </p>
              <h1 className="mt-2 text-xl font-black tracking-normal">数据管理</h1>
              <p className="mt-2 text-xs font-bold leading-5 text-white/50">
                录入、维护、关联和发布 Opportunity Atlas 数据。
              </p>
            </div>
            <nav className="mt-6 space-y-1.5" aria-label="Admin navigation">
              {adminNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "group flex min-h-[54px] items-center rounded-md px-3 text-sm font-black text-white/70 hover:bg-white/10 hover:text-white",
                      active && "bg-white text-navy shadow-card hover:bg-white hover:text-navy"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/10 text-xs font-black group-hover:bg-white/15">
                      {item.label.slice(0, 1)}
                    </span>
                    <span className="ml-3 min-w-0">
                      <span className="block leading-5">{item.label}</span>
                      <span
                        className={cx(
                          "mt-0.5 block truncate text-xs font-bold",
                          active ? "text-navy/55" : "text-white/45"
                        )}
                      >
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
          {user ? (
            <div className="mt-6 rounded-md border border-white/10 bg-white/10 p-3">
              <p className="truncate text-sm font-black text-white">{user.name}</p>
              <p className="mt-1 truncate text-xs font-bold text-white/55">{user.email}</p>
              <button
                className="mt-3 min-h-10 w-full rounded-sm bg-white px-3 text-xs font-black text-navy hover:bg-white/90"
                onClick={() => void logout()}
                type="button"
              >
                退出登录
              </button>
            </div>
          ) : null}
        </aside>
        <section className="scroll-pane min-w-0 overflow-y-auto px-5 py-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
