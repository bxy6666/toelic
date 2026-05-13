# TOEIC Practice Studio Tasks

状态：Approved  
阶段：Gate 4 - implementation  
最后更新：2026-05-08  
依据规格：[spec.md](./spec.md)  
依据设计：[design.md](./design.md)

## 0. Gate 3 执行边界

本文件已由用户确认可执行，当前进入 Gate 4，后续必须按任务顺序逐项实现。

进入 Gate 4 的条件：

1. 用户审核并确认 `tasks.md` 可执行
2. `tasks.md` 状态从 `Draft` 改为 `Approved`
3. 按本文件顺序逐项实现
4. 每完成一项更新 `acceptance.md`

当前禁止事项：

- 不写入真实 API Key
- 不跳过任务顺序临时扩范围

任务状态枚举：

- `TODO`：未开始
- `IN_PROGRESS`：正在做
- `DONE`：已完成并验证
- `BLOCKED`：被外部条件阻塞
- `SKIP`：经确认跳过

## 1. 任务总览

| ID | 任务 | 状态 |
| --- | --- | --- |
| T01 | 初始化 Next.js 项目骨架 | DONE |
| T02 | 配置 Tailwind 与 shadcn/ui 基础组件 | DONE |
| T03 | 配置 Prisma、SQLite 与数据模型 | DONE |
| T04 | 建立全局布局、导航与基础页面壳 | DONE |
| T05 | 实现设置页与配置状态 API | DONE |
| T06 | 实现 MaaS Client、Prompt 与题目校验 | DONE |
| T07 | 实现 AI 题目生成 API | DONE |
| T08 | 实现答题记录与错题更新 API | DONE |
| T09 | 实现听力练习闭环 | DONE |
| T10 | 实现语法练习闭环 | DONE |
| T11 | 实现错题本 | DONE |
| T12 | 实现学习统计 | DONE |
| T13 | 完成安全检查与错误体验 | DONE |
| T14 | 执行工程验证与浏览器验收 | DONE |
| T15 | 更新最终 `acceptance.md` | DONE |
| T16 | V1.1 首页与练习工作区 UI 打磨 | DONE |
| T17 | V1.2 丰富动效与活力重设计 | DONE |
| T18 | V1.3 练习流程体验完善 | DONE |
| T19 | V1.4 视觉对齐与响应式巡检 | DONE |
| T20 | V1.5 题目查询接口与错题重新练习 | DONE |
| T21 | V1.6 首页 Hero 今日计划卡片 | DONE |
| T22 | V1.7 学习统计卡通仪表盘 | DONE |

## 2. 详细任务

### T01 初始化 Next.js 项目骨架

目标：

- 在当前目录初始化 Next.js + TypeScript 项目
- 保留现有 `spec.md`、`design.md`、`tasks.md`、`docs/`
- 形成可运行的基础应用

涉及模块：

- `package.json`
- `app/`
- `tsconfig.json`
- `next.config.*`
- `.gitignore`

依赖变化：

- 新增 Next.js、React、TypeScript 相关依赖

验证方式：

- `npm run dev` 可启动
- 首页默认页面可访问
- `.env.local` 被 `.gitignore` 忽略

验收记录：

- 在 `acceptance.md` 记录项目初始化结果

### T02 配置 Tailwind 与 shadcn/ui 基础组件

目标：

- 接入 Tailwind CSS
- 接入 shadcn/ui
- 准备第一批基础组件

涉及模块：

- `app/globals.css`
- `components/ui/*`
- `tailwind.config.*`
- `components.json`

建议组件：

- Button
- Card
- Input
- Select
- Tabs
- Badge
- Alert
- Dialog
- Separator

依赖变化：

- shadcn/ui 所需最小依赖
- lucide-react

验证方式：

- 首页可渲染 shadcn/ui 按钮或卡片
- 页面无样式编译错误

验收记录：

- 在 `acceptance.md` 记录 UI 基础组件可用性

### T03 配置 Prisma、SQLite 与数据模型

目标：

- 配置 Prisma
- 使用 SQLite 本地数据库
- 建立 `Question`、`PracticeRecord`、`Mistake`、`UserSetting`

涉及模块：

- `prisma/schema.prisma`
- `.env`
- `lib/prisma.ts`
- `prisma/migrations/*`

依赖变化：

- `prisma`
- `@prisma/client`

验证方式：

- `npx prisma migrate dev` 成功
- `npx prisma generate` 成功
- 数据库文件生成成功

验收记录：

