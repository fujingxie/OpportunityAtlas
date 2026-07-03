"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { role, loading, login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");
    try {
      await login(email, password);
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "管理员登录失败");
    } finally {
      setSubmitting(false);
    }
  };

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
      <main className="min-h-[calc(100vh-76px)] px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-[980px] overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:grid-cols-[1fr_420px]">
          <div className="bg-navy p-8 text-white lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">Admin</p>
            <h1 className="mt-4 text-[34px] font-black leading-tight tracking-normal text-white">
              登录数据管理
            </h1>
            <p className="mt-5 max-w-md text-sm font-bold leading-7 text-white/72">
              管理员登录入口已收敛到 `/admin`。登录后可进行文档录入、活动维护、案例维护、关联管理和标签管理。
            </p>
            <div className="mt-8 grid gap-3 text-sm font-bold text-white/78">
              <div className="rounded-sm border border-white/10 bg-white/10 p-4">
                公共页面不再显示管理员登录按钮。
              </div>
              <div className="rounded-sm border border-white/10 bg-white/10 p-4">
                管理端接口仍会校验 admin session。
              </div>
            </div>
          </div>

          <form className="p-8 lg:p-10" onSubmit={(event) => void handleSubmit(event)}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              Sign in
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-normal text-ink">
              管理员账号
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-black text-secondary">邮箱</span>
                <input
                  aria-label="管理员邮箱"
                  autoComplete="email"
                  className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 text-sm font-bold text-ink outline-none focus:border-primary"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  type="email"
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-secondary">密码</span>
                <input
                  aria-label="管理员密码"
                  autoComplete="current-password"
                  className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 text-sm font-bold text-ink outline-none focus:border-primary"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入管理员密码"
                  type="password"
                  value={password}
                />
              </label>
              {loginError ? (
                <p className="rounded-sm border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-bold text-danger">
                  {loginError}
                </p>
              ) : null}
              <button
                className="min-h-12 w-full rounded-sm bg-primary px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "登录中" : "登录数据管理"}
              </button>
              <Link
                className="flex min-h-11 items-center justify-center rounded-sm border border-border px-4 text-sm font-black text-primary hover:border-primary"
                href="/"
              >
                返回首页
              </Link>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
