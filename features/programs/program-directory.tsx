"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { apiFetch, toQueryString } from "@/lib/api-client";
import type { Program } from "@/lib/types";
import { includesAny, normalizeText } from "@/lib/utils";

type ActivityQuestionStep = 1 | 2 | 3;

const gradeChoices = ["G9", "G10", "G11", "G12"];
const subjectChoices = [
  { label: "STEM / 理工", value: "STEM" },
  { label: "商科 / 经济", value: "商科/经济" },
  { label: "人文社科", value: "人文社科" },
  { label: "艺术 / 传媒", value: "艺术" },
  { label: "还不确定", value: "综合" }
];
const experienceChoices = [
  { label: "竞赛证明", value: "Competition", description: "用成绩证明学科能力" },
  { label: "夏校探索", value: "Summer School", description: "确认方向并获得课堂体验" },
  { label: "科研产出", value: "Research Program", description: "形成论文、展示或研究叙事" },
  { label: "先看综合", value: "all", description: "暂时不限定活动类型" }
];
const formatChoices = [
  { label: "不限形式", value: "all" },
  { label: "线上", value: "online" },
  { label: "线下", value: "offline" },
  { label: "混合", value: "hybrid" }
];
const locationChoices = [
  { label: "不限地区", value: "all" },
  { label: "线上", value: "线上" },
  { label: "美国", value: "美国" },
  { label: "英国", value: "英国" },
  { label: "香港", value: "香港" },
  { label: "全球", value: "全球" }
];
const costChoices = [
  { label: "不限费用", value: "all" },
  { label: "优先免费", value: "free" },
  { label: "可接受付费", value: "paid" }
];

