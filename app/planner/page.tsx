import { PageShell } from "@/components/ui";
import { PathPlanner } from "@/features/planner/path-planner";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PlannerPage({
  searchParams
}: {
  searchParams?: {
    programId?: string | string[];
    caseId?: string | string[];
    q?: string | string[];
  };
}) {
  return (
    <PageShell>
      <PathPlanner
        sourceCaseId={firstParam(searchParams?.caseId)}
        sourceProgramId={firstParam(searchParams?.programId)}
        sourceQuery={firstParam(searchParams?.q)}
      />
    </PageShell>
  );
}