- 在 `acceptance.md` 记录 Prisma migration 结果

### T04 建立全局布局、导航与基础页面壳

目标：

- 建立应用外壳和导航
- 创建首页、听力、语法、错题、统计、设置页面入口
- 无业务数据时页面不报错

涉及模块：

- `app/layout.tsx`
- `app/page.tsx`
- `app/listening/page.tsx`
- `app/grammar/page.tsx`
- `app/mistakes/page.tsx`
- `app/stats/page.tsx`
- `app/settings/page.tsx`
- `components/app-shell.tsx`
- `components/empty-state.tsx`

验证方式：

- 每个页面 URL 可访问
- 导航可跳转
- 无数据状态显示正常

验收记录：

- 在 `acceptance.md` 记录基础页面可访问性

### T05 实现设置页与配置状态 API

目标：

- 读取本地配置状态
- 设置页显示 API Key 是否已配置
- 保存用户默认难度、默认题量、听力语速
- 实现清除本地学习数据

涉及模块：

- `app/api/settings/route.ts`
- `app/api/settings/clear-data/route.ts`
- `app/settings/page.tsx`
- `lib/settings-service.ts`
- `lib/constants.ts`

验证方式：

- 缺少 `MAAS_API_KEY` 时设置页显示“未配置”
- 配置占位环境变量后只显示“已配置”
- 页面不显示完整 API Key
- 清除数据需要二次确认

验收记录：

- 在 `acceptance.md` 记录 API Key 不泄露检查

### T06 实现 MaaS Client、Prompt 与题目校验

目标：

- 封装 MaaS 调用
- 建立听力和语法 Prompt 模板
- 建立题目 JSON 解析和校验逻辑

涉及模块：

- `lib/maas-client.ts`
- `lib/question-generation.ts`
- `lib/question-validation.ts`
- `lib/errors.ts`
- `prompts/generate-listening-question.ts`
- `prompts/generate-grammar-question.ts`

验证方式：

- 缺少 `MAAS_API_KEY` 时不发起外部请求
- 非 JSON 响应被拒绝
- Markdown 代码块响应被拒绝
- 答案不在选项中时被拒绝
- 听力题缺少 `listeningScript` 时被拒绝
- 语法题缺少 `grammarPoint` 时被拒绝

验收记录：

- 在 `acceptance.md` 记录题目校验结果

### T07 实现 AI 题目生成 API

目标：

- 实现 `POST /api/ai/generate-questions`
- 校验请求字段
- 调用 MaaS 并保存合格题目
- 返回结构化题目给前端

涉及模块：

- `app/api/ai/generate-questions/route.ts`
- `lib/question-generation.ts`
- `lib/question-validation.ts`
- `lib/prisma.ts`

验证方式：

- 缺少 API Key 返回 `MAAS_CONFIG_MISSING`
- 请求字段非法返回 `REQUEST_INVALID`
- MaaS 生成成功后写入 `Question`
- MaaS 返回非法结构时不落库

验收记录：

- 在 `acceptance.md` 记录 AI 生成接口结果

### T08 实现答题记录与错题更新 API

目标：

- 实现 `POST /api/practice-records`
- 提交答案后保存练习记录
- 答错时创建或更新错题

涉及模块：

- `app/api/practice-records/route.ts`
- `lib/practice-service.ts`
- `lib/mistake-service.ts`
- `lib/prisma.ts`

验证方式：

- 答对时只创建练习记录
- 答错时创建 `Mistake`
- 同题重复答错增加 `wrongCount`
- 已掌握错题再次答错变为 `reviewing`

验收记录：

- 在 `acceptance.md` 记录答题闭环 API 结果

### T09 实现听力练习闭环

目标：

- 听力页可生成题目、播放文本、选择答案、提交并显示解析
- 答题前隐藏英文选项正文

涉及模块：

- `app/listening/page.tsx`
- `components/practice-form.tsx`
- `components/question-card.tsx`
- `components/speech-controls.tsx`
- `components/result-panel.tsx`

验证方式：

- 可生成至少 3 道听力题
- 播放按钮可朗读 `listeningScript` 和选项
- 提交前只显示 A/B/C/D
- 提交后显示完整选项、正确答案、中文解析
- 答错后错题本出现记录

验收记录：

- 在 `acceptance.md` 记录听力主流程浏览器验证结果

### T10 实现语法练习闭环

目标：

- 语法页可生成题目、选择答案、提交并显示解析
- 答题记录和错题逻辑复用后端 API

涉及模块：

