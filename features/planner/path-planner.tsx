"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type {
  PlannerSourceContext,
  PlannerCaseRecommendation,
  PlannerIntent,
  PlannerProfile,
  PlannerProgramRecommendation,
  PlannerRecommendationResponse,
  Program,
  StudentCase,
} from "@/lib/types";
import { cx } from "@/lib/utils";

type PlannerStep = 1 | 2 | 3;

const gradeOptions: PlannerProfile["grade"][] = ["G9", "G10", "G11", "G12"];
const curriculumOptions = ["IB", "A-Level", "AP", "OSSD", "普高", "国际学校其他"];
const regionOptions = ["美国", "英国", "香港", "加拿大", "澳大利亚", "不确定"];
const subjectOptions = ["STEM", "商科/经济", "人文社科", "艺术传媒", "不确定"];
const budgetOptions: Array<{ label: string; value: PlannerProfile["budget"] }> = [
  { label: "不限预算", value: "all" },
  { label: "低成本优先", value: "low" },
  { label: "中等预算", value: "medium" },
  { label: "可接受高预算", value: "high" }
];
const formatOptions: Array<{ label: string; value: PlannerProfile["format"] }> = [
  { label: "不限形式", value: "all" },
  { label: "线上", value: "online" },
  { label: "线下", value: "offline" },
  { label: "混合", value: "hybrid" }
];
const intentOptions: Array<{
  label: string;
  value: PlannerIntent;
  description: string;
}> = [
  {
    label: "均衡规划",
    value: "balanced",
    description: "兼顾活动质量、可执行性和案例参考。"
  },
  {
    label: "冲刺挑战",
    value: "challenge",
    description: "优先推荐含金量更高、难度更强的路径。"
  },
  {
    label: "稳妥补强",
    value: "support",
    description: "优先补齐当前背景短板，降低执行风险。"
  },
  {
    label: "低成本优先",
    value: "cost_effective",
    description: "优先筛选线上、免费或性价比更高的活动。"
  },
  {
    label: "案例参考优先",
    value: "case_reference",
    description: "优先找相似学生路径，再反推活动组合。"
  }
];

const initialProfile: PlannerProfile = {
  grade: "G10",
  curriculum: "A-Level",
  targetRegion: "美国",
  subjectArea: "STEM",
  standardizedScore: "",
  languageScore: "",
  gpa: "",
  competitions: "",
  summerSchools: "",
  research: "",
  budget: "all",
  format: "all",
  intent: "balanced",
  notes: ""
};

type PathPlannerProps = {
  sourceProgramId?: string;
  sourceCaseId?: string;
  sourceQuery?: string;
};