export function ProgramDirectory({
  initialQ = "",
  initialPrograms
}: {
  initialQ?: string;
  initialPrograms?: Program[];
}) {
  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [format, setFormat] = useState("all");
  const [location, setLocation] = useState("all");
  const [costType, setCostType] = useState("all");
  const [draftType, setDraftType] = useState("all");
  const [draftSubject, setDraftSubject] = useState("all");
  const [draftGrade, setDraftGrade] = useState("all");
  const [draftFormat, setDraftFormat] = useState("all");
  const [draftLocation, setDraftLocation] = useState("all");
  const [draftCostType, setDraftCostType] = useState("all");
  const [questionStep, setQuestionStep] = useState<ActivityQuestionStep>(1);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [programData, setProgramData] = useState<Program[]>(initialPrograms ?? []);
  const [loading, setLoading] = useState(!initialPrograms?.length);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<Program[]>(
      `/api/programs${toQueryString({
        q,
        type,
        subject,
        grade,
        format,
        location,
        costType,
        pageSize: 100
      })}`
    )
      .then((response) => {
        setProgramData(response.data);
        setError("");
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "活动数据加载失败");
      })
      .finally(() => setLoading(false));
  }, [costType, format, grade, location, q, subject, type]);

  const openQuestionnaire = () => {
    setDraftType(type);
    setDraftSubject(subject);
    setDraftGrade(grade);
    setDraftFormat(format);
    setDraftLocation(location);
    setDraftCostType(costType);
    setQuestionStep(1);
    setQuestionnaireOpen(true);
  };

  const resetFilters = () => {
    setQ("");
    setType("all");
    setSubject("all");
    setGrade("all");
    setFormat("all");
    setLocation("all");
    setCostType("all");
    setDraftType("all");
    setDraftSubject("all");
    setDraftGrade("all");
    setDraftFormat("all");
    setDraftLocation("all");
    setDraftCostType("all");
    setQuestionStep(1);
  };

  const applyQuestionnaire = () => {
    setType(draftType);
    setSubject(draftSubject);
    setGrade(draftGrade);
    setFormat(draftFormat);
    setLocation(draftLocation);
    setCostType(draftCostType);
    setQuestionnaireOpen(false);
  };

  const programs = useMemo(
    () =>
      programData.filter((program) => {
        const normalizedQ = normalizeText(q);
        if (normalizedQ) {
          const haystack = [
            program.name,
            program.organization,
            program.description,
            program.subjectArea,
            program.location,
            ...program.highlights,
            ...program.tags
          ].join(" ");
          if (!normalizeText(haystack).includes(normalizedQ)) {
            return false;
          }
        }

        if (type !== "all" && program.type !== type) {
          return false;
        }
        if (
          subject !== "all" &&
          !includesAny(program.subjectArea, [subject]) &&
          !program.tags.includes(subject)
        ) {
          return false;
        }
        if (grade !== "all" && !program.gradeRange.includes(grade)) {
          return false;
        }
        if (format !== "all" && program.format !== format) {
          return false;
        }
        if (location !== "all" && !normalizeText(program.location).includes(normalizeText(location))) {
          return false;
        }
        if (costType === "free" && !includesAny(program.costText, ["免费", "承担"])) {
          return false;
        }
        if (costType === "paid" && includesAny(program.costText, ["免费", "承担"])) {
          return false;
        }
        return true;
      }),
    [costType, format, grade, location, programData, q, subject, type]
  );

  return (
    <div className="grid gap-0 overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:h-[calc(100vh-124px)] lg:grid-cols-[300px_1fr]">
      <aside className="scroll-pane border-b border-border bg-surface p-7 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <h2 className="text-base font-black tracking-normal text-ink">活动探索</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-secondary">
          不确定适合什么活动时，先回答年级、目标和执行约束，系统会筛出更接近的活动。
        </p>
        <button
          className="mt-6 min-h-11 w-full rounded-sm bg-primary px-4 text-sm font-black text-white shadow-card"
          onClick={openQuestionnaire}
          type="button"
        >
          开始活动问卷
        </button>
        <div className="mt-6 space-y-3">
          <FilterSummary label="当前年级" value={grade === "all" ? "未选择" : grade} />
          <FilterSummary label="申请方向" value={choiceLabel(subjectChoices, subject)} />
          <FilterSummary label="经历目标" value={choiceLabel(experienceChoices, type)} />
          <FilterSummary label="形式 / 地点" value={`${choiceLabel(formatChoices, format)} / ${choiceLabel(locationChoices, location)}`} />
          <FilterSummary label="费用" value={choiceLabel(costChoices, costType)} />
          {q ? <FilterSummary label="关键词" value={q} /> : null}
        </div>
        <button
          className="mt-5 min-h-10 w-full rounded-sm border border-border bg-surface px-4 text-sm font-black text-primary hover:border-primary"
          onClick={resetFilters}
          type="button"
        >
          清空筛选
        </button>
      </aside>

      <section className="scroll-pane bg-soft p-5 lg:h-full lg:overflow-y-auto lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <h2 className="text-[34px] font-black leading-tight tracking-normal text-ink">
              活动库
            </h2>
            <p className="mt-2 text-sm font-bold leading-7 text-secondary">
              共检索到 {programs.length} 个活动，数据来自后端接口。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-sm border border-border bg-surface px-5 text-sm font-black text-primary shadow-card hover:border-primary"
              onClick={openQuestionnaire}
              type="button"
            >
              按问题筛选活动
            </button>
            <div className="flex min-h-12 items-center rounded-sm border border-border bg-surface px-4 text-sm font-black text-secondary shadow-card">
              排序：相关案例 ↓
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
          <div>
            {loading ? (
              <EmptyState description="正在请求后端活动接口。" title="加载活动中" />
            ) : error ? (
              <EmptyState description={error} title="活动数据加载失败" />
            ) : programs.length ? (
              <div className="space-y-5">
                {programs.map((program) => (
                  <ProgramCardItem key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="当前筛选条件没有结果，可以放宽年级、方向、形式或费用条件。"
                title="暂无活动结果"
              />
            )}
          </div>
          <RelatedCasePanel />
        </div>
      </section>
      {questionnaireOpen ? (
        <ProgramQuestionnaireModal
          costType={draftCostType}
          format={draftFormat}
          grade={draftGrade}
          location={draftLocation}
          onApply={applyQuestionnaire}
          onClose={() => setQuestionnaireOpen(false)}
          onCostTypeChange={setDraftCostType}
          onFormatChange={setDraftFormat}
          onGradeChange={setDraftGrade}
          onLocationChange={setDraftLocation}
          onReset={() => {
            setDraftType("all");
            setDraftSubject("all");
            setDraftGrade("all");
            setDraftFormat("all");
            setDraftLocation("all");
            setDraftCostType("all");
            setQuestionStep(1);
          }}
          onStepChange={setQuestionStep}
          onSubjectChange={setDraftSubject}
          onTypeChange={setDraftType}
          step={questionStep}
          subject={draftSubject}
          type={draftType}
        />
      ) : null}
    </div>
  );
}

function FilterSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-soft px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}

function ProgramQuestionnaireModal({
  step,
  grade,
  subject,
  type,
  format,
  location,
  costType,
  onStepChange,
  onGradeChange,
  onSubjectChange,
  onTypeChange,
  onFormatChange,
  onLocationChange,
  onCostTypeChange,
  onReset,
  onApply,
  onClose
}: {
  step: ActivityQuestionStep;
  grade: string;
  subject: string;
  type: string;
  format: string;
  location: string;
  costType: string;
  onStepChange: (value: ActivityQuestionStep) => void;
  onGradeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCostTypeChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const canGoNext = step === 1 ? grade !== "all" : true;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <div className="max-h-[calc(100vh-32px)] w-full max-w-[760px] overflow-auto rounded-[28px] border border-border bg-surface p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              Step {step} / 3
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-ink">活动探索问卷</h2>
            <p className="mt-2 text-sm font-bold leading-7 text-secondary">
              先描述你的阶段和目标，再筛选适合现在投入的活动。
            </p>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-sm border border-border bg-surface text-lg font-black text-secondary hover:border-primary hover:text-primary"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div
              className={`h-1.5 rounded-full ${item <= step ? "bg-primary" : "bg-soft"}`}
              key={item}
            />
          ))}
        </div>

        <div className="mt-6">
          {step === 1 ? (
            <QuestionBlock
              description="年级决定活动窗口期：G9-G10 更适合探索和打基础，G11-G12 更适合选择能沉淀结果的项目。"
              label="你目前读几年级？"
            >
              <div className="grid gap-2 sm:grid-cols-4">
                {gradeChoices.map((option) => (
                  <ChoiceButton
                    active={grade === option}
                    key={option}
                    onClick={() => {
                      onGradeChange(option);
                      onStepChange(2);
                    }}
                  >
                    {option}
                  </ChoiceButton>
                ))}
              </div>
            </QuestionBlock>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <QuestionBlock
                description="如果还不确定方向，先选“还不确定”，系统会保留综合类活动。"
                label="你更想申请或探索哪个方向？"
              >
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {subjectChoices.map((option) => (
                    <ChoiceButton
                      active={subject === option.value}
                      key={option.value}
                      onClick={() => onSubjectChange(option.value)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </div>
              </QuestionBlock>

              <QuestionBlock
                description="这里不是让你先懂活动分类，而是判断当前履历最缺哪种证据。"
                label="你现在最需要哪类经历？"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {experienceChoices.map((option) => (
                    <ChoiceButton
                      active={type === option.value}
                      description={option.description}
                      key={option.value}
                      onClick={() => onTypeChange(option.value)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </div>
              </QuestionBlock>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <QuestionBlock label="你希望活动以什么形式进行？">
                <div className="grid gap-2 sm:grid-cols-4">
                  {formatChoices.map((option) => (
                    <ChoiceButton
                      active={format === option.value}
                      key={option.value}
                      onClick={() => onFormatChange(option.value)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </div>
              </QuestionBlock>

              <QuestionBlock label="你能接受的地点或地区？">
                <div className="grid gap-2 sm:grid-cols-3">
                  {locationChoices.map((option) => (
                    <ChoiceButton
                      active={location === option.value}
                      key={option.value}
                      onClick={() => onLocationChange(option.value)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </div>
              </QuestionBlock>

              <QuestionBlock label="费用偏好是什么？">
                <div className="grid gap-2 sm:grid-cols-3">
                  {costChoices.map((option) => (
                    <ChoiceButton
                      active={costType === option.value}
                      key={option.value}
                      onClick={() => onCostTypeChange(option.value)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </div>
              </QuestionBlock>
            </div>
          ) : null}
        </div>

        <div className="mt-7 flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <button
            className="rounded-sm border border-border bg-surface px-4 py-3 text-sm font-black text-secondary hover:border-primary"
            onClick={onReset}
            type="button"
          >
            清空
          </button>
          <button
            className="rounded-sm border border-border bg-surface px-4 py-3 text-sm font-black text-ink hover:border-primary"
            onClick={step === 1 ? onClose : () => onStepChange((step - 1) as ActivityQuestionStep)}
            type="button"
          >
            {step === 1 ? "取消" : "上一步"}
          </button>
          {step < 3 ? (
            <button
              className="rounded-sm bg-primary px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canGoNext}
              onClick={() => onStepChange((step + 1) as ActivityQuestionStep)}
              type="button"
            >
              下一步
            </button>
          ) : (
            <button
              className="rounded-sm bg-primary px-5 py-3 text-sm font-black text-white"
              onClick={onApply}
              type="button"
            >
              应用筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionBlock({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-black tracking-normal text-ink">{label}</h3>
      {description ? (
        <p className="mt-2 text-sm font-bold leading-6 text-secondary">{description}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChoiceButton({
  active,
  children,
  description,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-11 rounded-sm border px-4 py-3 text-left text-sm font-black transition ${
        active
          ? "border-primary bg-primary text-white shadow-card"
          : "border-border bg-soft text-secondary hover:border-primary hover:text-primary"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="block">{children}</span>
      {description ? (
        <span className={`mt-1 block text-xs font-bold ${active ? "text-white/80" : "text-muted"}`}>
          {description}
        </span>
      ) : null}
    </button>
  );
}

function choiceLabel(
  choices: Array<{ label: string; value: string }>,
  value: string
) {
  return choices.find((choice) => choice.value === value)?.label ?? "未选择";
}

function ProgramCardItem({ program }: { program: Program }) {
  return (
    <Card className="rounded-[24px] p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_176px]">
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge tone={program.type === "Competition" ? "green" : "blue"}>
              {program.type}
            </Badge>
            <Badge>{program.gradeRange}</Badge>
            <Badge>{program.format}</Badge>
            {program.status === "archived" ? <Badge tone="amber">待补字段</Badge> : null}
          </div>
          <h2 className="mt-3 text-[23px] font-black leading-tight tracking-normal text-ink">
            <Link className="hover:text-primary" href={`/programs/${program.id}`}>
              {program.name}
            </Link>
          </h2>
          <p className="mt-2 text-sm font-black text-secondary">{program.organization}</p>
          <p className="mt-2 line-clamp-2 text-[15px] font-bold leading-7 text-secondary">
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
              {program.tags.length}
            </p>
            <p className="text-sm font-black text-secondary">资料标签</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                style={{ width: `${Math.min(100, program.tags.length * 14)}%` }}
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
    <div className="rounded-sm border border-border bg-soft p-3">
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
    <aside className="h-max rounded-[24px] border border-border bg-surface p-5 shadow-card xl:sticky xl:top-0">
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
