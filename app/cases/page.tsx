import { PageShell } from "@/components/ui";
import { CaseDirectory } from "@/features/cases/case-directory";

export default function CasesPage() {
  return (
    <PageShell>
      <CaseDirectory />
    </PageShell>
  );
}
