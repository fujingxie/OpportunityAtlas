# 活动方案案例库 UI 设计文档（Agent 开发版）

> 文档版本：v1.0  
> 适用对象：前端 Agent / 全栈 Agent / 产品开发 Agent  
> 关联设计稿：`activity_case_hifi_design.html`  
> 关联预览图：`活动方案管理与智能匹配界面.png`  
> 产品代号：ActivityAtlas / 活动方案案例库

---

## 1. 产品目标

本系统用于管理「活动方案资料」与「学生案例路径」，并通过 AI 智能匹配帮助顾问、学生或家长从活动库、案例库中找到更适合某个学生背景的活动组合与参考案例。

核心目标：

1. 建立可筛选、可搜索、可维护的活动方案库。
2. 建立真实、多分段的学生案例库，不只展示成功案例。
3. 支持「活动 → 相关案例」与「案例 → 参与活动」的双向路径。
4. 增加智能匹配页面：根据学生背景、兴趣、成绩、预算、申请方向、上传材料，推荐活动与案例。
5. 增加数据管理后台：以「文档录入」为主要数据入口，支持 AI 解析、结构化预览、人工校对、审核发布、标签与匹配规则管理。

---

## 2. 用户角色

| 角色 | 使用目的 | 主要页面 |
|---|---|---|
| 学生 / 家长 | 浏览活动、查看案例、进行智能匹配 | 首页、活动库、案例库、智能匹配 |
| 升学顾问 | 为学生筛选活动、对比相似案例、制定活动路径 | 智能匹配、活动详情、案例详情 |
| 内容运营 | 录入活动资料、维护案例资料、审核发布内容 | 数据管理后台 |
| 管理员 | 配置标签体系、匹配规则、数据质量标准 | 数据管理后台 / 标签规则 |

---

## 3. 信息架构

```txt
ActivityAtlas 活动方案案例库
├── 首页
│   ├── AI 智能匹配入口
│   ├── 搜索框
│   ├── 浏览活动入口
│   ├── 浏览案例入口
│   └── 推荐活动与匹配案例
├── 活动库
│   ├── 活动列表页
│   └── 活动详情页
├── 案例库
│   ├── 案例列表页
│   └── 案例详情页
├── 智能匹配
│   ├── 学生背景表单
│   ├── 材料上传
│   ├── 活动 + 案例混合推荐流
│   ├── 匹配分析
│   └── 相似学生案例
└── 数据管理
    ├── 文档录入
    ├── 活动管理
    ├── 案例管理
    ├── 审核发布
    └── 标签规则 / 匹配规则
```

---

## 4. 全局导航

### 4.1 顶部导航

面向前台用户与顾问，所有公开/半公开页面使用顶部导航。

导航项：

```txt
首页 / 活动库 / 案例库 / 智能匹配 / 数据管理
```

状态要求：

- 当前页面导航项使用蓝色高亮，并显示底部短下划线。
- 右侧显示通知图标、消息入口、用户头像或 Admin 下拉。
- 数据管理入口可根据权限显示；非管理员角色可隐藏。

### 4.2 后台侧边栏

数据管理页面使用后台式左侧深色侧边栏。

侧边栏结构：

```txt
Admin
├── 概览
├── 活动库
├── 案例库
├── 智能匹配
├── 数据管理
│   ├── 文档录入
│   ├── 活动管理
│   ├── 案例管理
│   ├── 审核发布
│   └── 标签规则
└── 系统设置
```

交互：

- 当前二级菜单使用亮蓝色背景。
- 侧边栏宽度建议：240px。
- 后台内容区左边距应避开侧边栏。

---

## 5. 视觉规范

### 5.1 设计风格

关键词：

- 教育 SaaS
- 清爽可信
- AI 智能感
- 数据管理后台
- 蓝白主色
- 圆角卡片
- 轻阴影

整体风格应接近当前 HTML 高保真设计稿：浅灰蓝背景、大量白色卡片、蓝色渐变按钮、柔和阴影、细分割线。

### 5.2 色彩 Token

建议使用 CSS 变量统一管理。

```css
:root {
  --color-bg-page: #eef4ff;
  --color-bg-surface: #ffffff;
  --color-bg-soft: #f7faff;
  --color-bg-admin-sidebar: #06142f;

  --color-primary: #2563eb;
  --color-primary-2: #06b6d4;
  --color-primary-soft: #eaf2ff;
  --color-primary-gradient: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);

  --color-text-main: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-border: #e2e8f0;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
}
```

