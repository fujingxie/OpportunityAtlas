## 项目定位

**OpportunityAtlas（机会图鉴）** 是一个基于 Next.js 14 构建的案例/活动管理 Web 应用，主要用于展示和检索各类活动案例与项目信息。项目核心功能包括：

- **案例管理**：用户可浏览、搜索和查看活动案例详情
- **项目管理**：展示项目/活动目录及详细信息
- **后台管理**：包含导入、审查、标签管理等管理功能
- **权限控制**：基本的管理员身份验证与访问控制

当前项目处于 MVP 阶段，数据层使用本地 mock 数据模拟，尚未接入真实后端 API。

## 技术栈与设计

**核心技术栈**：
- **框架**：Next.js 14.2（App Router），React 18，TypeScript 5.7
- **样式**：Tailwind CSS 3.4
- **测试**：Jest 29 + Testing Library（React 16.x）
- **Lint**：ESLint 8 + eslint-config-next

**关键设计决策**：
1. **App Router 架构**：使用 Next.js 14 的 App Router，路由结构按功能模块划分（`app/admin/`、`app/cases/`、`app/programs/`）
2. **Mock 驱动开发**：当前所有数据接口通过 `lib/mock/service.ts` 提供，未接入后端 API（参见 `docs/backend-api.md` 设计文档）
3. **功能模块化**：`features/` 目录将业务逻辑组件与通用组件分离
4. **路径别名**：使用 `@/` 映射到项目根目录，如 `@/lib/types`
5. **权限守卫**：通过 `components/admin-guard.tsx` 实现基本的管理员路由保护
6. **首页设计方向**：首页采用居中品牌叙事、搜索框、热门标签和两个视觉入口卡片（活动库 / 案例库），保留一屏式桌面构图，不再使用左右仪表盘式首页。

## 运行部署运维

**本地开发**：
```bash
npm run lint
npm test
npm run build
npm run start
```

**部署注意事项**：
- 当前为前端 MVP，无真实后端依赖，但 `/programs` 会读取查询参数，需要按 Next.js 应用方式部署
- 生产环境需配置 `.env.local` 中的环境变量（如果有）
- 构建产物在 `.next/` 目录，使用 `next build` 后通过 Next.js runtime 运行

**已知运维要点**：
- 项目使用 `postcss.config.mjs` 和 `tailwind.config.ts`，CSS 构建由 Tailwind 自动处理
- 无数据库或 API 密钥配置，部署相对简单

## 待办与已知问题

**待办事项**：
1. **后端 API 接入**：目前所有数据来自 mock，需根据 `docs/backend-api.md` 设计文档实现真实 API
2. **认证系统**：`admin-guard.tsx` 为占位实现，需接入真实的身份认证流程
3. **数据持久化**：后台管理的导入/编辑功能无真实存储，需对接数据库
4. **文档维护**：`docs/backend-api.md` 已提供后端接口契约，后续需随真实接口变更保持同步

**已知问题**：
1. **测试覆盖不全**：仅包含 `__tests__/` 中的三个测试文件（首页、mock服务、导航测试）
2. **Mock 数据硬编码**：`lib/mock/` 下的数据文件可能随开发更新，与后端 API 设计存在偏差
3. **UI 仍需持续精修**：当前已根据高保真稿和用户反馈调整主要页面，但首页、列表页和后台页仍可能继续迭代视觉细节
4. **无错误处理**：当前代码缺少统一的错误边界和 loading 状态处理
5. **TypeScript 类型可能不完整**：`lib/types.ts` 中的类型定义需与后端 API 对齐
