"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-73px)] px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[720px] rounded-lg border border-border bg-surface p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Loading</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-ink">
            正在检查管理员登录态
          </h1>
        </section>
      </main>
    );
  }

  if (role !== "admin") {
    return (
      <main className="min-h-[calc(100vh-73px)] px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[720px] rounded-lg border border-border bg-surface p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-danger">403</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-ink">
            仅管理员可访问数据管理
          </h1>
          <p className="mt-4 leading-8 text-secondary">
            请使用右上角管理员登录入口登录。登录态由 `GET /api/auth/me` 返回，管理端接口会再次校验 admin session。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