- `app/grammar/page.tsx`
- `components/practice-form.tsx`
- `components/question-card.tsx`
- `components/result-panel.tsx`

验证方式：

- 可生成至少 5 道语法题
- 每题只有一个正确答案
- 提交后显示中文解析和语法点
- 答题结果写入 SQLite
- 答错后错题本出现记录

验收记录：

- 在 `acceptance.md` 记录语法主流程浏览器验证结果

### T11 实现错题本

目标：

- 展示错题列表
- 支持筛选、查看详情、标记掌握、移除、更新笔记

涉及模块：

- `app/mistakes/page.tsx`
- `app/api/mistakes/route.ts`
- `app/api/mistakes/[id]/route.ts`
- `lib/mistake-service.ts`

验证方式：

- 错题列表展示原题、用户答案、正确答案、解析
- 可按题型和状态筛选
- 标记掌握后状态为 `mastered`
- 移除后默认列表不再显示

验收记录：

- 在 `acceptance.md` 记录错题本功能结果

### T12 实现学习统计

目标：

- 实现统计 API 和统计页
- 首页复用核心统计数据

涉及模块：

- `app/api/stats/route.ts`
- `app/stats/page.tsx`
- `app/page.tsx`
- `lib/stats-service.ts`
- `components/stat-card.tsx`

验证方式：

- 无数据时显示 0 和空状态
- 完成练习后今日练习数变化
- 答题后正确率变化
- 答错后当前错题数变化
- 标记掌握后已掌握数量变化

验收记录：

- 在 `acceptance.md` 记录统计一致性验证结果

### T13 完成安全检查与错误体验

目标：

- 统一错误响应和前端错误展示
- 检查 API Key 不泄露
- 检查本地配置边界

涉及模块：

- `lib/errors.ts`
- 所有 `app/api/**/route.ts`
- 所有调用 API 的页面
- `.gitignore`

验证方式：

- 浏览器页面不包含 API Key
- localStorage / sessionStorage 不包含 API Key
- 网络请求参数不包含 API Key
- 日志不输出 API Key 或 Authorization
- 缺少 `MAAS_API_KEY` 时页面提示可操作错误

验收记录：

- 在 `acceptance.md` 记录安全验收结果

### T14 执行工程验证与浏览器验收

目标：

- 执行最终工程检查
- 使用浏览器验证核心流程

涉及模块：

- 全项目
- `acceptance.md`

验证方式：

- `npm run lint`
- `npm run build`
- Prisma migration 成功
- Chrome 或 Edge 验证首页、听力、语法、错题、统计、设置主流程

验收记录：

- 在 `acceptance.md` 记录命令输出摘要和浏览器验证结论

### T15 更新最终 `acceptance.md`

目标：

- 汇总所有验收项
- 标注 `PASS` / `FAIL` / `BLOCKED` / `SKIP`
- 明确剩余风险和后续建议

涉及模块：

- `acceptance.md`
- `docs/change-log-ai.md`
- `docs/project-context.md`

验证方式：

- 每个 `spec.md` MVP 验收点都有对应记录
- 每个任务都有验收状态
- 失败或阻塞项有明确原因

验收记录：

- `acceptance.md` 本身作为最终验收记录

### T16 V1.1 首页与练习工作区 UI 打磨

目标：

- 首页接入真实统计数据，替换固定占位统计
- 提升首页入口层级和状态表达
- 提升听力 / 语法练习工作区的生成状态、题目元信息和结果反馈可读性
- 保持听力答题前隐藏英文选项正文

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `app/page.tsx`
- `app/stats/page.tsx`
- `components/app-shell.tsx`
- `components/practice-workspace.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 不新增依赖

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- 首页 HTTP 验证

验收记录：

- 在 `acceptance.md` 记录 V1.1 UI 打磨结果

### T17 V1.2 丰富动效与活力重设计

目标：

- 新增 `motion` 依赖并用于首页、听力页、语法页核心动效
- 实现页面进入、卡片 stagger、hover / tap、题目切换和结果反馈动画
- 增加动态背景，包含网格、声波和漂浮词块效果
- 增加代码原生卡通贴纸式视觉
- 保持 MaaS、SQLite、答题、错题和统计 API 不变

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `package.json`
- `app/globals.css`
- `app/page.tsx`
- `app/listening/page.tsx`
- `app/grammar/page.tsx`
- `components/app-shell.tsx`
- `components/practice-workspace.tsx`
- `components/motion-ui.tsx`
- `components/cartoon-sticker.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 新增 `motion`

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- Playwright 截图检查首页、听力页、语法页

