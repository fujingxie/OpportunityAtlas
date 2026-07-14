# Opportunity Atlas 后端接口开发文档

**版本**：v1.0  
**适用范围**：前端 MVP 接口契约；路径规划一期基于内部活动库和案例库生成可解释推荐，不包含外部联网搜索或真实 LLM 生成。
**品牌名**：Opportunity Atlas

## 1. 通用约定

### 1.0 技术实现

- 服务端形态：当前 Next.js 项目内的 Route Handlers。
- 数据库：PostgreSQL + Prisma。
- 本地数据库：可通过项目根目录 `docker-compose.yml` 启动 PostgreSQL。
- 环境变量：复制 `.env.example` 为 `.env.local` 后按需修改。

### 1.1 Base Path

```txt
/api
```

### 1.2 响应结构

成功：

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}
```

失败：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "可定位的错误信息",
    "details": {}
  }
}
```

### 1.3 分页与排序

分页参数：

```txt
page
pageSize
```

排序参数：

```txt
sortBy
sortOrder=asc|desc
```

### 1.4 鉴权与角色

管理端接口必须要求 `admin` 角色。前端通过以下接口获取当前用户角色：

```txt
GET /api/auth/me
POST /api/auth/login
POST /api/auth/logout
```

返回：

```ts
type UserRole = 'viewer' | 'admin';

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
```

`POST /api/auth/login` 请求：

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

登录成功后服务端写入 HttpOnly session cookie。`POST /api/auth/logout` 会清理当前 session。

非 admin 访问 `/api/admin/*` 时返回：

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "当前用户无管理员权限",
    "details": {}
  }
}
```

## 2. Public APIs

```txt
GET /api/auth/me
GET /api/programs
GET /api/programs/:programId
GET /api/programs/:programId/cases
GET /api/cases
GET /api/cases/:caseId
GET /api/cases/:caseId/programs
GET /api/tags
GET /api/search
POST /api/planner/recommendations
```

### 2.1 GET /api/programs

查询参数：

```txt
q
type
subject
grade
format
location
costType
page
pageSize
sortBy
sortOrder
```

说明：

- `q` 搜索活动名称、主办方、简介、亮点。
- `type` 可取 `Competition`、`Summer School`、`Research Program`、`Other`。
- `format` 可取 `online`、`offline`、`hybrid`。
- `costType` 一期建议支持 `free`、`paid`。

### 2.2 GET /api/programs/:programId

返回单条活动详情。不存在时返回 `NOT_FOUND`。

### 2.3 GET /api/programs/:programId/cases

返回与活动有关联的匿名案例列表。

关联来源：

- 案例真实参与过该活动。
- 人工建立相似学科或相似路径关联。

### 2.4 GET /api/cases

查询参数：

```txt
q
grade
schoolType
gpaRange
curriculum
standardizedScore
languageScore
competition
summerSchool
research
applicationRegion
intendedMajor
activityType
resultTier
page
pageSize
sortBy
sortOrder
```

说明：

- 案例必须匿名化，不返回真实姓名、联系方式、具体学校名称。
- `schoolType` 可取 `international`、`public`、`other`。
- `curriculum` 用于按就读体系筛选，例如 `IB`、`A-Level`、`AP`、`OSSD`；当前通过案例 `tags`、`academicSummary`、`gpaRange` 匹配。
- `standardizedScore` 用于按标化成绩文本筛选，例如 `42`、`4A*`、`SAT1550`；当前通过 `academicSummary` 和 `gpaRange` 文本匹配。
- `languageScore` 用于按语言成绩文本筛选，例如 `雅思7.5`、`托福105`。
- `competition`、`summerSchool`、`research` 分别匹配案例活动经历中的竞赛、夏校、科研文本。
- `applicationRegion` 用于按申请地区筛选，一期前端提供 `英国`、`美国`、`香港`、`澳大利亚` 四个单选项；后端兼容 `中国香港`、`澳洲` 等常见写法。
- `resultTier` 在案例库问答式筛选中使用 `顶尖`、`中等`、`普通`、`失败` 四类。

### 2.5 GET /api/cases/:caseId

返回单条匿名案例详情。不存在时返回 `NOT_FOUND`。

### 2.6 GET /api/cases/:caseId/programs

返回案例参与过或人工关联的活动列表。

### 2.7 GET /api/tags

查询参数：

```txt
group
```

仅返回 `enabled=true` 的公开标签，用于活动库和案例库筛选项。`group` 可取：

```txt
program_type
subject
grade
major
location
format
```

### 2.8 GET /api/search

返回活动和案例混合搜索结果，但不做智能推荐。

```ts
type SearchResponse = {
  programs: ProgramCard[];
  cases: CaseCard[];
  total: number;
};
```

### 2.9 POST /api/planner/recommendations

基于用户画像、活动库和案例库生成可解释路径建议。一期不调用外部搜索，也不依赖 OpenAI key；服务端使用内部规则完成活动排序、相似案例检索和解释文案组织，后续可替换解释生成层为真实 LLM。

请求：

```ts
type PlannerProfile = {
  grade: 'G9' | 'G10' | 'G11' | 'G12';
  curriculum: string;
  targetRegion: string;
  subjectArea: string;
  standardizedScore?: string;
  languageScore?: string;
  gpa?: string;
  competitions?: string;
  summerSchools?: string;
  research?: string;
  budget: 'all' | 'low' | 'medium' | 'high';
  format: 'all' | 'online' | 'offline' | 'hybrid';
  intent: 'balanced' | 'challenge' | 'support' | 'cost_effective' | 'case_reference';
  notes?: string;
};
```

返回：

```ts
type PlannerRecommendationResponse = {
  profileSummary: string;
  gaps: string[];
  programs: Array<{
    program: Program;
    score: number;
    stage: string;
    priority: 'core' | 'supplement' | 'watch';
    fitSummary: string;
    reasons: string[];
    cautions: string[];
    actionItems: string[];
    evidenceTags: string[];
    relatedCaseIds: string[];
  }>;
  cases: Array<{
    studentCase: StudentCase;
    score: number;
    pathSummary: string;
    reasons: string[];
    evidenceTags: string[];
  }>;
  timeline: Array<{
    phase: string;
    title: string;
    description: string;
    programIds: string[];
    caseIds: string[];
  }>;
  explanation: string;
  riskWarnings: string[];
  nextAdjustments: string[];
  generatedBy: 'internal_rules';
};
```

## 3. Admin APIs

```txt
POST   /api/admin/import/jobs
GET    /api/admin/import/jobs
GET    /api/admin/import/jobs/:jobId
PATCH  /api/admin/import/jobs/:jobId/items/:itemId
POST   /api/admin/import/jobs/:jobId/items/:itemId/merge
POST   /api/admin/import/jobs/:jobId/publish

