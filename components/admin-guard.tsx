"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { role, setRole } = useAuth();

  if (role !== "admin") {
    return (
      <main className="min-h-[calc(100vh-73px)] px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[720px] rounded-lg border border-border bg-surface p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-danger">403</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-ink">
            仅管理员可访问数据管理
          </h1>
          <p className="mt-4 leading-8 text-secondary">
            当前 mock 登录态是 viewer。开发阶段可以切换为 admin 预览管理端，真实接入后将由
            `GET /api/auth/me` 返回角色。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="min-h-11 rounded-sm bg-primary px-4 text-sm font-bold text-white hover:-translate-y-0.5"
              onClick={() => setRole("admin")}
              type="button"
            >
              切换为 admin
            </button>
            <Link
              className="min-h-11 rounded-sm border border-border px-4 py-3 text-sm font-bold text-primary hover:border-primary"
              href="/"
            >
              回到首页
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

