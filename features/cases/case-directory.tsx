"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { apiFetch, toQueryString } from "@/lib/api-client";
import type { StudentCase } from "@/lib/types";
import { normalizeText } from "@/lib/utils";

const curriculumOptions = ["IB", "A-Level", "AP", "OSSD"];
const applicationRegionOptions = ["英国", "美国", "香港", "澳大利亚"];
const caseLevelOptions = ["顶尖", "中等", "普通", "失败"];
type QuestionStep = 1 | 2 | 3;

export function CaseDirectory() {
  const [curriculum, setCurriculum] = useState("");
  const [standardizedScore, setStandardizedScore] = useState("");
  const [languageScore, setLanguageScore] = useState("");
  const [competition, setCompetition] = useState("");
  const [summerSchool, setSummerSchool] = useState("");
  const [research, setResearch] = useState("");
  const [applicationRegion, setApplicationRegion] = useState("");
  const [caseLevel, setCaseLevel] = useState("");
  const [draftCurriculum, setDraftCurriculum] = useState("");
  const [draftStandardizedScore, setDraftStandardizedScore] = useState("");
  const [draftLanguageScore, setDraftLanguageScore] = useState("");
  const [draftCompetition, setDraftCompetition] = useState("");
  const [draftSummerSchool, setDraftSummerSchool] = useState("");
  const [draftResearch, setDraftResearch] = useState("");
  const [draftApplicationRegion, setDraftApplicationRegion] = useState("");
  const [draftCaseLevel, setDraftCaseLevel] = useState("");
  const [questionStep, setQuestionStep] = useState<QuestionStep>(1);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [caseData, setCaseData] = useState<StudentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<StudentCase[]>(
      `/api/cases${toQueryString({
        curriculum,
        standardizedScore,
        languageScore,
        competition,
        summerSchool,
        research,
        applicationRegion,
        resultTier: caseLevel,
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
  }, [
    applicationRegion,
    caseLevel,
    competition,
    curriculum,
    languageScore,
    research,
    standardizedScore,
    summerSchool
  ]);

  const openQuestionnaire = () => {
    setDraftCurriculum(curriculum);
    setDraftStandardizedScore(standardizedScore);
    setDraftLanguageScore(languageScore);
    setDraftCompetition(competition);
    setDraftSummerSchool(summerSchool);
    setDraftResearch(research);
    setDraftApplicationRegion(applicationRegion);
    setDraftCaseLevel(caseLevel);
    setQuestionStep(1);
    setQuestionnaireOpen(true);
  };

  const resetFilters = () => {
    setCurriculum("");
    setStandardizedScore("");
    setLanguageScore("");
    setCompetition("");
    setSummerSchool("");
    setResearch("");
    setApplicationRegion("");
    setCaseLevel("");
    setDraftCurriculum("");
    setDraftStandardizedScore("");
    setDraftLanguageScore("");
    setDraftCompetition("");
    setDraftSummerSchool("");
    setDraftResearch("");
    setDraftApplicationRegion("");
    setDraftCaseLevel("");
    setQuestionStep(1);
  };

  const applyQuestionnaire = () => {
    setCurriculum(draftCurriculum);
    setStandardizedScore(draftStandardizedScore.trim());
    setLanguageScore(draftLanguageScore.trim());
    setCompetition(draftCompetition.trim());
    setSummerSchool(draftSummerSchool.trim());
    setResearch(draftResearch.trim());
    setApplicationRegion(draftApplicationRegion);
    setCaseLevel(draftCaseLevel);
    setQuestionnaireOpen(false);
  };

  const cases = useMemo(
    () =>
      caseData.filter((studentCase) => {
        const searchableProfile = buildCaseSearchText(studentCase);

        if (curriculum && !normalizeText(searchableProfile).includes(normalizeText(curriculum))) {
          return false;
        }

        if (
          standardizedScore &&
          !normalizeText(searchableProfile).includes(normalizeText(standardizedScore))
        ) {
          return false;
        }

        if (languageScore && !normalizeText(searchableProfile).includes(normalizeText(languageScore))) {
          return false;
        }

        if (competition && !matchesActivityText(studentCase, "Competition", competition)) {
          return false;
        }

        if (summerSchool && !matchesActivityText(studentCase, "Summer School", summerSchool)) {
          return false;
        }

        if (research && !matchesActivityText(studentCase, "Research Program", research)) {
          return false;
        }

        if (applicationRegion && !matchesRegion(studentCase, applicationRegion)) {
          return false;
        }

        if (caseLevel && studentCase.resultTier !== caseLevel) {
          return false;
        }
        return true;
      }),
    [
      applicationRegion,
      caseData,
      caseLevel,
      competition,
      curriculum,
      languageScore,
      research,
      standardizedScore,
      summerSchool
    ]
  );

  return (
    <div className="grid gap-0 overflow-hidden rounded-[34px] border border-border bg-surface shadow-panel lg:h-[calc(100vh-124px)] lg:grid-cols-[300px_1fr]">
      <aside className="scroll-pane border-b border-border bg-surface p-7 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <h2 className="text-base font-black tracking-normal text-ink">案例筛选</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-secondary">
          通过三个问题快速筛出更接近自己背景的案例。
        </p>
        <button
          className="mt-6 min-h-11 w-full rounded-sm bg-primary px-4 text-sm font-black text-white shadow-card"
          onClick={openQuestionnaire}
          type="button"
        >
          填写筛选问题
        </button>
        <div className="mt-6 space-y-3">
          <FilterSummary label="就读体系" value={curriculum || "未选择"} />
          <FilterSummary label="标化成绩" value={standardizedScore || "未填写"} />
          <FilterSummary label="语言成绩" value={languageScore || "未填写"} />
          <FilterSummary label="竞赛 / 夏校 / 科研" value={formatExperienceSummary(competition, summerSchool, research)} />
          <FilterSummary label="申请地区" value={applicationRegion || "未选择"} />
          <FilterSummary label="案例等级" value={caseLevel || "未选择"} />
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
              案例库
            </h2>
            <p className="mt-2 text-sm font-bold leading-7 text-secondary">
              不是只看成功故事，而是比较不同背景、路径和结果。
            </p>
          </div>
          <button
            className="min-h-12 rounded-sm border border-border bg-surface px-5 text-sm font-black text-primary shadow-card hover:border-primary"
            onClick={openQuestionnaire}
            type="button"
          >
            按问题筛选案例
          </button>
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
            description="当前筛选条件没有结果，可以调整就读体系、标化成绩或案例等级。"
            title="暂无案例结果"
          />
        )}
      </section>
      {questionnaireOpen ? (
        <CaseQuestionnaireModal
          caseLevel={draftCaseLevel}
          competition={draftCompetition}
          curriculum={draftCurriculum}
          languageScore={draftLanguageScore}
          onApply={applyQuestionnaire}
          onCaseLevelChange={setDraftCaseLevel}
          onClose={() => setQuestionnaireOpen(false)}
          onCompetitionChange={setDraftCompetition}
          onCurriculumChange={setDraftCurriculum}
          onLanguageScoreChange={setDraftLanguageScore}
          onRegionChange={setDraftApplicationRegion}
          onResearchChange={setDraftResearch}
          onScoreChange={setDraftStandardizedScore}
          onReset={() => {
            setDraftCurriculum("");
            setDraftStandardizedScore("");
            setDraftLanguageScore("");
            setDraftCompetition("");
            setDraftSummerSchool("");
            setDraftResearch("");
            setDraftApplicationRegion("");
            setDraftCaseLevel("");
            setQuestionStep(1);
          }}
          onStepChange={setQuestionStep}
          region={draftApplicationRegion}
          research={draftResearch}
          step={questionStep}
          standardizedScore={draftStandardizedScore}
          summerSchool={draftSummerSchool}
          onSummerSchoolChange={setDraftSummerSchool}
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

function CaseQuestionnaireModal({
  step,
  curriculum,
  standardizedScore,
  languageScore,
  competition,
  summerSchool,
  research,
  region,
  caseLevel,
  onStepChange,
  onCurriculumChange,
  onScoreChange,
  onLanguageScoreChange,
  onCompetitionChange,
  onSummerSchoolChange,
  onResearchChange,
  onRegionChange,
  onCaseLevelChange,
  onReset,
  onApply,
  onClose
}: {
  step: QuestionStep;
  curriculum: string;
  standardizedScore: string;
  languageScore: string;
  competition: string;
  summerSchool: string;
  research: string;
  region: string;
  caseLevel: string;
  onStepChange: (value: QuestionStep) => void;
  onCurriculumChange: (value: string) => void;
  onScoreChange: (value: string) => void;
  onLanguageScoreChange: (value: string) => void;
  onCompetitionChange: (value: string) => void;
  onSummerSchoolChange: (value: string) => void;
  onResearchChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onCaseLevelChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const canGoNext = step === 1 ? Boolean(curriculum) : true;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <div className="max-h-[calc(100vh-32px)] w-full max-w-[680px] overflow-auto rounded-[28px] border border-border bg-surface p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              Step {step} / 3
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-ink">案例筛选问题</h2>
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
            <QuestionBlock label="请选择你所就读的体系">
            <div className="grid gap-2 sm:grid-cols-4">
              {curriculumOptions.map((option) => (
                <ChoiceButton
                  active={curriculum === option}
                  key={option}
                  onClick={() => {
                    onCurriculumChange(option);
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
            <QuestionBlock label="请输入你的背景信息">
              <div className="grid gap-3 sm:grid-cols-2">
                <QuestionInput
                  label="标化成绩"
                  onChange={onScoreChange}
                  placeholder="例如：IB 42、4A*、SAT 1550"
                  value={standardizedScore}
                />
                <QuestionInput
                  label="语言成绩（雅思、托福）"
                  onChange={onLanguageScoreChange}
                  placeholder="例如：雅思 7.5、托福 105"
                  value={languageScore}
                />
                <QuestionInput
                  label="竞赛"
                  onChange={onCompetitionChange}
                  placeholder="例如：NEC、BBO、AMC"
                  value={competition}
                />
                <QuestionInput
                  label="夏校"
                  onChange={onSummerSchoolChange}
                  placeholder="例如：YYGS、NYU 夏校"
                  value={summerSchool}
                />
                <QuestionInput
                  label="科研"
                  onChange={onResearchChange}
                  placeholder="例如：Pioneer、EE、校内科研"
                  value={research}
                />
              </div>
              <div className="mt-5">
                <h4 className="text-sm font-black tracking-normal text-ink">
                  申请地区
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {applicationRegionOptions.map((option) => (
                    <ChoiceButton
                      active={region === option}
                      key={option}
                      onClick={() => onRegionChange(option)}
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            </QuestionBlock>
          ) : null}

          {step === 3 ? (
            <QuestionBlock label="请选择你想要查看的案例等级">
            <div className="grid gap-2 sm:grid-cols-4">
              {caseLevelOptions.map((option) => (
                <ChoiceButton
                  active={caseLevel === option}
                  key={option}
                  onClick={() => onCaseLevelChange(option)}
                >
                  {option}
                </ChoiceButton>
              ))}
            </div>
            </QuestionBlock>
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
            onClick={step === 1 ? onClose : () => onStepChange((step - 1) as QuestionStep)}
            type="button"
          >
            {step === 1 ? "取消" : "上一步"}
          </button>
          {step < 3 ? (
            <button
              className="rounded-sm bg-primary px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canGoNext}
              onClick={() => onStepChange((step + 1) as QuestionStep)}
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

function QuestionBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-black tracking-normal text-ink">{label}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function QuestionInput({
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
      <span className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-sm border border-border bg-soft px-4 text-sm font-bold text-ink outline-none placeholder:text-muted focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function ChoiceButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-11 rounded-sm border px-4 text-sm font-black transition ${
        active
          ? "border-primary bg-primary text-white shadow-card"
          : "border-border bg-soft text-secondary hover:border-primary hover:text-primary"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function buildCaseSearchText(studentCase: StudentCase) {
  return [
    studentCase.anonymousCode,
    studentCase.gpaRange,
    studentCase.academicSummary,
    studentCase.intendedMajor,
    studentCase.resultSummary,
    studentCase.personalSummary,
    studentCase.consultantReview,
    ...studentCase.tags,
    ...studentCase.activityExperience.flatMap((activity) => [
      activity.programName,
      activity.description ?? ""
    ])
  ].join(" ");
}

function matchesActivityText(studentCase: StudentCase, type: string, value: string) {
  const normalizedValue = normalizeText(value);
  return studentCase.activityExperience.some((activity) => {
    if (activity.type !== type) {
      return false;
    }
    return normalizeText([activity.programName, activity.description].join(" ")).includes(
      normalizedValue
    );
  });
}

function matchesRegion(studentCase: StudentCase, value: string) {
  const aliases: Record<string, string[]> = {
    英国: ["英国", "UK", "United Kingdom"],
    美国: ["美国", "US", "USA", "United States"],
    香港: ["香港", "中国香港", "Hong Kong"],
    澳大利亚: ["澳大利亚", "澳洲", "Australia"]
  };
  const searchable = normalizeText(buildCaseSearchText(studentCase));
  return (aliases[value] ?? [value]).some((alias) => searchable.includes(normalizeText(alias)));
}

function formatExperienceSummary(competition: string, summerSchool: string, research: string) {
  const values = [
    competition ? `竞赛：${competition}` : "",
    summerSchool ? `夏校：${summerSchool}` : "",
    research ? `科研：${research}` : ""
  ].filter(Boolean);

  return values.length ? values.join(" / ") : "未填写";
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
