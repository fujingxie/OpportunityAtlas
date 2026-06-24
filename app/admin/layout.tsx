import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/features/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}

