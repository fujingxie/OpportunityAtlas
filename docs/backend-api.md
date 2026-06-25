# Opportunity Atlas 后端接口开发文档

**版本**：v1.0  
**适用范围**：前端 MVP 接口契约，不包含智能匹配、AI 推荐、真实登录实现细节。  
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
GET /api/search
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

### 2.5 GET /api/cases/:caseId

返回单条匿名案例详情。不存在时返回 `NOT_FOUND`。

### 2.6 GET /api/cases/:caseId/programs

返回案例参与过或人工关联的活动列表。

### 2.7 GET /api/search

返回活动和案例混合搜索结果，但不做智能推荐。

```ts
type SearchResponse = {
  programs: ProgramCard[];
  cases: CaseCard[];
  total: number;
};
```

## 3. Admin APIs

```txt
POST   /api/admin/import/jobs
GET    /api/admin/import/jobs
GET    /api/admin/import/jobs/:jobId
PATCH  /api/admin/import/jobs/:jobId/items/:itemId
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

POST   /api/admin/relations
DELETE /api/admin/relations/:relationId
```

### 3.1 文档录入

`POST /api/admin/import/jobs`

- 请求类型：`multipart/form-data`
- 一期支持文件类型：`docx`
- 表单字段：
  - `file`：上传文件
  - `sourceType`：`program | case | mixed | unknown`，前端上传时必须显式传入；当前已实现 `program` 解析
- `pdf`、`xlsx`、`csv` 暂返回 `UNSUPPORTED_FILE_TYPE`
- `case`、`mixed`、`unknown` 暂返回 `UNSUPPORTED_SOURCE_TYPE`，待案例文档字段模板确认后扩展
- 最大文件大小：50MB
- 返回 `ImportJob`

`GET /api/admin/import/jobs/:jobId`

返回解析任务详情和结构化预览项。预览项允许前端人工校对后 patch。

`PATCH /api/admin/import/jobs/:jobId/items/:itemId`

用于修改单条解析预览字段。后端需要保存人工校对后的版本，也支持将 `status` 改为 `rejected` 以跳过发布。

`POST /api/admin/import/jobs/:jobId/publish`

发布活动导入任务。当前仅支持 `sourceType=program`；后端只发布 `status=draft` 的活动预览项，已发布或已跳过的预览项不会重复入库。

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
