"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { useAuth } from "@/components/auth-provider";
import { visibleNavItems } from "@/lib/navigation";
import { cx } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { role, user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const items = visibleNavItems(role);

  const handleLogin = async () => {
    setError("");
    try {
      await login(email, password);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto grid min-h-[76px] max-w-[1440px] grid-cols-1 items-center gap-4 px-5 py-3 md:grid-cols-[1fr_auto_1fr] md:px-9">
        <Link className="flex min-h-11 items-center gap-3 rounded-sm" href="/">
          <LogoMark className="h-11 w-11 shrink-0 rounded-[12px] shadow-card" priority />
          <span className="text-xl font-black tracking-normal text-ink">
            Opportunity Atlas
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap items-center justify-start gap-3 md:justify-center md:gap-6">
          {items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex min-h-11 items-center rounded-sm px-2 text-[15px] font-black text-secondary hover:text-primary",
                  active &&
                    "text-primary after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[3px] after:rounded-full after:bg-primary"
                )}
                data-active={active}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="justify-self-start md:justify-self-end">
          {user ? (
            <div className="flex min-h-11 items-center gap-3 rounded-sm border border-border bg-surface px-3 text-sm font-bold text-secondary shadow-card">
              <span className="font-black text-ink">{user.name}</span>
              <span className="rounded-full bg-soft px-2 py-1 text-xs font-black text-primary">
                {user.role}
              </span>
              <button
                className="rounded-sm px-2 py-1 text-xs font-black text-secondary hover:text-danger"
                onClick={() => void logout()}
                type="button"
              >
                退出
              </button>
            </div>
          ) : (
            <details className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-sm border border-border bg-surface px-4 text-sm font-black text-ink shadow-card">
                {loading ? "检查登录" : "管理员登录"}
              </summary>
              <div className="absolute right-0 mt-2 w-[300px] rounded-md border border-border bg-surface p-4 shadow-panel">
                <div className="space-y-3">
                  <input
                    aria-label="管理员邮箱"
                    className="min-h-11 w-full rounded-sm border border-border px-3 text-sm font-bold outline-none focus:border-primary"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    type="email"
                    value={email}
                  />
                  <input
                    aria-label="管理员密码"
                    className="min-h-11 w-full rounded-sm border border-border px-3 text-sm font-bold outline-none focus:border-primary"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="管理员密码"
                    type="password"
                    value={password}
                  />
                  {error ? <p className="text-xs font-bold text-danger">{error}</p> : null}
                  <button
                    className="min-h-11 w-full rounded-sm bg-primary px-4 text-sm font-black text-white"
                    onClick={() => void handleLogin()}
                    type="button"
                  >
                    登录
                  </button>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
