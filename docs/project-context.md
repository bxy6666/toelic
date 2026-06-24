# 项目上下文

## 基本信息

- 项目名称：TOEIC Practice Studio
- 当前根目录：`D:\toelic`
- 项目类型：Next.js Web 应用 + 本地 API Routes + Prisma / SQLite
- 当前阶段：V2.1 工程增强已实现，包含登录、注册、公网保护、用户数据隔离、AI 限流和图片文件化存储
- 主要目标：为课程汇报提供一个可运行、可演示、可验收的 TOEIC 听力 / 语法练习系统

## 技术栈

- 前端：Next.js App Router、React、TypeScript
- 样式：Tailwind CSS、shadcn/ui、lucide-react、Motion、Recharts
- 后端：Next.js Route Handlers
- 数据库：SQLite + Prisma 6.19.3
- 测试：Vitest
- 浏览器验收：Playwright

## 关键目录

- `app/`：页面和 API Routes
- `components/`：应用组件与 UI 组件
- `lib/`：认证、AI 生成、统计、错题、设置、Prisma client 等业务服务
- `prisma/`：schema、migrations 和本地 SQLite 数据库
- `prompts/`：听力 / 语法题目生成 Prompt
- `tests/unit/`：单元测试
- `scripts/smoke/`：浏览器 smoke、真实生成 smoke、公网验收脚本
- `scripts/public/`：公网启动和 Cloudflare Tunnel 脚本
- `scripts/reports/`：课程汇报材料生成脚本
- `docs/spec-driven/`：规格、设计、任务、验收文档
- `output/`：截图、PPT、报告和临时验证产物

## 最新功能状态

- 登录 / 注册 / 退出已实现。
- 首次无用户时可创建管理员。
- 普通用户注册默认开放，可通过 `PUBLIC_REGISTRATION_ENABLED=false` 关闭。
- 所有核心业务接口按当前用户鉴权并隔离数据。
- 答题记录和错题 upsert 在同一事务内完成。
- 设置页的默认难度、默认题量和听力语速已在练习页生效。
- 图片描述题生成图片保存为本地文件路径。
- AI 生成按用户和日期统计次数，默认每日 50 题。
- 清空数据接口要求服务端确认字段 `confirmText: "CLEAR"`。

## 文档状态

- 规格文档：[docs/spec-driven/spec.md](./spec-driven/spec.md)
- 设计文档：[docs/spec-driven/design.md](./spec-driven/design.md)
- 任务拆分：[docs/spec-driven/tasks.md](./spec-driven/tasks.md)
- 验收记录：[docs/spec-driven/acceptance.md](./spec-driven/acceptance.md)
- 根目录说明：[README.md](../README.md)

## 验证状态

- `npm run typecheck`：通过
- `npm run lint`：通过，保留既有 `output/presentation/src/build-report-deck.mjs` unused warnings
- `npm run test:run`：7 个测试文件、27 个测试通过
- `npm run build`：通过
- `npx prisma validate`：通过

## 后续维护原则

1. 新需求先更新 `docs/spec-driven/spec.md`。
2. 设计变化同步更新 `docs/spec-driven/design.md`。
3. 可执行任务同步更新 `docs/spec-driven/tasks.md`。
4. 实现完成后更新 `docs/spec-driven/acceptance.md`。
5. 不移动 Next.js / Prisma / Tailwind 等框架要求留在根目录的配置文件。