验收记录：

- 在 `acceptance.md` 记录 V1.2 动效与视觉验收结果

### T18 V1.3 练习流程体验完善

目标：

- 生成题目时显示明确的生成中状态
- 生成题目后显示进度条和完成比例
- 最后一题提交后显示完成面板
- 完成面板提供继续练习、查看错题本、查看学习统计入口
- 保持 MaaS、SQLite、答题、错题和统计 API 不变

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `components/practice-workspace.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 不新增依赖

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- Playwright 截图检查听力 / 语法练习页

验收记录：

- 在 `acceptance.md` 记录 V1.3 练习流程体验结果

### T19 V1.4 视觉对齐与响应式巡检

目标：

- 修复首页统计卡片中数字与单位错位
- 新增复用指标卡片组件
- 首页和统计页统一指标卡片排版
- 使用桌面和移动端截图检查类似排版问题

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `components/metric-card.tsx`
- `app/page.tsx`
- `app/stats/page.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 不新增依赖

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- Playwright 截图检查首页、统计页、听力页、语法页

验收记录：

- 在 `acceptance.md` 记录 V1.4 视觉对齐与响应式巡检结果

### T20 V1.5 题目查询接口与错题重新练习

目标：

- 新增 `GET /api/questions`，支持查询已生成题目。
- 在错题本内提供重新练习入口。
- 重新练习复用现有答题记录 API，并同步刷新错题状态。

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `app/api/questions/route.ts`
- `components/mistakes-panel.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 不新增依赖
- 不修改 Prisma schema

验证方式：

- `GET /api/questions`
- `GET /api/questions?type=listening`
- `GET /api/questions?type=grammar&difficulty=medium`
- `GET /api/questions?tag=smoke`
- 非法 `type` / `difficulty` 请求
- 错题卡片内重新练习提交
- `npm run lint`
- `npm run build`

验收记录：

- 在 `acceptance.md` 记录 V1.5 功能补齐结果

### T21 V1.6 首页 Hero 今日计划卡片

目标：

- 修复“开始听力”按钮深色背景下文字不清的问题。
- 在首页 Hero 左侧 CTA 下方新增“今日智能练习计划”卡片。
- 用轻量卡片填补左侧留白，同时保持右侧插画和状态卡片布局不变。

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `app/page.tsx`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 不新增依赖

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- Playwright 首页桌面 / 移动端截图

验收记录：

- 在 `acceptance.md` 记录 V1.6 首页 Hero 优化结果

### T22 V1.7 学习统计卡通仪表盘

目标：

- 重构 `/stats` 页面主体 UI，不修改顶部导航。
- 将统计概览改造成轻卡通数据卡片。
- 将最近 7 天改为双折线图。
- 优化薄弱标签展示层级。

涉及模块：

- `spec.md`
- `design.md`
- `tasks.md`
- `app/stats/page.tsx`
- `components/stats-dashboard.tsx`
- `app/globals.css`
- `package.json`
- `acceptance.md`
- `docs/change-log-ai.md`

依赖变化：

- 新增 `recharts`

验证方式：

- `npm run lint`
- `npm run build`
- `node scripts/browser-smoke.mjs`
- Playwright 统计页桌面 / 移动端截图

验收记录：

- 在 `acceptance.md` 记录 V1.7 学习统计 UI 重构结果

## 3. Gate 4 执行规则

进入 Gate 4 后必须遵守：

1. 严格按 T01 到 T15 顺序执行
2. 每次只推进一个任务或一个任务内的最小子步骤
3. 任务完成后更新 `acceptance.md`
4. 若发现需求偏差，先回到 `spec.md` / `design.md` / `tasks.md` 更新文档
5. 不临时加入登录、云部署、多端同步、支付等第一版外功能
6. 不把 API Key 写入源码、文档正文、Git、浏览器存储或前端环境变量

## 4. Gate 3 验收清单

- `tasks.md` 包含初始化任务：待用户审核
- `tasks.md` 包含数据库任务：待用户审核
- `tasks.md` 包含 MaaS 调用任务：待用户审核
- `tasks.md` 包含听力练习任务：待用户审核
- `tasks.md` 包含语法练习任务：待用户审核
- `tasks.md` 包含错题本任务：待用户审核
- `tasks.md` 包含统计任务：待用户审核
- `tasks.md` 包含安全验收任务：待用户审核
- `tasks.md` 包含工程与浏览器验证任务：待用户审核
- 当前未创建代码或安装依赖：已满足
