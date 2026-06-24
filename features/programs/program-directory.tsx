"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { filterPrograms, getRelatedCases } from "@/lib/mock/service";
import { mockPrograms } from "@/lib/mock/programs";
import type { Program } from "@/lib/types";

const programTypes = ["all", "Competition", "Summer School", "Research Program", "Other"];
const subjects = ["all", "STEM", "商科/经济", "人文社科", "艺术", "综合"];
const grades = ["all", "G9", "G10", "G11", "G12"];
const formats = ["all", "online", "offline", "hybrid"];
const costs = ["all", "free", "paid"];

const selectClass =
  "min-h-11 rounded-sm border border-border bg-surface px-3 text-sm font-bold text-ink hover:border-primary focus:border-primary";

export function ProgramDirectory() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [format, setFormat] = useState("all");
  const [costType, setCostType] = useState("all");

  const programs = useMemo(
    () => filterPrograms({ q, type, subject, grade, format, costType }),
    [costType, format, grade, q, subject, type]
  );

  return (
    <div className="content-grid">
      <aside className="rounded-md border border-border bg-surface p-4 shadow-card">
        <h2 className="text-base font-extrabold tracking-normal text-ink">筛选条件</h2>
        <div className="mt-4 space-y-4">
          <FilterSelect label="活动类型" onChange={setType} options={programTypes} value={type} />
          <FilterSelect label="学科方向" onChange={setSubject} options={subjects} value={subject} />
          <FilterSelect label="适合年级" onChange={setGrade} options={grades} value={grade} />
          <FilterSelect label="活动形式" onChange={setFormat} options={formats} value={format} />
          <FilterSelect label="费用类型" onChange={setCostType} options={costs} value={costType} />
        </div>
      </aside>

      <section>
        <div className="mb-4 rounded-md border border-border bg-surface p-4 shadow-card">
          <label className="block text-sm font-extrabold text-ink" htmlFor="program-search">
            搜索活动
          </label>
          <input
            className="mt-2 min-h-11 w-full rounded-sm border border-border bg-soft px-3 text-sm text-ink hover:border-primary focus:border-primary"
            id="program-search"
            onChange={(event) => setQ(event.target.value)}
            placeholder="输入活动名称、主办方、学科或地点"
            value={q}
          />
          <p className="mt-3 text-sm leading-7 text-secondary">
            已显示 {programs.length} / {mockPrograms.length} 条活动资料。
          </p>
        </div>

        {programs.length ? (
          <div className="space-y-4">
            {programs.map((program) => (
              <ProgramCardItem key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="当前筛选条件没有结果，可以放宽年级、形式或费用条件。"
            title="暂无活动结果"
          />
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <select
        className={`${selectClass} mt-2 w-full`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "全部" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProgramCardItem({ program }: { program: Program }) {
  const relatedCases = getRelatedCases(program);

  return (
    <Card>
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={program.type === "Competition" ? "green" : "blue"}>
              {program.type}
            </Badge>
            <Badge>{program.gradeRange}</Badge>
            <Badge>{program.format}</Badge>
            {program.status === "archived" ? <Badge tone="amber">待补字段</Badge> : null}
          </div>
          <h2 className="mt-4 text-xl font-extrabold tracking-normal text-ink">
            <Link className="hover:text-primary" href={`/programs/${program.id}`}>
              {program.name}
            </Link>
          </h2>
          <p className="mt-2 text-sm font-bold text-secondary">{program.organization}</p>
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-secondary">
            {program.description}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Meta label="学科" value={program.subjectArea} />
            <Meta label="地点" value={program.location} />
            <Meta label="费用" value={program.costText ?? "待补充"} />
          </dl>
        </div>
        <div className="flex min-w-[180px] flex-col justify-between gap-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div>
            <p className="text-3xl font-extrabold tracking-normal text-primary">
              {relatedCases.length}
            </p>
            <p className="text-sm font-bold text-secondary">相关案例</p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-sm font-bold text-white hover:-translate-y-0.5"
            href={`/programs/${program.id}`}
          >
            查看详情
          </Link>
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-soft p-3">
      <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 line-clamp-2 text-sm font-bold text-ink">{value}</dd>
    </div>
  );
}

