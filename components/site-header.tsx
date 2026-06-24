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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto grid min-h-[76px] max-w-[1440px] grid-cols-1 items-center gap-4 px-5 py-3 md:grid-cols-[1fr_auto_1fr] md:px-9">
        <Link className="flex min-h-11 items-center gap-3 rounded-sm" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-[image:var(--gradient-primary)] text-white shadow-card">
            <LogoMark className="h-7 w-7" />
          </span>
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
        <label className="flex min-h-11 items-center justify-self-start rounded-sm border border-border bg-surface px-3 text-sm font-bold text-secondary shadow-card md:justify-self-end">
          <span className="sr-only">角色</span>
          <select
            aria-label="切换角色"
            className="rounded-sm border-0 bg-transparent px-2 py-1 text-sm font-black text-ink"
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
