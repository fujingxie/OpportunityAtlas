import { PageHeading, PageShell } from "@/components/ui";
import { ProgramDirectory } from "@/features/programs/program-directory";

export default function ProgramsPage() {
  return (
    <PageShell>
      <PageHeading
        description="基于内容文档录入的活动资料库，支持按类型、学科、年级、形式和费用筛选。"
        eyebrow="Programs"
        title="活动库"
      />
      <ProgramDirectory />
    </PageShell>
  );
}

