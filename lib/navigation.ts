import type { UserRole } from "@/lib/types";

export type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/programs", label: "活动库" },
  { href: "/cases", label: "案例库" },
  { href: "/admin/import", label: "数据管理", adminOnly: true }
];

export function visibleNavItems(role: UserRole) {
  return navItems.filter((item) => !item.adminOnly || role === "admin");
}