### 5.3 字体

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
```

字号建议：

| 用途 | 字号 | 字重 |
|---|---:|---:|
| Hero 标题 | 40-48px | 700/800 |
| 页面标题 | 28-32px | 700 |
| 卡片标题 | 16-18px | 600/700 |
| 正文 | 14px | 400/500 |
| 辅助说明 | 12-13px | 400 |
| 表格文字 | 13-14px | 400/500 |

### 5.4 圆角与阴影

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;

--shadow-card: 0 16px 40px rgba(15, 23, 42, 0.08);
--shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.06);
```

使用规则：

- 页面大容器：24px 圆角。
- 卡片：16-18px 圆角。
- 按钮：10-12px 圆角。
- 输入框：10-12px 圆角。

### 5.5 间距

建议使用 4px 基准栅格。

| Token | 值 |
|---|---:|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

---

## 6. 通用组件规范

### 6.1 Button

类型：

1. Primary：蓝色渐变，主操作按钮。
2. Secondary：白底蓝字，蓝色边框。
3. Ghost：透明背景，悬浮时浅蓝底。
4. Danger：红色，用于删除或标记问题。

按钮尺寸：

```txt
Large: height 48px, padding 0 24px
Medium: height 40px, padding 0 18px
Small: height 32px, padding 0 12px
```

状态：

- default
- hover
- active
- disabled
- loading

### 6.2 Card

基础卡片结构：

```txt
Card
├── Header：标题 / 操作区
├── Body：内容
└── Footer：可选操作按钮
```

CSS 建议：

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}
```

### 6.3 Tag / Badge

用途：活动类型、学科、状态、匹配标签、审核状态。

类型示例：

| 类型 | 文案 | 颜色 |
|---|---|---|
| Research | Research | 蓝色 |
| Summer | Summer | 橙色 |
| Competition | Competition | 绿色 |
| 已发布 | 已发布 | 绿色 |
| 草稿 | 草稿 | 灰色 |
| 待审核 | 待审核 | 橙色 |
| 高匹配 | 高匹配 | 蓝色 |

### 6.4 MatchScore 匹配分数组件

用于首页推荐、智能匹配结果、相似案例推荐。

展示格式：

```txt
96
匹配度
```

规则：

| 分数 | UI 表现 |
|---:|---|
| 90-100 | 蓝色，高匹配 |
| 75-89 | 青色，中高匹配 |
| 60-74 | 橙色，可考虑 |
| <60 | 灰色或不推荐展示 |

### 6.5 UploadZone 上传组件

文档录入和智能匹配材料上传都使用该组件。

默认文案：

```txt
拖拽文件到此处，或点击上传
支持 PDF / Word / Excel（最多 50MB）
```

状态：

- default：虚线边框 + 云上传图标。
- dragging：边框变蓝，背景浅蓝。
- uploading：显示进度条。
- success：显示绿色状态。
- error：显示红色错误信息。

---

## 7. 页面设计规范

## 7.1 首页

### 页面目标

让用户快速理解产品价值，并从首页进入智能匹配、活动库或案例库。

### 页面布局

```txt
首页
├── 顶部导航
├── Hero 区
│   ├── 标题：把活动方案与学生路径智能匹配起来
│   ├── 描述文案
│   ├── 大型意图输入框
│   └── CTA：开始智能匹配
├── 入口卡片
│   ├── 浏览活动
│   ├── 浏览案例
│   └── 智能匹配
├── 右侧推荐卡片
│   └── 推荐活动与匹配案例
└── AI 智能匹配流程
    ├── 输入背景
    ├── 智能分析
    ├── 推荐活动
    └── 关联案例
```

### 关键交互

1. 用户在 Hero 输入框输入学生背景或目标。
2. 点击「开始智能匹配」。
3. 跳转到 `/match`，并把输入内容作为 query 或初始表单值带入。

### 推荐活动卡片字段

```ts
type HomeRecommendation = {
  id: string;
  type: 'program' | 'case';
  tag: 'Research' | 'Summer' | 'Competition' | 'Case';
  title: string;
  subtitle: string;
  matchScore: number;
};
```

---

## 7.2 活动库列表页

### 页面目标

用户通过分类、学科、年级、关键词等条件筛选活动。

### 页面布局

```txt
活动库
├── 顶部导航
├── 左侧筛选栏
│   ├── 活动类型：竞赛 / 夏校 / 科研
│   ├── 学科方向：理科 / 商科 / 人文 / 艺术 / 综合
│   ├── 年级：G9 / G10 / G11 / G12
│   ├── 地点 / 国家
│   ├── 形式：线上 / 线下 / 混合
│   └── 费用区间
├── 主内容区
│   ├── 搜索框
│   ├── 排序：推荐 / 最新 / 截止时间 / 匹配度
│   └── 活动列表卡片
└── 右侧推荐
    └── 相关案例 / 热门活动