GET    /api/admin/programs
POST   /api/admin/programs
PATCH  /api/admin/programs/:programId
DELETE /api/admin/programs/:programId

GET    /api/admin/cases
POST   /api/admin/cases
PATCH  /api/admin/cases/:caseId
DELETE /api/admin/cases/:caseId

GET    /api/admin/tags
POST   /api/admin/tags
PATCH  /api/admin/tags/:tagId
DELETE /api/admin/tags/:tagId

GET    /api/admin/relations
POST   /api/admin/relations
DELETE /api/admin/relations/:relationId
```

### 3.1 文档录入

`POST /api/admin/import/jobs`

- 请求类型：`multipart/form-data`
- 一期支持文件类型：`docx`
- 表单字段：
  - `file`：上传文件
  - `sourceType`：`program | case | mixed | unknown`，前端上传时必须显式传入；当前已实现 `program` 和 `case` 解析
- `pdf`、`xlsx`、`csv` 暂返回 `UNSUPPORTED_FILE_TYPE`
- `mixed`、`unknown` 暂返回 `UNSUPPORTED_SOURCE_TYPE`
- `case` 文档当前支持按案例库模板解析：章节等级映射为 `顶尖`、`中等`、`普通`、`失败`，单条案例字段包括就读体系、标化成绩、语言成绩、竞赛、夏校、科研、申请地区、路径定位
- 最大文件大小：50MB
- 返回 `ImportJob`

`GET /api/admin/import/jobs/:jobId`

返回解析任务详情和结构化预览项。预览项允许前端人工校对后 patch。每个活动预览项返回 `quality`；案例预览项当前不做活动质量检查：

```ts
type ImportQualitySummary = {
  level: 'ok' | 'warning' | 'error';
  score: number;
  duplicatePrograms?: Array<{
    id: string;
    name: string;
    status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  }>;
  issues: Array<{
    field: string;
    severity: 'warning' | 'error';
    message: string;
  }>;
};
```

质量检查覆盖：活动名称、官网格式、同一导入任务内重复名称、活动库已有同名活动、主办方、简介、年级、学科、地点、费用、时间、报名方式、申请条件、申请材料、亮点和核心主题。

`PATCH /api/admin/import/jobs/:jobId/items/:itemId`

用于修改单条解析预览字段。后端需要保存人工校对后的版本，也支持将 `status` 改为 `rejected` 以跳过发布。PATCH 返回更新后的预览项和最新 `quality`。

`POST /api/admin/import/jobs/:jobId/items/:itemId/merge`

将活动预览项合并到已有活动，适用于 `quality.duplicatePrograms` 返回的同名候选。请求体：

```ts
{
  programId?: string;
  strategy?: 'fill_missing' | 'overwrite';
}
```

默认 `fill_missing`：只填补已有活动中的空字段或 `待补充` 字段，数组字段去重合并；合并成功后预览项状态改为 `merged`，发布时不会重复创建活动。

`POST /api/admin/import/jobs/:jobId/publish`

发布导入任务。当前支持 `sourceType=program` 和 `sourceType=case`；后端只发布 `status=draft` 的预览项，已发布或已跳过的预览项不会重复入库。
活动导入若任一待发布项存在 `severity=error` 的质量问题，返回 `QUALITY_CHECK_FAILED`，管理员修复或跳过问题项后再发布。`warning` 不阻止发布。
案例导入发布时会创建 `StudentCase` 和对应 `CaseActivity` 记录；若案例编号重复或字段不合法，返回 `PUBLISH_FAILED`。

### 3.2 活动管理

活动支持草稿、已发布、归档状态。删除接口建议优先软删除或归档。

### 3.3 案例管理

案例必须匿名化。后端不得向前台案例接口返回：

- 真实姓名
- 电话
- 邮箱
- 精确学校名称
- 任何可直接识别学生身份的信息

### 3.4 发布方式

数据管理不需要审核流程。文档导入解析后由管理员直接发布；活动、案例和标签在对应管理页维护。

### 3.5 标签管理

一期标签只维护基础分组：

```ts
type TagGroup = 'program_type' | 'subject' | 'grade' | 'major' | 'location' | 'format';
```

不包含智能匹配规则或权重配置。

### 3.6 关联管理

`GET /api/admin/relations` 查询参数：

```txt
q
programId
caseId
page
pageSize
```

返回活动与案例的显式关联列表。管理端返回展示字段 `programName`、`anonymousCode`，用于后台维护；公共详情页仍通过 `/api/programs/:programId/cases` 和 `/api/cases/:caseId/programs` 展示关联结果。

## 4. Core Types

```ts
type UserRole = 'viewer' | 'admin';

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
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  source: 'document_import' | 'manual';
  completeness: number;
  createdAt: string;
  updatedAt: string;
};

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
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  completeness: number;
  createdAt: string;
  updatedAt: string;
};

type ProgramCaseRelation = {
  id: string;
  programId: string;
  caseId: string;
  relationType: 'participated' | 'similar_subject' | 'similar_path' | 'manual_related';
  reasons?: string[];
  createdAt: string;
};

type ProgramCaseRelationAdminView = ProgramCaseRelation & {
  programName: string;
  anonymousCode: string;
};

type ImportJob = {
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

type ImportItem = {
  id: string;
  jobId: string;
  itemType: 'program' | 'case';
  title: string;
  rawText?: string;
  parsedData: unknown;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'merged';
  quality?: ImportQualitySummary;
  createdAt: string;
  updatedAt: string;
};
```

## 5. 暂不开发范围

- `/api/match`
- 智能推荐、推荐分数、推荐理由
- 匹配规则权重配置
- 自动生成申请路径
- 真实 AI 文档解析算法细节
- PDF / XLSX / CSV 自动解析

## 6. 本地启动顺序

```bash
cp .env.example .env.local
docker compose up -d postgres
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

默认 seed 管理员账号来自环境变量：

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```
