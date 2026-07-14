import { PageShell } from "@/components/ui";
import { PathPlanner } from "@/features/planner/path-planner";

export default function PlannerPage() {
  return (
    <PageShell>
      <PathPlanner />
    </PageShell>
  );
}