```

### 活动卡片字段

```ts
type ProgramCard = {
  id: string;
  name: string;
  organization: string;
  type: 'Competition' | 'Summer School' | 'Research Program' | 'Other';
  subjectTags: string[];
  gradeRange: string;
  location: string;
  format: 'online' | 'offline' | 'hybrid';
  applicationDeadline?: string;
  costText?: string;
  highlights: string[];
  matchScore?: number;
  relatedCaseCount: number;
};
```

### 交互规则

- 点击卡片主区域：进入活动详情页 `/programs/:id`。
- 点击「查看案例」：进入活动详情页并定位到相关案例区域。
- 多个筛选条件为 AND 关系。
- 标签筛选可以多选。

---

## 7.3 活动详情页

### 页面目标

展示活动完整信息，并推荐相关案例，帮助用户做决策。

### 页面布局

```txt
活动详情页
├── 顶部导航
├── 活动头图 / 深色 Hero 卡片
│   ├── 活动名称
│   ├── 类型 Tag
│   ├── 主办方
│   ├── 官网链接
│   └── 收藏 / 加入对比
├── 基础信息卡片区
│   ├── 时间信息
│   ├── 学生条件
│   ├── 地理与形式
│   └── 成本信息
├── 内容与亮点
│   ├── 活动简介
│   ├── 核心课程 / 主题
│   └── 特色亮点
├── 申请与报名信息
└── 右侧栏
    ├── 匹配度分析
    ├── 相关案例推荐
    └── 相似活动
```

### 相关案例推荐规则

相关案例优先级：

1. 参与过该活动的案例。
2. 申请方向与活动学科相同的案例。
3. 年级、成绩段、预算相近的案例。
4. 匹配规则得分较高的案例。

---

## 7.4 案例库列表页

### 页面目标

用户通过成绩段、专业方向、活动类型筛选相似学生案例。

### 页面布局

```txt
案例库
├── 顶部导航
├── 左侧筛选栏
│   ├── 成绩区间
│   ├── 年级
│   ├── 学校类型：国际 / 公立 / 其他
│   ├── 专业方向
│   ├── 活动类型
│   └── 录取结果层级
└── 案例列表
    ├── 案例卡片
    ├── 匿名背景摘要
    ├── 活动路径摘要
    └── 查看详情按钮
```

### 案例卡片字段

```ts
type CaseCard = {
  id: string;
  anonymousCode: string;
  grade: 'G9' | 'G10' | 'G11' | 'G12';
  schoolType: 'international' | 'public' | 'other';
  gpaRange: string;
  intendedMajor: string;
  activityTypes: string[];
  resultSummary: string;
  isSuccessOnly: false;
  relatedProgramCount: number;
};
```

### 产品原则

案例库不能只展示「成功案例」。列表中应包含：

- 顶尖背景案例。
- 中等背景案例。
- 普通背景案例。
- 结果一般或路径有问题的案例。

UI 上可用「背景层级」「结果类型」「路径启发」表达，而不是只用成功/失败二分。

---

## 7.5 案例详情页

### 页面目标

展示某个匿名学生的背景、活动路径、申请结果和可借鉴经验。

### 页面布局

```txt
案例详情页
├── 顶部导航
├── 左侧案例摘要卡
│   ├── 匿名编号
│   ├── 年级
│   ├── 学校类型
│   ├── 成绩段
│   ├── 申请方向
│   └── 结果摘要
├── 中间主内容
│   ├── 活动路径时间线
│   ├── 每个阶段参与的活动
│   ├── 路径逻辑说明
│   └── 个人总结 / 顾问复盘
└── 右侧栏
    ├── 相关活动
    ├── 相似案例
    └── 可复制策略
