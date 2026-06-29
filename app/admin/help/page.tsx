import { Badge, Card, PageHeading, TextLink } from "@/components/ui";

const workflowSteps = [
  {
    title: "1. 准备数据",
    description: "活动资料优先整理为 DOCX；案例资料当前建议在案例管理中手动录入。"
  },
  {
    title: "2. 文档录入",
    description: "进入文档录入页，选择活动文档并上传。系统会解析为结构化预览项。"
  },
  {
    title: "3. 预览修正",
    description: "逐条检查名称、主办方、时间、费用、地点、官网、亮点和材料。"
  },
  {
    title: "4. 发布与维护",
    description: "通过质量检查后发布到活动库；后续可在活动管理中编辑、归档或批量维护。"
  },
  {
    title: "5. 建立关联",
    description: "在关联管理中把活动和匿名案例连接起来，前台详情页会展示相关路径。"
  },
  {
    title: "6. 前台检索",
    description: "确认活动库、案例库、详情页能按发布状态和标签正确展示。"
  }
];

const pageGuides = [
  {
    title: "文档录入",
    badge: "Import",
    items: [
      "一期支持 DOCX 活动文档解析，PDF / XLSX / CSV 会返回不支持类型。",
      "上传时需要选择文档类型。活动文档会解析为活动预览项；案例文档解析仍待模板确认。",
      "预览项可以逐条编辑、跳过发布、合并到同名活动，也可以批量发布。",
      "存在质量检查错误时不能发布；提醒项允许发布，但建议先补齐关键信息。"
    ]
  },
  {
    title: "活动管理",
    badge: "Programs",
    items: [
      "用于维护活动名称、主办方、类型、官网、时间、年级、学科、地点、形式、费用和简介。",
      "新增活动、编辑活动通过弹窗完成；页面主体只保留活动列表和批量操作。",
      "删除操作会归档活动，不做物理删除，避免误删运营数据。",
      "只有 published 状态的活动会进入前台活动库展示。"
    ]
  },
  {
    title: "案例管理",
    badge: "Cases",
    items: [
      "用于维护匿名学生案例，不录入真实姓名、电话、邮箱和精确学校等敏感信息。",
      "案例必须包含匿名编号、年级、学校类型、GPA 区间、活动经历、申请方向和结果摘要。",
      "新增案例、编辑案例通过弹窗完成；支持批量归档。",
      "只有 published 状态的案例会进入前台案例库展示。"
    ]
  },
  {
    title: "关联管理",
    badge: "Relations",
    items: [
      "用于维护活动和案例之间的显式关系，不做智能匹配和匹配分数。",
      "可选择参与活动、相似学科、相似路径、人工关联等关系类型。",
      "一条活动可以关联多个案例；一条案例也可以关联多个活动。",
      "关联数据会影响活动详情页的相关案例和案例详情页的关联活动。"
    ]
  },
  {
    title: "标签管理",
    badge: "Tags",
    items: [
      "用于维护筛选和归一化字典，包括活动类型、学科、年级、申请方向、地点和形式。",
      "只有启用状态的标签会用于前台筛选项生成。",
      "停用标签不会删除历史数据，但会从可选筛选项中移除。",
      "建议定期合并含义重复的标签，例如 STEM、数学、理科 - 数学。"
    ]
  }
];

const qualityRules = [
  ["活动名称", "必须填写。缺失时无法发布。"],
  ["活动类型", "应统一使用 Competition、Summer School、Research Program 或 Other。"],
  ["官网", "建议填写可访问 URL；格式异常会触发质量提醒。"],
  ["简介", "建议至少能说明活动目标、内容和适合学生。"],
  ["时间与费用", "可以先写待补充，但发布前建议补齐，减少前台信息空洞。"],
  ["重复项", "同名或高度相似活动应优先合并，不建议重复发布。"]
];

