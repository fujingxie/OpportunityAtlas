"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { filterCases, getRelatedPrograms } from "@/lib/mock/service";
import type { StudentCase } from "@/lib/types";

const grades = ["all", "G9", "G10", "G11", "G12"];
const schoolTypes = ["all", "international", "public", "other"];
const activityTypes = ["all", "Competition", "Summer School", "Research Program"];
const resultTiers = ["all", "Top 20", "Top 30", "Selective", "Matched", "Developing", "Portfolio"];

const selectClass =
  "min-h-11 rounded-sm border border-border bg-surface px-3 text-sm font-bold text-ink hover:border-primary focus:border-primary";

export function CaseDirectory() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [schoolType, setSchoolType] = useState("all");
  const [activityType, setActivityType] = useState("all");
  const [resultTier, setResultTier] = useState("all");

  const cases = useMemo(
    () => filterCases({ q, grade, schoolType, activityType, resultTier }),
    [activityType, grade, q, resultTier, schoolType]
  );

  return (
    <div className="content-grid">
      <aside className="rounded-md border border-border bg-surface p-4 shadow-card">
        <h2 className="text-base font-extrabold tracking-normal text-ink">案例筛选</h2>
        <div className="mt-4 space-y-4">
          <FilterSelect label="年级" onChange={setGrade} options={grades} value={grade} />
          <FilterSelect
            label="学校类型"
            onChange={setSchoolType}
            options={schoolTypes}
            value={schoolType}
          />
          <FilterSelect
            label="活动类型"
            onChange={setActivityType}
            options={activityTypes}
            value={activityType}
          />
          <FilterSelect
            label="结果层级"
            onChange={setResultTier}
            options={resultTiers}
            value={resultTier}
          />
        </div>
      </aside>

      <section>
        <div className="mb-4 rounded-md border border-border bg-surface p-4 shadow-card">
          <label className="block text-sm font-extrabold text-ink" htmlFor="case-search">
            搜索案例
          </label>
          <input
            className="mt-2 min-h-11 w-full rounded-sm border border-border bg-soft px-3 text-sm text-ink hover:border-primary focus:border-primary"
            id="case-search"
            onChange={(event) => setQ(event.target.value)}
            placeholder="输入匿名编号、专业方向、活动或结果关键词"
            value={q}
          />
          <p className="mt-3 text-sm leading-7 text-secondary">
            案例默认匿名展示，包含不同背景层级和结果复盘。
          </p>
        </div>

        {cases.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((studentCase) => (
              <CaseCardItem key={studentCase.id} studentCase={studentCase} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="当前筛选条件没有结果，可以调整年级、活动类型或结果层级。"
            title="暂无案例结果"
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

function CaseCardItem({ studentCase }: { studentCase: StudentCase }) {
  const relatedPrograms = getRelatedPrograms(studentCase);

  return (
    <Card>
      <div className="flex flex-wrap gap-2">
        <Badge tone="amber">{studentCase.gpaRange}</Badge>
        <Badge>{studentCase.grade}</Badge>
        <Badge>{studentCase.schoolType}</Badge>
      </div>
      <h2 className="mt-4 text-xl font-extrabold tracking-normal text-ink">
        <Link className="hover:text-primary" href={`/cases/${studentCase.id}`}>
          {studentCase.anonymousCode}｜{studentCase.intendedMajor}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-secondary">
        {studentCase.academicSummary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {studentCase.tags.slice(0, 4).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-5 rounded-sm border border-border bg-soft p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
          活动路径
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-secondary">
          {relatedPrograms.map((program, index) => (
            <span className="flex items-center gap-2" key={program.id}>
              {index > 0 ? <span className="text-muted">/</span> : null}
              <span>{program.name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm font-bold text-ink">{studentCase.resultSummary}</p>
        <Link
          className="shrink-0 rounded-sm border border-border px-3 py-2 text-sm font-bold text-primary hover:border-primary"
          href={`/cases/${studentCase.id}`}
        >
          详情
        </Link>
      </div>
    </Card>
  );
}