```

### 活动路径时间线示例

```txt
G10 春：数学建模竞赛
G10 夏：线上科研项目
G11 秋：AI 方向竞赛
G11 夏：大学夏校 / 实验室项目
G12：申请结果
```

---

## 7.6 智能匹配页

### 页面目标

根据学生背景与目标，输出活动与案例的混合推荐，显示匹配分数、匹配理由、推荐路径与相似案例。

这是本系统的核心增量页面。

### 页面布局

```txt
智能匹配页
├── 顶部导航
├── 左侧：学生背景与偏好表单
│   ├── 年级
│   ├── 学科兴趣
│   ├── GPA / 成绩段
│   ├── 预算
│   ├── 国家 / 地区偏好
│   ├── 活动类型偏好
│   ├── 申请方向
│   └── 上传成绩单 / 简历 / 活动文档
├── 中间：推荐活动与案例混合流
│   ├── 推荐结果卡片
│   ├── 匹配分数
│   ├── 匹配理由
│   ├── 查看活动
│   └── 查看案例
└── 右侧：匹配分析
    ├── 综合匹配度
    ├── 能力 / 偏好雷达图
    ├── 最强标签
    ├── 推荐路径
    └── 相似学生案例
```

### 学生背景表单字段

```ts
type StudentMatchProfile = {
  grade?: 'G9' | 'G10' | 'G11' | 'G12';
  interests: string[];
  gpaRange?: string;
  budgetRange?: string;
  preferredCountries: string[];
  preferredFormats: Array<'online' | 'offline' | 'hybrid'>;
  preferredProgramTypes: Array<'Research' | 'Summer' | 'Competition' | 'Other'>;
  intendedMajors: string[];
  documents: UploadedDocument[];
  rawIntentText?: string;
};
```

### 推荐结果数据结构

```ts
type MatchResult = {
  id: string;
  targetType: 'program' | 'case';
  targetId: string;
  title: string;
  subtitle: string;
  tags: string[];
  score: number;
  reasons: string[];
  riskNotes?: string[];
  actions: Array<'viewProgram' | 'viewCase' | 'compare' | 'save'>;
};
```

### 推荐结果卡片内容

每张卡片必须包含：

1. 类型标签：Research / Summer / Competition / Case。
2. 标题。
3. 基础信息：主办方、周期、形式、地点等。
4. 匹配分数。
5. 匹配理由，必须是用户能理解的自然语言。
6. CTA：查看活动 / 查看案例。

示例：

```txt
RSI 科学研究暑期项目
MIT RSI | 6 周 | 线下 | 美国
匹配度：96
匹配理由：与你的 AI + STEM + G11 背景高度匹配，能补足科研经历。
[查看活动] [查看案例（32）]
```

### 匹配分析面板

字段：

```ts
type MatchAnalysis = {
  overallScore: number;
  radar: {
    academicFit: number;
    subjectFit: number;
    activityFit: number;
    timeFit: number;
    budgetFit: number;
  };
  strongestTags: string[];
  recommendedPath: string[];
  similarCases: CaseCard[];
};
```

### 状态设计

| 状态 | UI |
|---|---|
| 初始状态 | 显示表单 + 空推荐区提示「填写背景后开始匹配」 |
| 分析中 | 中间区域显示 AI 分析 loading，右侧显示骨架屏 |
| 有结果 | 展示排序后的推荐结果与分析面板 |
| 无结果 | 显示原因提示，并建议放宽筛选条件 |
| 上传材料解析失败 | 在上传组件下方显示错误原因，允许重新上传 |

---

## 7.7 数据管理 / 文档录入

### 页面目标

文档录入是活动与案例数据的主要录入方式。用户上传 Word / PDF / Excel 后，系统使用 AI 解析字段，生成结构化数据预览，再由人工校对后入库。

### 页面布局

```txt
数据管理 / 文档录入
├── 后台左侧栏
├── 顶部 Tab：文档录入 / 活动管理 / 案例管理 / 审核发布 / 标签规则
├── AI 解析流程条
│   ├── 上传文档
│   ├── 字段识别
│   ├── 结构化预览
│   ├── 人工校对
│   └── 发布入库
├── 左侧：上传文档与上传队列
├── 中间：结构化预览
└── 右侧：重复检测 / 质量检测 / 确认入库
```

### 上传队列字段

```ts
type DocumentImportJob = {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv';
  fileSize: number;
  sourceType: 'program' | 'case' | 'mixed' | 'unknown';
  status: 'pending' | 'parsing' | 'parsed' | 'reviewing' | 'published' | 'failed';
  progress: number;
  createdAt: string;
  errorMessage?: string;
};
```

### AI 解析结构化预览

活动字段：

```ts
type ParsedProgramPreview = {
  name: string;
  type: string;
  organization: string;
  officialUrl?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  programStartDate?: string;
  programEndDate?: string;
  duration?: string;
  gradeRange?: string;
  subjectArea?: string;
  requirements?: string;
  location?: string;
  format?: 'online' | 'offline' | 'hybrid';
  cost?: string;
  scholarships?: string;
  description?: string;
  highlights: string[];
  applicationMethod?: string;
  requiredMaterials?: string[];
  capacityLimit?: string;
  confidenceMap: Record<string, number>;
};
```

案例字段：

```ts
type ParsedCasePreview = {
  anonymousCode?: string;
  grade?: string;
  schoolType?: string;
  gpaRange?: string;
  academicSummary?: string;
  activityExperience: string[];
  intendedMajor?: string;
  resultSummary?: string;
  personalSummary?: string;
  confidenceMap: Record<string, number>;
};
```

### 重复检测

右侧重复检测卡片展示：

```ts
type DuplicateCandidate = {
  id: string;
  title: string;
  similarity: number;
  reason: string;
};
```

UI 规则：

- similarity >= 90%：红色警告，建议合并。
- 75% <= similarity < 90%：橙色提醒，建议人工确认。
- < 75%：不展示或放入低风险列表。

### 入库操作

按钮：

- 保存草稿
- 提交审核
- 确认入库

权限规则：

- 内容运营：可保存草稿、提交审核。
- 管理员：可直接确认入库或发布。

---

## 7.8 数据管理 / 活动管理

### 页面目标

管理所有活动记录，支持检索、筛选、编辑、批量操作、数据完整度检查。

### 页面布局

```txt
活动管理
├── 搜索与筛选区
├── 批量操作区
├── 活动表格
└── 右侧数据概览 / 缺失字段预警
```

### 表格列

```txt
复选框 / 活动名称 / 类型 / 状态 / 来源 / 完整度 / 更新时间 / 操作
```

### 状态枚举

```ts
type RecordStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
```

### 操作

- 编辑
- 复制
- 下架
- 查看详情
- 查看关联案例
- 批量发布
- 批量删除
- 导出

---

## 7.9 数据管理 / 案例管理

### 页面目标

管理学生案例，支持匿名化、活动关联、结果维护、完整度检查。

### 页面布局

```txt
案例管理
├── 搜索与筛选区
├── 案例表格
└── 右侧案例详情预览
```

### 表格列

```txt
案例 ID / 匿名背景 / 成绩段 / 申请方向 / 关联活动数 / 结果 / 完整度 / 状态 / 操作
```

### 关键要求

1. 案例必须匿名化。
2. 不展示真实姓名、联系方式、学校精确名称等隐私信息。
3. 支持「关联活动」操作。
4. 结果可以模糊化，例如：Top 20 综合大学、美国前 30、英国 G5、未录取目标校等。

---

## 7.10 数据管理 / 审核发布

### 页面目标

对 AI 解析或人工编辑后的内容进行审核，确保数据准确后发布。

### 页面布局

```txt
审核发布
├── 审核状态 Tab
│   ├── 待审核
│   ├── 已通过
│   ├── 已退回
│   └── 发布记录
├── 左侧：审核队列
├── 中间：原文片段 vs 提取字段
└── 右侧：审核操作与意见
```

### 审核操作

```ts
type ReviewAction = 'approve' | 'reject' | 'mark_issue' | 'publish';
```

按钮：

- 通过
- 退回修改
- 标记问题
- 发布上线

### 审核记录数据结构

```ts
type ReviewRecord = {
  id: string;
  targetType: 'program' | 'case';
  targetId: string;
  sourceDocumentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  reviewerId?: string;
  reviewerNote?: string;
  submittedAt: string;
  reviewedAt?: string;
};
```

---

## 7.11 数据管理 / 标签规则

### 页面目标

维护活动与案例的标签体系，并配置智能匹配规则与权重。

### 页面布局

```txt
标签规则
├── 左侧：标签体系
│   ├── 活动类型标签
│   ├── 学科标签
│   ├── 年级标签
│   └── 申请方向标签
├── 中间：活动-案例关联规则
├── 右侧：智能匹配权重设置
└── 最右：规则效果预览
```

### 标签数据结构

```ts
type Tag = {
  id: string;
  name: string;
  group: 'program_type' | 'subject' | 'grade' | 'major' | 'location' | 'format';
  color?: string;
  enabled: boolean;
};
```

### 匹配规则结构

```ts
type MatchRule = {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'overlap' | 'range' | 'semantic_similarity';
    value?: string | string[] | number;
  };
};
```

### 默认权重建议

| 匹配维度 | 权重 |
|---|---:|
| 学科匹配 | 30% |
| 年级匹配 | 20% |
| 活动类型契合 | 20% |
| 预算匹配 | 15% |
| 时间可行性 | 10% |
| 其他因素 | 5% |

### 规则效果预览

展示一个案例和一个活动的匹配得分拆解：

```txt
案例：C-043（G11 | CS 方向）
活动：RSI 科学研究暑期项目
学科匹配 +28/30
年级匹配 +20/20
类型契合 +18/20
预算匹配 +13/15
时间可行性 +8/10
其他因素 +4/5
综合得分：91/100，高匹配
```

---

## 8. 核心数据模型

## 8.1 Program 活动

```ts
type Program = {
  id: string;
  name: string;
  type: 'Competition' | 'Summer School' | 'Research Program' | 'Other';
  organization: string;
  officialUrl?: string;

  applicationStartDate?: string;
  applicationEndDate?: string;
  programStartDate?: string;
  programEndDate?: string;
  duration?: string;

  gradeRange: string;
  subjectArea: string;
  requirements?: string;

  location: string;
  format: 'online' | 'offline' | 'hybrid';

  costText?: string;
  scholarshipText?: string;

  description: string;
  coreTopics: string[];
  highlights: string[];

  applicationMethod?: string;
  requiredMaterials?: string[];
  capacityLimit?: string;

  tags: string[];
  status: RecordStatus;
  source: 'document_import' | 'manual' | 'website' | 'api';
  completeness: number;
  createdAt: string;
  updatedAt: string;
};
```

## 8.2 Case 学生案例

```ts
type StudentCase = {
  id: string;
  anonymousCode: string;

  grade: 'G9' | 'G10' | 'G11' | 'G12';
  schoolType: 'international' | 'public' | 'other';
  gpaRange: string;
  academicSummary?: string;

  activityExperience: Array<{
    programId?: string;
    programName: string;
    type: string;
    stage: string;
    description?: string;
  }>;

  intendedMajor: string;
  resultSummary: string;
  resultTier?: string;
  personalSummary?: string;
  consultantReview?: string;

  tags: string[];
  status: RecordStatus;
  completeness: number;
  createdAt: string;
  updatedAt: string;
};
```

## 8.3 ProgramCaseRelation 活动-案例关联

```ts
type ProgramCaseRelation = {
  id: string;
  programId: string;
  caseId: string;
  relationType: 'participated' | 'similar_subject' | 'similar_path' | 'recommended';
  matchScore?: number;
  reasons?: string[];
  createdAt: string;
};
```

---

## 9. 搜索与筛选逻辑

## 9.1 全局搜索

输入关键词后返回活动和案例两类结果。

```ts
type GlobalSearchResult = {
  programs: ProgramCard[];
  cases: CaseCard[];
  total: number;
};
```

搜索字段：

- 活动名称
- 主办方
- 学科方向
- 活动简介
- 特色亮点
- 案例申请方向
- 案例活动经历
- 案例结果摘要

## 9.2 筛选规则

- 同一筛选组内：OR。
- 不同筛选组之间：AND。
- 文本搜索与筛选条件之间：AND。
- 智能匹配中的「偏好」不是硬过滤，而是影响匹配分数。

---

## 10. 路由建议

```txt
/                         首页
/programs                 活动库列表
/programs/:programId      活动详情
/cases                    案例库列表
/cases/:caseId            案例详情
/match                    智能匹配
/admin/import             数据管理 / 文档录入
/admin/programs           数据管理 / 活动管理
/admin/cases              数据管理 / 案例管理
/admin/review             数据管理 / 审核发布
/admin/rules              数据管理 / 标签规则
```

---

## 11. API 接口建议

> 以下为前端 Agent 对接后端或 mock 数据时的建议接口。

```txt
GET    /api/programs
GET    /api/programs/:id
POST   /api/programs
PATCH  /api/programs/:id
DELETE /api/programs/:id

