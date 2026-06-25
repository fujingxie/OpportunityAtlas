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

export function ProgramDirectory({ initialQ = "" }: { initialQ?: string }) {
  const [q, setQ] = useState(initialQ);
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
    <div className="grid gap-0 overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-border bg-surface p-7 lg:border-b-0 lg:border-r">
        <h2 className="text-base font-black tracking-normal text-ink">筛选条件</h2>
        <div className="mt-6 space-y-7">
          <FilterGroup label="活动分类" onChange={setType} options={programTypes} value={type} />
          <FilterGroup label="学科方向" onChange={setSubject} options={subjects} value={subject} />
          <FilterGroup label="适合年级" onChange={setGrade} options={grades} value={grade} />
          <FilterGroup label="形式" onChange={setFormat} options={formats} value={format} />
          <FilterGroup label="费用" onChange={setCostType} options={costs} value={costType} />
        </div>
      </aside>

      <section className="bg-soft p-6 lg:p-9">
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <h2 className="text-[34px] font-black leading-tight tracking-normal text-ink">
              活动库
            </h2>
            <p className="mt-2 text-sm font-bold leading-7 text-secondary">
              共检索到 {programs.length} 个活动，来自 `活动.docx` 的结构化 mock 数据。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex min-h-12 items-center gap-2 rounded-sm border border-border bg-surface px-4 text-sm font-black text-secondary shadow-card">
              <span>⌕</span>
              <input
                className="w-[220px] border-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
                id="program-search"
                onChange={(event) => setQ(event.target.value)}
                placeholder="STEM / Research / Summer"
                value={q}
              />
            </label>
            <div className="flex min-h-12 items-center rounded-sm border border-border bg-surface px-4 text-sm font-black text-secondary shadow-card">
              排序：相关案例 ↓
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
          <div>
            {programs.length ? (
              <div className="space-y-5">
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
          </div>
          <RelatedCasePanel />
        </div>
      </section>
    </div>
  );
}

function FilterGroup({
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
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-black tracking-normal text-ink">{label}</h3>
      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              className="flex min-h-9 w-full items-center justify-between rounded-sm px-1 text-left text-sm font-black text-secondary hover:text-primary"
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              <span>{option === "all" ? "全部" : option}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-[6px] border text-[11px] ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgramCardItem({ program }: { program: Program }) {
  const relatedCases = getRelatedCases(program);

  return (
    <Card className="rounded-[28px] p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_190px]">
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge tone={program.type === "Competition" ? "green" : "blue"}>
              {program.type}
            </Badge>
            <Badge>{program.gradeRange}</Badge>
            <Badge>{program.format}</Badge>
            {program.status === "archived" ? <Badge tone="amber">待补字段</Badge> : null}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-normal text-ink">
            <Link className="hover:text-primary" href={`/programs/${program.id}`}>
              {program.name}
            </Link>
          </h2>
          <p className="mt-2 text-sm font-black text-secondary">{program.organization}</p>
          <p className="mt-3 line-clamp-2 text-base font-bold leading-8 text-secondary">
            {program.description}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Meta label="学科" value={program.subjectArea} />
            <Meta label="地点" value={program.location} />
            <Meta label="费用" value={program.costText ?? "待补充"} />
          </dl>
        </div>
        <div className="flex min-w-[180px] flex-col justify-between gap-4 border-t border-dashed border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <p className="text-5xl font-black tracking-normal text-primary">
              {relatedCases.length}
            </p>
            <p className="text-sm font-black text-secondary">相关案例</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                style={{ width: `${Math.min(100, relatedCases.length * 28)}%` }}
              />
            </div>
          </div>
          <Link
            className="inline-flex min-h-14 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] px-4 text-sm font-black text-white shadow-card hover:-translate-y-0.5"
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
    <div className="rounded-sm border border-border bg-soft p-4">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-2 line-clamp-2 text-sm font-black text-ink">{value}</dd>
    </div>
  );
}

function RelatedCasePanel() {
  const cases = [
    {
      id: "c-018",
      title: "C-018｜STEM 顶尖型",
      description: "G11 国际学校，RSI + 数学竞赛，目标 Engineering。"
    },
    {
      id: "c-043",
      title: "C-043｜中等背景进阶",
      description: "G10 公立国际部，HiMCM + 校内科研，目标 Data Science。"
    },
    {
      id: "c-071",
      title: "C-071｜人文社科交叉",
      description: "YYGS + IEO，目标 Global Affairs / Econ。"
    }
  ];

  return (
    <aside className="h-max rounded-[28px] border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-black tracking-normal text-ink">相关案例速览</h2>
      <div className="mt-5 space-y-3">
        {cases.map((studentCase) => (
          <Link
            className="block rounded-md border border-border bg-gradient-to-b from-surface to-soft p-4 hover:border-primary"
            href={`/cases/${studentCase.id}`}
            key={studentCase.id}
          >
            <span className="block text-base font-black text-ink">{studentCase.title}</span>
            <span className="mt-2 block text-sm font-bold leading-7 text-secondary">
              {studentCase.description}
            </span>
          </Link>
        ))}
      </div>
      <Link
        className="mt-5 flex min-h-14 items-center justify-center rounded-md bg-navy px-4 text-sm font-black text-white hover:-translate-y-0.5"
        href="/cases"
      >
        查看全部相关案例
      </Link>
    </aside>
  );
}