function cleanSource(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function buildInitialProfile({
  sourceProgramId,
  sourceCaseId,
  sourceQuery
}: PathPlannerProps): PlannerProfile {
  const query = cleanSource(sourceQuery);
  return {
    ...initialProfile,
    sourceProgramId: cleanSource(sourceProgramId),
    sourceCaseId: cleanSource(sourceCaseId),
    sourceQuery: query,
    notes: query ? `从搜索关键词「${query}」开始规划` : initialProfile.notes
  };
}

export function PathPlanner(props: PathPlannerProps = {}) {
  const [profile, setProfile] = useState<PlannerProfile>(() => buildInitialProfile(props));
  const [sourceContext, setSourceContext] = useState<PlannerSourceContext | null>(
    props.sourceQuery
      ? {
          type: "query",
          label: props.sourceQuery,
          description: "来自首页或搜索入口的关键词"
        }
      : null
  );
  const [step, setStep] = useState<PlannerStep>(1);
  const [result, setResult] = useState<PlannerRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sourceProgramId = cleanSource(props.sourceProgramId);
    const sourceCaseId = cleanSource(props.sourceCaseId);
    const sourceQuery = cleanSource(props.sourceQuery);
    if (!sourceProgramId && !sourceCaseId && sourceQuery) {
      setSourceContext({
        type: "query",
        label: sourceQuery,
        description: "来自首页或搜索入口的关键词"
      });
      setProfile((current) => ({
        ...current,
        sourceQuery,
        notes: current.notes || `从搜索关键词「${sourceQuery}」开始规划`
      }));
      return;
    }

    let cancelled = false;
    async function loadSourceContext() {
      try {
        if (sourceProgramId) {
          const response = await apiFetch<Program>(`/api/programs/${sourceProgramId}`);
          if (cancelled) {
            return;
          }
          const program = response.data;
          setSourceContext({
            type: "program",
            id: program.id,
            label: program.name,
            description: `${program.type} / ${program.gradeRange} / ${program.subjectArea}`
          });
          setProfile((current) => ({
            ...current,
            sourceProgramId: program.id,
            sourceQuery,
            subjectArea: inferPlannerSubject(program.subjectArea, program.tags),
            format: program.format,
            notes: current.notes || `评估活动「${program.name}」是否适合当前路径`
          }));
          return;
        }

        if (sourceCaseId) {
          const response = await apiFetch<StudentCase>(`/api/cases/${sourceCaseId}`);
          if (cancelled) {
            return;
          }
          const studentCase = response.data;
          setSourceContext({
            type: "case",
            id: studentCase.id,
            label: studentCase.anonymousCode,
            description: `${studentCase.grade} / ${studentCase.intendedMajor} / ${studentCase.resultSummary}`
          });
          setProfile((current) => ({
            ...current,
            sourceCaseId: studentCase.id,
            sourceQuery,
            grade: studentCase.grade,
            subjectArea: inferPlannerSubject(studentCase.intendedMajor, studentCase.tags),
            competitions: summarizeCaseActivity(studentCase, "Competition") || current.competitions,
            summerSchools:
              summarizeCaseActivity(studentCase, "Summer School") || current.summerSchools,
            research: summarizeCaseActivity(studentCase, "Research Program") || current.research,
            intent: "case_reference",
            notes: current.notes || `参考案例「${studentCase.anonymousCode}」生成相似路径`
          }));
        }
      } catch {
        setSourceContext(null);
      }
    }

    void loadSourceContext();
    return () => {
      cancelled = true;
    };
  }, [props.sourceCaseId, props.sourceProgramId, props.sourceQuery]);

  const updateProfile = <K extends keyof PlannerProfile>(key: K, value: PlannerProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const submitProfile = async (nextProfile = profile) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<PlannerRecommendationResponse>(
        "/api/planner/recommendations",
        {
          method: "POST",
          body: JSON.stringify(nextProfile)
        }
      );
      setResult(response.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "路径规划生成失败");
    } finally {
      setLoading(false);
    }
  };

  const applyAdjustment = (label: string) => {
    const nextProfile = { ...profile };
    if (label.includes("线上")) {
      nextProfile.format = "online";
    }
    if (label.includes("预算")) {
      nextProfile.budget = "low";
      nextProfile.intent = "cost_effective";
    }
    if (label.includes("竞赛")) {
      nextProfile.intent = "challenge";
      nextProfile.competitions = nextProfile.competitions || "希望补充竞赛证明";
    }
    if (label.includes("科研")) {
      nextProfile.research = nextProfile.research || "希望补充科研产出";
    }
    if (label.includes("夏校")) {
      nextProfile.summerSchools = nextProfile.summerSchools || "希望补充夏校或课堂探索";
      nextProfile.intent = "balanced";
    }
    if (label.includes("稳妥")) {
      nextProfile.intent = "support";
    }
    setProfile(nextProfile);
    void submitProfile(nextProfile);
  };

  return (
    <div className="grid gap-0 overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:h-[calc(100vh-124px)] lg:grid-cols-[360px_1fr]">
      <aside className="scroll-pane border-b border-border bg-surface p-7 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Planner</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight tracking-normal text-ink">
          智能路径规划
        </h1>
        <p className="mt-3 text-sm font-bold leading-7 text-secondary">
          基于内部活动库和案例库生成推荐活动、相似案例和阶段路径。
        </p>
        {sourceContext ? <SourceContextCard context={sourceContext} /> : null}

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <button
              className={cx(
                "h-2 rounded-full",
                item <= step ? "bg-primary" : "bg-soft"
              )}
              key={item}
              onClick={() => setStep(item as PlannerStep)}
              type="button"
            />
          ))}
        </div>

        <div className="mt-7">
          {step === 1 ? (
            <StepBlock
              description="这一步决定系统从哪些年级、课程体系和申请方向找活动与案例。"
              title="1. 建立学生画像"
            >
              <ChoiceGroup
                label="当前年级"
                onChange={(value) => updateProfile("grade", value as PlannerProfile["grade"])}
                options={gradeOptions}
                value={profile.grade}
              />
              <ChoiceGroup
                label="就读体系"
                onChange={(value) => updateProfile("curriculum", value)}
                options={curriculumOptions}
                value={profile.curriculum}
              />
              <ChoiceGroup
                label="目标地区"
                onChange={(value) => updateProfile("targetRegion", value)}
                options={regionOptions}
                value={profile.targetRegion}
              />
              <ChoiceGroup
                label="目标方向"
                onChange={(value) => updateProfile("subjectArea", value)}
                options={subjectOptions}
                value={profile.subjectArea}
              />
            </StepBlock>
          ) : null}

          {step === 2 ? (
            <StepBlock
              description="这一步用于识别履历缺口，不要求全部填写。"
              title="2. 补充当前背景"
            >
              <TextField
                label="标化 / 校内成绩"
                onChange={(value) => updateProfile("standardizedScore", value)}
                placeholder="例如：A-Level 3A* / AP 5门5分"
                value={profile.standardizedScore ?? ""}
              />
              <TextField
                label="语言成绩"
                onChange={(value) => updateProfile("languageScore", value)}
                placeholder="例如：雅思 7.5 / 托福 105"
                value={profile.languageScore ?? ""}
              />
              <TextField
                label="GPA / 学校成绩"
                onChange={(value) => updateProfile("gpa", value)}
                placeholder="例如：GPA 3.8 / 年级前 10%"
                value={profile.gpa ?? ""}
              />
              <TextField
                label="已有竞赛"
                onChange={(value) => updateProfile("competitions", value)}
                placeholder="例如：AMC10 / USABO / NEC"
                value={profile.competitions ?? ""}
              />
              <TextField
                label="已有夏校"
                onChange={(value) => updateProfile("summerSchools", value)}
                placeholder="例如：YYGS / UCL summer"
                value={profile.summerSchools ?? ""}
              />
              <TextField
                label="已有科研"
                onChange={(value) => updateProfile("research", value)}
                placeholder="例如：线上科研论文 / 校内课题"
                value={profile.research ?? ""}
              />
            </StepBlock>
          ) : null}

          {step === 3 ? (
            <StepBlock
              description="选择路径风格后，系统会重新排序活动和案例。"
              title="3. 选择规划偏好"
            >
              <ChoiceGroup
                label="预算偏好"
                onChange={(value) => updateProfile("budget", value as PlannerProfile["budget"])}
                options={budgetOptions}
                value={profile.budget}
              />
              <ChoiceGroup
                label="活动形式"
                onChange={(value) => updateProfile("format", value as PlannerProfile["format"])}
                options={formatOptions}
                value={profile.format}
              />
              <div>
                <p className="mb-3 text-sm font-black text-ink">路径风格</p>
                <div className="space-y-2">
                  {intentOptions.map((option) => (
                    <button
                      className={cx(
                        "w-full rounded-sm border p-4 text-left transition",
                        profile.intent === option.value
                          ? "border-primary bg-primary text-white shadow-card"
                          : "border-border bg-soft text-secondary hover:border-primary hover:text-primary"
                      )}
                      key={option.value}
                      onClick={() => updateProfile("intent", option.value)}
                      type="button"
                    >
                      <span className="block text-sm font-black">{option.label}</span>
                      <span
                        className={cx(
                          "mt-1 block text-xs font-bold leading-5",
                          profile.intent === option.value ? "text-white/80" : "text-muted"
                        )}
                      >
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <TextField
                label="补充说明"
                onChange={(value) => updateProfile("notes", value)}
                placeholder="例如：不想出国线下参加活动，希望优先线上"
                value={profile.notes ?? ""}
              />
            </StepBlock>
          ) : null}
        </div>

        <div className="mt-7 flex gap-2 border-t border-border pt-5">
          <button
            className="min-h-11 flex-1 rounded-sm border border-border bg-surface px-4 text-sm font-black text-secondary hover:border-primary"
            disabled={step === 1}
            onClick={() => setStep((step - 1) as PlannerStep)}
            type="button"
          >
            上一步
          </button>
          {step < 3 ? (
            <button
              className="min-h-11 flex-1 rounded-sm bg-primary px-4 text-sm font-black text-white"
              onClick={() => setStep((step + 1) as PlannerStep)}
              type="button"
            >
              下一步
            </button>
          ) : (
            <button
              className="min-h-11 flex-1 rounded-sm bg-primary px-4 text-sm font-black text-white disabled:opacity-60"
              disabled={loading}
              onClick={() => submitProfile()}
              type="button"
            >
              {loading ? "生成中..." : "生成路径"}
            </button>
          )}
        </div>
      </aside>

      <section className="scroll-pane bg-soft p-5 lg:h-full lg:overflow-y-auto lg:p-8">
        {error ? (
          <EmptyState description={error} title="路径规划生成失败" />
        ) : result ? (
          <PlannerResult
            onAdjustment={applyAdjustment}
            result={result}
          />
        ) : (
          <Card className="rounded-[30px] p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Explainable Plan
            </p>
            <h2 className="mt-2 text-[34px] font-black leading-tight tracking-normal text-ink">
              生成后会看到活动、案例和阶段路径
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-secondary">
              第一版不会联网搜索，也不会编造官网、时间和费用；所有推荐都来自当前活动库与案例库。
            </p>
            {sourceContext ? (
              <div className="mt-5 max-w-2xl">
                <SourceContextCard context={sourceContext} compact />
              </div>
            ) : null}
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {[
                ["1", "画像摘要", "把年级、体系、目标地区和方向整理成可计算画像。"],
                ["2", "内部检索", "从活动库和案例库找相似项目与路径。"],
                ["3", "解释路径", "输出为什么推荐、何时做、参考哪个案例。"]
              ].map(([stepIndex, title, description]) => (
                <div className="rounded-md border border-border bg-surface p-5" key={title}>
                  <span className="text-3xl font-black text-primary">{stepIndex}</span>
                  <h3 className="mt-3 font-black text-ink">{title}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-secondary">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

function StepBlock({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-black tracking-normal text-ink">{title}</h2>
      <p className="mt-2 text-sm font-bold leading-7 text-secondary">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: T[] | Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-black text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionLabel = typeof option === "string" ? option : option.label;
          const optionValue = typeof option === "string" ? option : option.value;
          const active = value === optionValue;

          return (
            <button
              className={cx(
                "min-h-10 rounded-full border px-4 text-sm font-black",
                active
                  ? "border-primary bg-primary text-white shadow-card"
                  : "border-border bg-soft text-secondary hover:border-primary hover:text-primary"
              )}
              key={optionValue}
              onClick={() => onChange(optionValue)}
              type="button"
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-ink">{label}</span>
      <input
        className="mt-2 min-h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm font-bold text-ink outline-none placeholder:text-muted focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function SourceContextCard({
  context,
  compact = false
}: {
  context: PlannerSourceContext;
  compact?: boolean;
}) {
  const href =
    context.type === "program" && context.id
      ? `/programs/${context.id}`
      : context.type === "case" && context.id
        ? `/cases/${context.id}`
        : null;
  const label = {
    program: "当前活动",
    case: "参考案例",
    query: "搜索关键词"
  }[context.type];
  const content = (
    <div
      className={cx(
        "rounded-md border border-primary/20 bg-primary/5",
        compact ? "p-4" : "mt-5 p-4"
      )}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-ink">{context.label}</p>
      {context.description ? (
        <p className="mt-1 text-xs font-bold leading-5 text-secondary">{context.description}</p>
      ) : null}
    </div>
  );

  return href ? (
    <Link className="block hover:-translate-y-0.5" href={href}>
      {content}
    </Link>
  ) : (
    content
  );
}

function inferPlannerSubject(text: string, tags: string[]) {
  const searchable = [text, ...tags].join(" ").toLowerCase();
  if (/(stem|理科|数学|物理|化学|生物|工程|计算机|数据|research|science)/i.test(searchable)) {
    return "STEM";
  }
  if (/(商科|经济|business|econ|finance|management)/i.test(searchable)) {
    return "商科/经济";
  }
  if (/(人文|社科|history|politic|social|global|writing|law)/i.test(searchable)) {
    return "人文社科";
  }
  if (/(艺术|传媒|design|media|film|music)/i.test(searchable)) {
    return "艺术传媒";
  }
  return "不确定";
}

function summarizeCaseActivity(studentCase: StudentCase, type: string) {
  return studentCase.activityExperience
    .filter((activity) => activity.type === type)
    .slice(0, 3)
    .map((activity) => activity.programName)
    .join(" / ");
}

function PlannerResult({
  result,
  onAdjustment
}: {
  result: PlannerRecommendationResponse;
  onAdjustment: (label: string) => void;
}) {
  const groupedPrograms = groupProgramsByStage(result.programs);

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px] p-7">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Internal Recommendation
            </p>
            <h2 className="mt-2 text-[32px] font-black leading-tight tracking-normal text-ink">
              可解释路径建议
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-secondary">
              {result.profileSummary}
            </p>
          </div>
          <Badge tone="blue">内部活动库 + 案例库</Badge>
        </div>
        {result.sourceContexts.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {result.sourceContexts.map((context) => (
              <SourceContextCard
                compact
                context={context}
                key={`${context.type}-${context.id ?? context.label}`}
              />
            ))}
          </div>
        ) : null}
        <p className="mt-5 rounded-md border border-border bg-soft p-4 text-sm font-bold leading-7 text-secondary">
          {result.explanation}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {result.gaps.map((gap) => (
            <Badge key={gap} tone="amber">{gap}</Badge>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Metric label="推荐活动" value={`${result.programs.length} 个`} />
          <Metric label="相似案例" value={`${result.cases.length} 个`} />
          <Metric label="风险提示" value={`${result.riskWarnings.length} 条`} />
        </div>
        <div className="mt-5 rounded-md border border-warning/25 bg-warning/10 p-4">
          <h3 className="text-sm font-black text-ink">需要注意</h3>
          <ul className="mt-2 space-y-1 text-sm font-bold leading-7 text-secondary">
            {result.riskWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="rounded-[30px] p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black tracking-normal text-ink">推荐活动</h2>
                <p className="mt-2 text-sm font-bold leading-7 text-secondary">
                  按执行阶段分组，先看核心动作，再看补充活动。
                </p>
              </div>
              <Badge tone="blue">按阶段排序</Badge>
            </div>
            <div className="mt-5 space-y-6">
              {groupedPrograms.map(([stage, programs]) => (
                <div key={stage}>
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                    {stage}
                  </h3>
                  <div className="mt-3 space-y-4">
                    {programs.map((item) => (
                      <ProgramRecommendationCard
                        cases={result.cases}
                        item={item}
                        key={item.program.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[30px] p-7">
            <h2 className="text-2xl font-black tracking-normal text-ink">阶段路径</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {result.timeline.map((item) => (
                <div className="rounded-md border border-border bg-soft p-5" key={item.phase}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                    {item.phase}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm font-bold leading-7 text-secondary">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs font-black text-muted">
                    活动 {item.programIds.length} 个 / 案例 {item.caseIds.length} 个
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-[30px] p-6">
            <h2 className="text-xl font-black tracking-normal text-ink">相似案例</h2>
            <div className="mt-5 space-y-3">
              {result.cases.map((item) => (
                <Link
                  className="block rounded-md border border-border bg-soft p-4 hover:border-primary"
                  href={`/cases/${item.studentCase.id}`}
                  key={item.studentCase.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-black text-ink">{item.studentCase.anonymousCode}</span>
                    <span className="text-sm font-black text-primary">{item.score}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6 text-secondary">
                    {item.pathSummary}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs font-bold leading-5 text-secondary">
                    {item.reasons.slice(0, 2).map((reason) => (
                      <li key={reason}>- {reason}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.evidenceTags.slice(0, 3).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="rounded-[30px] p-6">
            <h2 className="text-xl font-black tracking-normal text-ink">继续调整</h2>
            <div className="mt-4 grid gap-2">
              {result.nextAdjustments.map((label) => (
                <button
                  className="min-h-11 rounded-sm border border-border bg-surface px-4 text-left text-sm font-black text-secondary hover:border-primary hover:text-primary"
                  key={label}
                  onClick={() => onAdjustment(label)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-soft p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function groupProgramsByStage(programs: PlannerProgramRecommendation[]) {
  const stageOrder = ["现在 - 3 个月", "尽快补强", "3 - 6 个月", "6 - 12 个月", "暑期窗口", "灵活安排"];
  const stageRank = (stage: string) => {
    const index = stageOrder.indexOf(stage);
    return index === -1 ? stageOrder.length : index;
  };
  const groups = new Map<string, PlannerProgramRecommendation[]>();
  programs.forEach((item) => {
    groups.set(item.stage, [...(groups.get(item.stage) ?? []), item]);
  });
  return Array.from(groups.entries()).sort(
    ([left], [right]) => stageRank(left) - stageRank(right)
  );
}

function priorityBadge(item: PlannerProgramRecommendation) {
  if (item.priority === "core") {
    return { label: "核心动作", tone: "green" as const };
  }
  if (item.priority === "watch") {
    return { label: "观察备选", tone: "amber" as const };
  }
  return { label: "补充选择", tone: "blue" as const };
}

function ProgramRecommendationCard({
  item,
  cases
}: {
  item: PlannerProgramRecommendation;
  cases: PlannerCaseRecommendation[];
}) {
  const priority = priorityBadge(item);
  const relatedCases = item.relatedCaseIds
    .map((caseId) => cases.find((studentCase) => studentCase.studentCase.id === caseId))
    .filter((studentCase): studentCase is PlannerCaseRecommendation => Boolean(studentCase));

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={item.program.type === "Competition" ? "green" : "blue"}>
              {item.program.type}
            </Badge>
            <Badge tone={priority.tone}>{priority.label}</Badge>
            <Badge>{item.score} 分</Badge>
          </div>
          <Link
            className="mt-3 block text-xl font-black leading-tight text-ink hover:text-primary"
            href={`/programs/${item.program.id}`}
          >
            {item.program.name}
          </Link>
          <p className="mt-2 text-sm font-bold leading-7 text-secondary">
            {item.fitSummary}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ReasonBlock title="为什么适合" tone="primary" items={item.reasons} />
        <ReasonBlock title="注意事项" tone="warning" items={item.cautions} />
        <ReasonBlock title="下一步动作" tone="success" items={item.actionItems} />
      </div>

      {relatedCases.length ? (
        <div className="mt-5 rounded-sm border border-border bg-soft p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">参考案例</p>
          <div className="mt-3 space-y-2">
            {relatedCases.map((studentCase) => (
              <Link
                className="block text-sm font-black leading-6 text-ink hover:text-primary"
                href={`/cases/${studentCase.studentCase.id}`}
                key={studentCase.studentCase.id}
              >
                {studentCase.studentCase.anonymousCode}｜{studentCase.studentCase.intendedMajor}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.evidenceTags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </div>
  );
}

function ReasonBlock({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "primary" | "warning" | "success";
}) {
  const titleClass = {
    primary: "text-primary",
    warning: "text-warning",
    success: "text-success"
  }[tone];

  return (
    <div className="rounded-sm border border-border bg-soft p-4">
      <h4 className={cx("text-sm font-black", titleClass)}>{title}</h4>
      <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-secondary">
        {items.slice(0, 3).map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