const faqItems = [
  {
    question: "为什么上传后没有发布到前台？",
    answer: "上传只会生成预览项。需要在文档录入页确认质量检查通过后，手动发布到活动库。"
  },
  {
    question: "为什么前台活动库看不到某条数据？",
    answer: "请检查该活动是否为 published 状态；draft、archived 等状态不会在公共接口中展示。"
  },
  {
    question: "案例文档为什么不能自动解析？",
    answer: "当前只实现了活动 DOCX 解析。案例字段模板还未最终确定，所以案例建议先在案例管理中手动录入。"
  },
  {
    question: "标签修改后为什么筛选项没变化？",
    answer: "只有 enabled 标签会驱动前台筛选项。修改后可刷新活动库或案例库页面确认。"
  },
  {
    question: "为什么管理员登录后仍提示 403？",
    answer: "请确认服务器环境的 SESSION_COOKIE_SECURE 设置和访问协议一致。HTTP 测试环境应设为 false。"
  }
];

export default function AdminHelpPage() {
  return (
    <div>
      <PageHeading
        description="面向运营管理员的系统使用说明，覆盖数据录入、维护、发布和前台展示链路。"
        eyebrow="Admin"
        title="使用说明"
      />

      <div className="grid gap-5">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-normal text-ink">推荐工作流</h2>
              <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-secondary">
                数据管理的核心目标是把活动资料和匿名案例整理成可检索、可维护、可关联的结构化数据。
              </p>
            </div>
            <Badge tone="blue">MVP 当前流程</Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workflowSteps.map((step) => (
              <div className="rounded-sm border border-border bg-soft p-4" key={step.title}>
                <h3 className="text-base font-black tracking-normal text-ink">{step.title}</h3>
                <p className="mt-2 text-sm font-bold leading-7 text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            {pageGuides.map((guide) => (
              <Card key={guide.title}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black tracking-normal text-ink">{guide.title}</h2>
                  <Badge>{guide.badge}</Badge>
                </div>
                <ul className="mt-4 space-y-3 text-sm font-bold leading-7 text-secondary">
                  {guide.items.map((item) => (
                    <li className="rounded-sm border border-border bg-soft px-4 py-3" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-0 xl:h-max">
            <Card>
              <h2 className="text-xl font-black tracking-normal text-ink">快捷入口</h2>
              <div className="mt-4 space-y-3 text-sm font-bold">
                <div>
                  <TextLink href="/admin/import">文档录入</TextLink>
                </div>
                <div>
                  <TextLink href="/admin/programs">活动管理</TextLink>
                </div>
                <div>
                  <TextLink href="/admin/cases">案例管理</TextLink>
                </div>
                <div>
                  <TextLink href="/admin/relations">关联管理</TextLink>
                </div>
                <div>
                  <TextLink href="/admin/tags">标签管理</TextLink>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black tracking-normal text-ink">状态口径</h2>
              <dl className="mt-4 space-y-3">
                <AdminHelpStat label="draft" value="草稿，仅后台维护" />
                <AdminHelpStat label="published" value="已发布，前台可见" />
                <AdminHelpStat label="archived" value="已归档，前台隐藏" />
                <AdminHelpStat label="merged" value="导入项已合并，不再单独发布" />
              </dl>
            </Card>
          </aside>
        </div>

        <Card>
          <h2 className="text-2xl font-black tracking-normal text-ink">发布前质量检查</h2>
          <div className="mt-5 overflow-hidden rounded-sm border border-border">
            <table className="w-full min-w-[720px] border-collapse bg-surface text-left text-sm">
              <thead className="bg-soft text-xs font-black uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="border-b border-border px-4 py-3">字段</th>
                  <th className="border-b border-border px-4 py-3">检查说明</th>
                </tr>
              </thead>
              <tbody>
                {qualityRules.map(([field, rule]) => (
                  <tr className="border-b border-border last:border-b-0" key={field}>
                    <td className="px-4 py-4 font-black text-ink">{field}</td>
                    <td className="px-4 py-4 font-bold leading-7 text-secondary">{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black tracking-normal text-ink">常见问题</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {faqItems.map((item) => (
              <div className="rounded-sm border border-border bg-soft p-4" key={item.question}>
                <h3 className="font-black tracking-normal text-ink">{item.question}</h3>
                <p className="mt-2 text-sm font-bold leading-7 text-secondary">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminHelpStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm font-black text-ink">{label}</dt>
      <dd className="text-right text-sm font-bold text-secondary">{value}</dd>
    </div>
  );
}
