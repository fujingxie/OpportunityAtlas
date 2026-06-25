import { PageShell } from "@/components/ui";
import { ProgramDirectory } from "@/features/programs/program-directory";

export default function ProgramsPage({
  searchParams
}: {
  searchParams?: { q?: string };
}) {
  return (
    <PageShell>
      <ProgramDirectory initialQ={searchParams?.q ?? ""} />
    </PageShell>
  );
}
