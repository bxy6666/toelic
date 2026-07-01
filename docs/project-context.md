# 项目上下文

## 基本信息

- 项目名称：TOEIC Practice Studio
- 当前根目录：`E:\toelic\toelic`
- 项目类型：Next.js Web 应用 + 本地 API Routes + Prisma / SQLite
- 当前阶段：V3 paper-domain 首包已实现，包含整卷试卷、版本、手工录题、发布、作答、幂等批改、报告和本地 seed
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
- 新整卷系统与旧单题系统并行存在；`/papers` 提供 Paper / PaperVersion / Attempt 的最小 UI 闭环。

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

## 实验六新增上下文

- 实验主题：代码评审与程序性能优化。
- 项目语言：TypeScript / TSX，运行环境为 Node.js / Next.js。
- 静态评审工具：ESLint、TypeScript `tsc`、Semgrep。
- 性能优化对象：`lib/stats-service.ts` 中 `getStats` 最近 7 天统计聚合逻辑。
- 优化方式：将重复 `filter` 和重复日期格式化改为单次遍历 `Map` 聚合。
- 新增测试：`tests/unit/lib/stats-service.test.ts`。
- 新增性能脚本：`scripts/perf/stats-benchmark.ts`，终端与文本文件均输出中文结果。
- 实验产物目录：`output/lab6/`。
- 独立说明文档：`docs/lab6-code-review-performance.md`。

当前实验六验证结果：

- `npm.cmd run lint`：通过，保留既有 presentation 脚本 unused warnings。
- `npm.cmd run typecheck`：通过。
- Semgrep：通过，0 findings。
- `npm.cmd run test:run`：通过，14 个测试文件 / 48 个测试。
- `npm.cmd run build`：通过。
- 性能基准：优化前平均 22.713 ms，优化后平均 4.947 ms，提升约 78.22%，校验值一致。

## 实验七新增上下文

- 实验主题：系统测试与性能压力测试。
- 课程材料来源：`E:\BaiduNetdiskDownload\实验七：系统测试_6924121865883509877.pdf`。
- 测试对象：TOEIC Practice Studio 本地 Next.js Web 应用。
- 系统测试覆盖：登录、试卷列表、整卷作答、自动保存、交卷幂等、报告、设置、统计与核心 API。
- 新增压测脚本：`scripts/perf/system-load-test.mjs`。
- 新增命令：`npm run perf:system`。
- JMeter 计划：`output/lab7/jmeter-toeic-system-test.jmx`。
- JMeter 参数文件：`output/lab7/jmeter-users.csv`。
- 实验产物目录：`output/lab7/`。
- 独立说明文档：`docs/lab7-system-test.md`。

当前实验七验证结果：

- `npm.cmd run perf:system`：通过，20 个虚拟用户、每用户 5 轮、800 次请求全部成功。
- 压测指标：成功率 100.00%，吞吐量 12.00 requests/s，平均响应时间 1618.41 ms，P95 3822.37 ms。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run test:run`：通过，14 个测试文件 / 48 个测试。
- `npm.cmd run lint`：通过，保留既有 presentation 脚本 unused warnings。
- `npm.cmd run build`：通过。
- `npm.cmd run smoke:papers`：通过，自动保存、重复交卷幂等、发布版本只读均通过。