GET    /api/cases
GET    /api/cases/:id
POST   /api/cases
PATCH  /api/cases/:id
DELETE /api/cases/:id

POST   /api/search
POST   /api/match

POST   /api/import/documents
GET    /api/import/jobs
GET    /api/import/jobs/:id
POST   /api/import/jobs/:id/confirm
POST   /api/import/jobs/:id/submit-review

GET    /api/reviews
POST   /api/reviews/:id/approve
POST   /api/reviews/:id/reject
POST   /api/reviews/:id/publish

GET    /api/tags
POST   /api/tags
PATCH  /api/tags/:id
DELETE /api/tags/:id

GET    /api/match-rules
POST   /api/match-rules
PATCH  /api/match-rules/:id
DELETE /api/match-rules/:id
```

---

## 12. 前端实现建议

### 12.1 推荐技术栈

不强制技术栈，但推荐：

```txt
Next.js / React / TypeScript / Tailwind CSS / shadcn-ui / lucide-react
```

### 12.2 组件拆分建议

```txt
components/
├── layout/
│   ├── PublicHeader.tsx
│   ├── AdminSidebar.tsx
│   └── AdminLayout.tsx
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Tag.tsx
│   ├── SearchInput.tsx
│   ├── FilterPanel.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSkeleton.tsx
│   └── UploadZone.tsx
├── programs/
│   ├── ProgramCard.tsx
│   ├── ProgramFilter.tsx
│   ├── ProgramDetailHero.tsx
│   └── RelatedCases.tsx
├── cases/
│   ├── CaseCard.tsx
│   ├── CaseFilter.tsx
│   ├── CaseTimeline.tsx
│   └── RelatedPrograms.tsx
├── match/
│   ├── StudentProfileForm.tsx
│   ├── MatchResultCard.tsx
│   ├── MatchAnalysisPanel.tsx
│   └── SimilarCaseList.tsx
└── admin/
    ├── ImportPipeline.tsx
    ├── ImportQueue.tsx
    ├── ParsedPreview.tsx
    ├── DuplicateCheckPanel.tsx
    ├── ProgramDataTable.tsx
    ├── CaseDataTable.tsx
    ├── ReviewDiffPanel.tsx
    ├── TagManager.tsx
    └── MatchRuleEditor.tsx
