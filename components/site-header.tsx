"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { useAuth } from "@/components/auth-provider";
import { visibleNavItems } from "@/lib/navigation";
import { cx } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { role, setRole } = useAuth();
  const items = visibleNavItems(role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex min-h-11 items-center gap-3 rounded-sm" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-soft text-primary">
            <LogoMark className="h-7 w-7" />
          </span>
          <span className="text-lg font-extrabold tracking-normal text-ink">
            Opportunity Atlas
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-11 items-center rounded-sm px-3 text-sm font-bold text-secondary hover:bg-soft hover:text-primary",
                  active && "bg-soft text-primary"
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
        <label className="flex min-h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-sm font-bold text-secondary">
          <span>角色</span>
          <select
            aria-label="切换角色"
            className="rounded-sm border border-border bg-soft px-2 py-1 text-sm font-bold text-ink"
            onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "viewer")}
            value={role}
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </select>
        </label>
      </div>
    </header>
  );
}

