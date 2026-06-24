import { PageShell, TextLink } from "@/components/ui";

export default function ProgramNotFound() {
  return (
    <PageShell>
      <section className="rounded-lg border border-border bg-surface p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-danger">Not Found</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-ink">
          未找到活动资料
        </h1>
        <p className="mt-3 text-secondary">该活动可能尚未发布或已归档。</p>
        <div className="mt-6">
          <TextLink href="/programs">返回活动库</TextLink>
        </div>
      </section>
    </PageShell>
  );
}

