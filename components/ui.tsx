import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-9">
      {children}
    </main>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-[34px] font-black leading-tight tracking-normal text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-lg border border-border bg-surface p-6 shadow-card",
        className
      )}
    >
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    default: "border-border bg-soft text-secondary",
    blue: "border-primary/20 bg-primary/10 text-primary",
    green: "border-success/20 bg-success/10 text-success",
    amber: "border-warning/20 bg-warning/10 text-warning",
    red: "border-danger/20 bg-danger/10 text-danger"
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function TextLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="font-bold text-primary underline-offset-4 hover:underline" href={href}>
      {children}
    </Link>
  );
}

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-soft p-8 text-center">
      <h2 className="text-lg font-extrabold tracking-normal text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-secondary">{description}</p>
    </div>
  );
}