```

---

## 13. 响应式设计

当前高保真设计稿以桌面端为主，建议优先实现桌面端。

断点建议：

```txt
Desktop: >= 1200px
Tablet: 768px - 1199px
Mobile: < 768px
```

响应式规则：

- 桌面端：三栏布局可完整展示。
- 平板端：右侧分析栏下移，主内容保留两栏。
- 移动端：所有筛选栏收进抽屉，卡片单列展示。
- 后台管理移动端可暂不作为 MVP 优先级。

---

## 14. 空状态 / 加载 / 错误状态

### 14.1 空状态

| 场景 | 文案 |
|---|---|
| 无活动结果 | 暂无匹配活动，试试放宽筛选条件 |
| 无案例结果 | 暂无相似案例，可调整成绩段或申请方向 |
| 未开始匹配 | 填写学生背景后，系统会推荐活动与案例 |
| 无上传文档 | 拖拽 Word / PDF / Excel 文件开始录入 |

### 14.2 加载状态

- 列表使用 Skeleton 卡片。
- 表格使用 Skeleton 行。
- 智能匹配使用「AI 正在分析学生背景...」loading 文案。
- 文档解析使用进度条。

### 14.3 错误状态

| 场景 | UI 处理 |
|---|---|
| 文档上传失败 | 红色错误提示 + 重新上传按钮 |
| AI 解析失败 | 显示失败原因 + 手动录入入口 |
| 匹配失败 | 显示重试按钮 + 保留用户表单输入 |
| 接口异常 | Toast 提示 + 页面局部错误态 |

---

## 15. 权限与隐私

### 15.1 权限

```ts
type UserRole = 'viewer' | 'consultant' | 'operator' | 'admin';
```

权限建议：

| 功能 | viewer | consultant | operator | admin |
|---|---|---|---|---|
| 浏览活动 / 案例 | 是 | 是 | 是 | 是 |
| 智能匹配 | 是 | 是 | 是 | 是 |
| 文档录入 | 否 | 否 | 是 | 是 |
| 编辑活动 / 案例 | 否 | 否 | 是 | 是 |
| 审核发布 | 否 | 否 | 可提交 | 是 |
| 标签规则 | 否 | 否 | 否 | 是 |

### 15.2 隐私

- 案例一律使用匿名编号，如 C-043。
- 不展示真实姓名、联系电话、邮箱、具体学校名称。
- 原始上传文档如含隐私，应只在后台审核流程中可见。
- 前台案例详情仅展示模糊化背景。

---

## 16. MVP 验收标准

### 16.1 首页

- 能看到清晰的智能匹配入口。
- 能输入背景并跳转智能匹配页。
- 能进入活动库与案例库。

### 16.2 活动库

- 支持活动列表展示。
- 支持类型、学科、年级筛选。
- 支持活动详情页。
- 活动详情页展示相关案例。

### 16.3 案例库

- 支持案例列表展示。
- 支持成绩区间、专业方向、活动类型筛选。
- 支持案例详情页。
- 案例详情页展示活动路径与相关活动。

### 16.4 智能匹配

- 支持填写学生背景。
- 支持上传材料入口。
- 返回活动和案例混合推荐结果。
- 每条结果显示匹配分数与匹配理由。
- 右侧展示匹配分析和相似案例。

### 16.5 数据管理

- 文档录入页支持文件上传队列。
- 显示 AI 解析流程。
- 显示结构化预览字段。
- 显示重复检测与质量检测。
- 支持活动管理、案例管理、审核发布、标签规则四个 Tab 的基础页面。

---

## 17. Agent 开发顺序建议

推荐按以下顺序开发，降低依赖风险：

```txt
阶段 1：搭建项目结构、全局样式、路由、公共组件
阶段 2：首页、活动库列表、活动详情
阶段 3：案例库列表、案例详情
阶段 4：智能匹配页静态 UI + mock 推荐数据
阶段 5：数据管理后台布局 + 文档录入静态 UI
阶段 6：活动管理 / 案例管理 / 审核发布 / 标签规则 Tab
阶段 7：接入真实 API 或 mock service
阶段 8：完善空状态、加载状态、错误状态、权限控制
```

---

## 18. Mock 数据建议

前端 MVP 可先使用本地 mock 数据。建议目录：

```txt
mock/
├── programs.ts
├── cases.ts
├── match-results.ts
├── import-jobs.ts
├── review-records.ts
└── tags-rules.ts
```

示例：

```ts
export const mockPrograms: Program[] = [
  {
    id: 'p-rsi',
    name: 'RSI 科学研究暑期项目',
    type: 'Research Program',
    organization: 'CEE / MIT',
    officialUrl: 'https://www.cee.org/programs/research-science-institute',
    applicationStartDate: '2025-10-01',
    applicationEndDate: '2025-12-10',
    programStartDate: '2026-06-28',
    programEndDate: '2026-08-08',
    duration: '6 周',
    gradeRange: 'G11',
    subjectArea: 'STEM',
    location: '美国 马萨诸塞州 剑桥',
    format: 'offline',
    costText: '免费',
    scholarshipText: '全额资助',
    description: '全球顶尖高中生科研项目，学生在导师指导下完成独立研究。',
    coreTopics: ['STEM 前沿课程', '独立科研', '学术写作', '口头报告'],
    highlights: ['MIT 联合主办', '全额资助', '科研产出强'],
    tags: ['Research', 'STEM', 'G11', 'MIT'],
    status: 'published',
    source: 'document_import',
    completeness: 98,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-20T00:00:00Z'
  }
];
```

---

## 19. 开发注意事项

1. 智能匹配页不是普通筛选页，必须突出「AI 分析」「匹配理由」「路径建议」。
2. 数据管理的主入口是「文档录入」，不是手动表单创建。
3. 活动和案例之间必须保留双向关联能力。
4. 案例库要体现真实路径和多分段案例，不要设计成单一成功案例展示墙。
5. 后台表格需要支持完整度、状态、来源字段，方便运营管理。
6. 标签规则页要为后续匹配算法留出配置入口，即使 MVP 先用 mock 数据，也要保留 UI 结构。
7. 所有案例相关页面必须默认匿名化展示。

---

## 20. 页面清单汇总

| 页面 | 路由 | 优先级 | 说明 |
|---|---|---:|---|
| 首页 | `/` | P0 | 产品入口，突出智能匹配 |
| 活动库 | `/programs` | P0 | 活动列表与筛选 |
| 活动详情 | `/programs/:id` | P0 | 活动信息与相关案例 |
| 案例库 | `/cases` | P0 | 案例列表与筛选 |
| 案例详情 | `/cases/:id` | P0 | 背景、路径、结果 |
| 智能匹配 | `/match` | P0 | 核心推荐体验 |
| 文档录入 | `/admin/import` | P0 | 主要数据录入入口 |
| 活动管理 | `/admin/programs` | P1 | 活动后台管理 |
| 案例管理 | `/admin/cases` | P1 | 案例后台管理 |
| 审核发布 | `/admin/review` | P1 | 内容审核流程 |
| 标签规则 | `/admin/rules` | P1 | 标签与匹配规则配置 |

---

## 21. 交付物要求

开发 Agent 最终应输出：

1. 可运行的前端项目。
2. 与本设计稿一致的页面结构与视觉风格。
3. 使用 mock 数据完成基本交互。
4. 所有 P0 页面可访问。
5. 数据管理五个 Tab 可切换并展示对应 UI。
6. 智能匹配页具备表单输入、上传入口、推荐结果、分析面板。
7. 代码结构清晰，组件可复用。

