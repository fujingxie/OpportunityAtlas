"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { apiFetch, toQueryString } from "@/lib/api-client";
import type { StudentCase, Tag } from "@/lib/types";
import { normalizeText } from "@/lib/utils";

const fallbackGrades = ["G9", "G10", "G11", "G12"];
const schoolTypes = ["all", "international", "public", "other"];
const fallbackActivityTypes = ["Competition", "Summer School", "Research Program"];
const fallbackMajors = ["Engineering", "Data Science", "Econ", "Humanities"];
const resultTiers = ["all", "Top 20", "Top 30", "Selective", "Matched", "Developing", "Portfolio"];

function optionsFromTags(tags: Tag[], group: Tag["group"], fallback: string[]) {
  const enabledNames = tags
    .filter((tag) => tag.group === group && tag.enabled)
    .map((tag) => tag.name);
  const names = enabledNames.length ? enabledNames : fallback;
  const orderedNames = [
    ...fallback.filter((option) => names.includes(option)),
    ...names.filter((option) => !fallback.includes(option))
  ];
  return ["all", ...Array.from(new Set(orderedNames))];
}

export function CaseDirectory() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [schoolType, setSchoolType] = useState("all");
  const [activityType, setActivityType] = useState("all");
  const [intendedMajor, setIntendedMajor] = useState("all");
  const [resultTier, setResultTier] = useState("all");
  const [caseData, setCaseData] = useState<StudentCase[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Tag[]>("/api/tags")
      .then((response) => {
        setTags(response.data);
      })
      .catch(() => {
        setTags([]);
      })
      .finally(() => setTagsLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch<StudentCase[]>(
      `/api/cases${toQueryString({
        q,
        grade,
        schoolType,
        activityType,
        intendedMajor,
        resultTier,
        pageSize: 100
      })}`
    )
      .then((response) => {
        setCaseData(response.data);
        setError("");
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "案例数据加载失败");
      })
      .finally(() => setLoading(false));
  }, [activityType, grade, intendedMajor, q, resultTier, schoolType]);

  const filterOptions = useMemo(
    () => ({
      grades: optionsFromTags(tags, "grade", fallbackGrades),
      activityTypes: optionsFromTags(tags, "program_type", fallbackActivityTypes),
      majors: optionsFromTags(tags, "major", fallbackMajors)
    }),
    [tags]
  );

  const cases = useMemo(
    () =>
      caseData.filter((studentCase) => {
        const normalizedQ = normalizeText(q);
        if (normalizedQ) {
          const haystack = [
            studentCase.anonymousCode,
            studentCase.academicSummary,
            studentCase.intendedMajor,
            studentCase.resultSummary,
            studentCase.personalSummary,
            ...studentCase.tags,
            ...studentCase.activityExperience.map((activity) => activity.programName)
          ].join(" ");
          if (!normalizeText(haystack).includes(normalizedQ)) {
            return false;
          }
        }

        if (grade !== "all" && studentCase.grade !== grade) {
          return false;
        }
        if (schoolType !== "all" && studentCase.schoolType !== schoolType) {
          return false;
        }
        if (
          activityType !== "all" &&
          !studentCase.activityExperience.some((activity) => activity.type === activityType)
        ) {
          return false;
        }
        if (
          intendedMajor !== "all" &&
          !normalizeText(studentCase.intendedMajor).includes(normalizeText(intendedMajor))
        ) {
          return false;
        }
        if (resultTier !== "all" && studentCase.resultTier !== resultTier) {
          return false;
        }
        return true;
      }),
    [activityType, caseData, grade, intendedMajor, q, resultTier, schoolType]
  );

  return (
    <div className="grid gap-0 overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:h-[calc(100vh-124px)] lg:grid-cols-[300px_1fr]">
      <aside className="scroll-pane border-b border-border bg-surface p-7 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <h2 className="text-base font-black tracking-normal text-ink">案例筛选</h2>
        <div className="mt-6 space-y-7">
          <FilterGroup label="年级" onChange={setGrade} options={filterOptions.grades} value={grade} />
          <FilterGroup
            label="学校类型"
            onChange={setSchoolType}
            options={schoolTypes}
            value={schoolType}
          />
          <FilterGroup
            label="活动类型"
            onChange={setActivityType}
            options={filterOptions.activityTypes}
            value={activityType}
          />
          <FilterGroup
            label="申请方向"
            onChange={setIntendedMajor}
            options={filterOptions.majors}
            value={intendedMajor}
          />
          <FilterGroup
            label="结果层级"
            onChange={setResultTier}
            options={resultTiers}
            value={resultTier}
          />
        </div>
        {tagsLoading ? (
          <p className="mt-6 text-xs font-bold leading-6 text-muted">正在加载标签配置...</p>
        ) : null}
      </aside>

      <section className="scroll-pane bg-soft p-5 lg:h-full lg:overflow-y-auto lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <h2 className="text-[34px] font-black leading-tight tracking-normal text-ink">
              案例库
            </h2>
            <p className="mt-2 text-sm font-bold leading-7 text-secondary">
              不是只看成功故事，而是比较不同背景、路径和结果。
            </p>
          </div>
          <label className="flex min-h-12 items-center gap-2 rounded-sm border border-border bg-surface px-4 text-sm font-black text-secondary shadow-card">
            <span>⌕</span>
            <input
              className="w-[240px] border-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
              id="case-search"
              onChange={(event) => setQ(event.target.value)}
              placeholder="搜索案例"
              value={q}
            />
          </label>
        </div>

        {loading ? (
          <EmptyState description="正在请求后端案例接口。" title="加载案例中" />
        ) : error ? (
          <EmptyState description={error} title="案例数据加载失败" />
        ) : cases.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
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

function CaseCardItem({ studentCase }: { studentCase: StudentCase }) {
  return (
    <Card className="relative overflow-hidden rounded-[24px] p-5 lg:p-6">
      <div className="flex flex-wrap gap-2">
        <Badge tone="amber">{studentCase.gpaRange}</Badge>
        <Badge>{studentCase.grade}</Badge>
        <Badge>{studentCase.schoolType}</Badge>
      </div>
      <h2 className="mt-3 text-[23px] font-black leading-tight tracking-normal text-ink">
        <Link className="hover:text-primary" href={`/cases/${studentCase.id}`}>
          {studentCase.anonymousCode}｜{studentCase.intendedMajor}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-7 text-secondary">
        {studentCase.academicSummary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {studentCase.tags.slice(0, 4).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-border bg-soft p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
          活动路径
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-secondary">
          {studentCase.activityExperience.map((activity, index) => (
            <span className="flex items-center gap-2" key={`${activity.stage}-${activity.programName}`}>
              {index > 0 ? <span className="text-muted">/</span> : null}
              <span>{activity.programName}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm font-black text-ink">{studentCase.resultSummary}</p>
        <Link
          className="shrink-0 rounded-sm border border-border bg-surface px-4 py-3 text-sm font-black text-primary hover:border-primary"
          href={`/cases/${studentCase.id}`}
        >
          详情
        </Link>
      </div>
    </Card>
  );
}
