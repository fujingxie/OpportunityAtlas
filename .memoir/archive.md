## 项目定位

**OpportunityAtlas（机会图鉴）** 是一个基于 Next.js 14 构建的案例/活动管理 Web 应用，主要用于展示和检索各类活动案例与项目信息。项目核心功能包括：

- **案例管理**：用户可浏览、搜索和查看活动案例详情
- **项目管理**：展示项目/活动目录及详细信息
- **后台管理**：包含导入、审查、标签管理等管理功能
- **权限控制**：基本的管理员身份验证与访问控制

当前项目处于 MVP 阶段，已从纯 mock 前端过渡到 Next.js Route Handlers + PostgreSQL/Prisma 的真实后端骨架。
2026-06-25 起项目开始接入真实服务端：Next.js Route Handlers 提供 `/api/*`，前端公共页和管理端逐步改为运行时请求 API；`lib/mock/*` 保留为 seed 数据源和测试 fixture。

## 技术栈与设计

**核心技术栈**：
- **框架**：Next.js 14.2（App Router），React 18，TypeScript 5.7
- **样式**：Tailwind CSS 3.4
- **测试**：Jest 29 + Testing Library（React 16.x）
- **Lint**：ESLint 8 + eslint-config-next
- **服务端接口**：Next.js Route Handlers
- **数据库**：PostgreSQL + Prisma 7
- **鉴权**：邮箱/密码登录 + HttpOnly session cookie + `viewer/admin` 角色
- **文档导入**：一期使用 `mammoth` 解析 DOCX 文本，上传时通过 `sourceType` 显式区分活动/案例；当前已实现活动文档规则解析，不接 AI 解析

**关键设计决策**：
1. **App Router 架构**：使用 Next.js 14 的 App Router，路由结构按功能模块划分（`app/admin/`、`app/cases/`、`app/programs/`）
2. **Seed/Fixture 保留**：`lib/mock/*` 保留为 seed 数据源和测试 fixture，运行时公共页和管理端逐步走真实 `/api/*`
3. **功能模块化**：`features/` 目录将业务逻辑组件与通用组件分离
4. **路径别名**：使用 `@/` 映射到项目根目录，如 `@/lib/types`
5. **权限守卫**：通过 `components/admin-guard.tsx` 实现基本的管理员路由保护
6. **首页设计方向**：首页采用居中品牌叙事、搜索框、热门标签和两个视觉入口卡片（活动库 / 案例库），保留一屏式桌面构图，不再使用左右仪表盘式首页。
7. **真实后端接入方向**：后端与前端同仓库，使用 `app/api/**/route.ts` 实现接口；数据库模型位于 `prisma/schema.prisma`，本地 seed 复用已有 mock 活动和案例数据。
8. **文档导入分流**：管理端上传接口 `POST /api/admin/import/jobs` 使用 `sourceType=program|case|mixed|unknown` 区分文档类型；一期仅解析活动文档，案例文档字段模板确认后再实现解析器。

## 运行部署运维

**本地开发**：
```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run lint
npm test
npm run build
npm run start
```

**部署注意事项**：
- 当前为前后端同仓库 Next.js 应用，运行时需要 PostgreSQL
- 生产环境需配置 `DATABASE_URL`、`SESSION_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`、`UPLOAD_DIR`
- 构建产物在 `.next/` 目录，使用 `next build` 后通过 Next.js runtime 运行

**已知运维要点**：
- 项目使用 `postcss.config.mjs` 和 `tailwind.config.ts`，CSS 构建由 Tailwind 自动处理
- 项目根目录提供 `docker-compose.yml` 用于本地启动 PostgreSQL；当前 Codex 环境没有 docker 命令，数据库烟测需在用户本机执行

## 待办与已知问题

**待办事项**：
1. **后端 API 接入深化**：真实 API 骨架已实现，后续需在本机 PostgreSQL 环境完成端到端数据烟测
2. **认证系统上线化**：当前为基础邮箱/密码 + session，后续可补充密码重置、审计日志和更细角色权限
3. **管理端编辑体验**：文档录入页已支持活动 DOCX 上传、预览列表、单条预览编辑、跳过发布和批量发布；活动、案例与标签管理页已支持基础新增、编辑、状态维护、单条归档/停用和批量归档/停用。后续重点是端到端烟测、活动-案例关联管理和更细的表单体验。
4. **文档维护**：`docs/backend-api.md` 已提供后端接口契约，后续需随真实接口变更保持同步

**已知问题**：
1. **测试覆盖仍需扩展**：当前已有首页、导航、mock service 和活动 DOCX 解析测试，后续仍需补 API 鉴权、管理端交互和数据库链路测试
2. **Mock 数据硬编码**：`lib/mock/` 下的数据文件可能随开发更新，与后端 API 设计存在偏差
3. **UI 仍需持续精修**：当前已根据高保真稿和用户反馈调整主要页面，但首页、列表页和后台页仍可能继续迭代视觉细节
4. **无错误处理**：当前代码缺少统一的错误边界和 loading 状态处理
5. **TypeScript 类型可能不完整**：`lib/types.ts` 中的类型定义需与后端 API 对齐
