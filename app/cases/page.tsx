import { PageHeading, PageShell } from "@/components/ui";
import { CaseDirectory } from "@/features/cases/case-directory";

export default function CasesPage() {
  return (
    <PageShell>
      <PageHeading
        description="案例库不只展示成功故事，也保留中等、普通和结果不完全理想的真实路径复盘。"
        eyebrow="Cases"
        title="案例库"
      />
      <CaseDirectory />
    </PageShell>
  );
}

