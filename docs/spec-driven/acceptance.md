# TOEIC Practice Studio Acceptance

最后更新：2026-06-24  
当前阶段：V2.1 implemented / documentation maintained

## 最新状态摘要

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 当前功能版本 | PASS | 已实现登录、注册、Session Cookie、公网保护、用户数据隔离、AI 限额、图片文件化和答题事务化 |
| 目录整理 | PASS | spec-driven 文档已移动到 `docs/spec-driven/`；smoke、公网、报告脚本已分别移动到 `scripts/smoke/`、`scripts/public/`、`scripts/reports/` |
| 文档入口 | PASS | 根目录保留 `README.md`，文档总入口为 `docs/README.md` |
| 最新工程验证 | PASS | `typecheck`、`lint`、单测、生产构建、Prisma schema 校验和 smoke 脚本语法检查已完成 |

## 任务验收记录

| 任务 | 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- | --- |
| T01 | 初始化 Next.js 项目骨架 | PASS | `npm install`、`npm run build`、`npm run lint`、`Invoke-WebRequest http://127.0.0.1:3000` | Next.js 最小骨架可构建、lint 通过，dev server 首页返回 200 |
| T02 | 配置 Tailwind 与 shadcn/ui 基础组件 | PASS | `npx shadcn@latest init -d -f --base radix`、`npx shadcn@latest add ...`、`npm run lint`、`npm run build`、首页 HTTP 验证 | Tailwind v4 与 shadcn/ui 已接入，首页渲染 Button、Card、Badge 和 lucide 图标 |
| T03 | 配置 Prisma、SQLite 与数据模型 | PASS | `npx prisma validate`、`npx prisma generate`、`prisma db execute`、`prisma migrate resolve --applied`、`npx prisma migrate deploy`、Prisma Client count 查询、`npm run lint`、`npm run build` | Prisma 6.19.3 + SQLite 已落地；`migrate dev` 在当前环境返回空 schema engine 错误，已用 SQL migration + baseline 方式完成并验证 |
| T04 | 建立全局布局、导航与基础页面壳 | PASS | `npm run lint`、`npm run build`、HTTP 验证 `/`、`/listening`、`/grammar`、`/mistakes`、`/stats`、`/settings` | 全局 AppShell、主导航、首页基础仪表盘和空状态页面已可用 |
| T05 | 实现设置页与配置状态 API | PASS | `GET /api/settings`、`PATCH /api/settings`、`POST /api/settings/clear-data`、`npm run lint`、`npm run build`、设置页 HTTP 验证 | 设置页可显示配置状态、保存偏好、二次确认清除学习数据；API 不返回完整 Key |
| T06 | 实现 MaaS Client、Prompt 与题目校验 | PASS | `npm run lint`、`npm run build`、`npx tsx` 校验合法 JSON、完整 JSON 代码块、缺字段响应 | MaaS Client、听力/语法 Prompt、题目解析与结构校验已实现 |
| T07 | 实现 AI 题目生成 API | PASS | `POST /api/ai/generate-questions` 非法请求、缺 Key 请求、`npm run lint`、`npm run build` | 请求校验、缺 Key 安全错误、MaaS 生成并落库路径已实现；真实 MaaS 成功分支需本地 `.env.local` 配置后验 |
| T08 | 实现答题记录与错题更新 API | PASS | 创建测试题后调用 `POST /api/practice-records` 答对、答错、重复答错；随后清除测试数据 | 答对只创建练习记录；答错创建错题；重复答错增加 `wrongCount` 并设为 `reviewing` |
| T09 | 实现听力练习闭环 | PASS | `npm run lint`、`npm run build`、`GET /listening` | 听力页已实现生成表单、Web Speech 控制、答题前隐藏选项正文、提交与解析 UI；真实 MaaS 生成验收待本地 Key 配置后补测 |
| T10 | 实现语法练习闭环 | PASS | `npm run lint`、`npm run build`、`GET /grammar` | 语法页已实现生成表单、答题、提交与解析 UI；真实 MaaS 生成验收待本地 Key 配置后补测 |
| T11 | 实现错题本 | PASS | 种入测试错题后验证 `GET /api/mistakes`、`PATCH mark-mastered`、`PATCH remove`、`GET /mistakes`；随后清除测试数据 | 错题列表、筛选基础、详情展示、标记掌握、移除功能可用 |
| T12 | 实现学习统计 | PASS | 种入测试记录后验证 `GET /api/stats`、`GET /stats`、`npm run lint`、`npm run build`；随后清除测试数据 | 今日练习、正确率、分类正确率、错题数、7 天趋势和薄弱标签可计算 |
| T13 | 完成安全检查与错误体验 | PASS | `rg` 检查危险渲染、前端环境变量、浏览器存储、日志；检查 `.gitignore` 和 `.env.local` 状态；`npm run lint`、`npm run build` | 未发现 Key 进入前端、浏览器存储或日志；`.env.local` 当前不存在且已忽略 |
| T14 | 执行工程验证与浏览器验收 | PASS | `npm run lint`、`npm run build`、`npx prisma migrate deploy`、HTTP smoke、Playwright Edge smoke | 工程验证通过；6 个核心页面浏览器访问均有可读内容 |
| T15 | 更新最终 `acceptance.md` | PASS | 汇总任务、规格、安全、阻塞项 | 已完成最终验收记录 |

## 规格验收记录

| 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- |
| API Key 不写入源码或文档正文 | PASS | 检查新增文件，只包含环境变量名称和占位说明 | 未写入真实 API Key |
| `.env.local` 不提交 | PASS | 检查 `.gitignore` | `.env*.local` 与 `.env.local` 已忽略 |

## 工程验证摘要

| 命令 / 检查 | 状态 | 结果 |
| --- | --- | --- |
| `npm install` | PASS | 依赖安装完成并生成锁文件；npm 报告 2 个 moderate 漏洞，未执行破坏性 `audit fix --force` |
| `npm run build` | PASS | Next.js 生产构建通过；出现 SWC 原生包被占用后回退 WASM 的警告 |
| `npm run lint` | PASS | ESLint 9 flat config 已补齐，lint 通过 |
| `npm run dev -- --hostname 127.0.0.1 --port 3000` | PASS | dev server 已启动 |
| 首页 HTTP 验证 | PASS | `http://127.0.0.1:3000` 返回 200，页面包含 `TOEIC Practice Studio` |
| T02 首页 UI 验证 | PASS | `http://127.0.0.1:3000` 返回 200，页面包含 `Gate 4 / T02` 和 `基础 UI 验证` |
| Prisma schema 验证 | PASS | `npx prisma validate` | schema 有效 |
| Prisma client 生成 | PASS | `npx prisma generate` | `@prisma/client` 生成成功 |
| SQLite 迁移应用 | PASS | `prisma db execute` + `prisma migrate resolve --applied` + `npx prisma migrate deploy` | 数据库表已创建，migration 已标记 applied，无待应用迁移 |
| Prisma Client 查询 | PASS | Node 脚本查询四个模型 count | `Question`、`PracticeRecord`、`Mistake`、`UserSetting` 均可查询，初始计数为 0 |
| T04 页面访问验证 | PASS | `Invoke-WebRequest` 请求六个页面 | 首页、听力、语法、错题、统计、设置均返回 200 |
| T05 设置读取 API | PASS | `GET /api/settings` | 返回 `hasApiKey`、Base URL、Model 和学习偏好，不返回完整 Key |
| T05 设置保存 API | PASS | `PATCH /api/settings` 后再次 `GET` | 默认难度、题量、语速可保存；测试后已重置默认值 |
| T05 清除数据 API | PASS | `POST /api/settings/clear-data` | 返回 `cleared: true` |
| T05 设置页渲染 | PASS | `GET /settings` | 页面返回 200，包含 MaaS 配置区域 |
| T06 题目校验 | PASS | `npx tsx` 调用 `parseAndValidateQuestions` | 合法听力题通过；完整 JSON 代码块可解析后继续校验；夹杂额外 Markdown 的响应拒绝为 `AI_RESPONSE_INVALID`；缺字段题拒绝为 `QUESTION_VALIDATION_FAILED` |
| T07 请求校验 | PASS | 非法 `practiceType` 请求 | 返回 `REQUEST_INVALID` |
| T07 缺 Key 分支 | PASS | 未配置本地 `MAAS_API_KEY` 时请求生成题目 | 返回 `MAAS_CONFIG_MISSING`，未发起前端 MaaS 请求 |
| T08 答题记录 API | PASS | `POST /api/practice-records` | 答对记录 `isCorrect=true`；答错记录 `isCorrect=false` |
| T08 错题更新 | PASS | 同一题连续答错两次 | 第一错创建 `Mistake`，第二错 `wrongCount=2` 且 `status=reviewing` |
| T09 页面访问 | PASS | `GET /listening` | 页面返回 200，包含听力练习工作区 |
| T09 MaaS 实题生成 | PASS | 本地 `.env.local` 配置 `MAAS_API_KEY` 后调用 `POST /api/ai/generate-questions` | 已生成 1 道听力题并写入 SQLite；返回完整 A/B/C/D、答案与 `listeningScript` |
| T10 页面访问 | PASS | `GET /grammar` | 页面返回 200，包含语法练习工作区 |
| T10 MaaS 实题生成 | PASS | 本地 `.env.local` 配置 `MAAS_API_KEY` 后调用 `POST /api/ai/generate-questions` | 已生成 1 道语法题并写入 SQLite；中文解析在数据库中正常保存 |
| T11 错题列表 API | PASS | `GET /api/mistakes` | 返回测试错题及题目详情、选项、标签 |
| T11 错题状态更新 | PASS | `PATCH /api/mistakes/:id` | 可标记 `mastered`，可移除为 `removed` |
| T11 默认列表过滤 | PASS | 移除后再次 `GET /api/mistakes` | 默认列表不再显示已移除错题 |
| T12 统计 API | PASS | `GET /api/stats` | 测试数据返回今日 2 题、正确率 50%、语法正确率 50%、当前错题 1 |
| T12 统计页 | PASS | `GET /stats` | 页面返回 200 |
| T13 API Key 边界 | PASS | 检查 `.env.local`、`.gitignore`、`rg` 搜索 | `.env.local` 仅本地保存且已忽略；接口只返回 `hasApiKey`，只有服务端文件读取 `MAAS_API_KEY` |
| T13 前端安全 | PASS | `rg dangerouslySetInnerHTML localStorage sessionStorage NEXT_PUBLIC` | 未发现危险 HTML 渲染、浏览器存储或前端公开 Key 变量 |
| T14 lint | PASS | `npm run lint` | 通过 |
| T14 build | PASS | `npm run build` | 通过 |
| T14 Prisma migration | PASS | `npx prisma migrate deploy` | 无待应用迁移 |
| T14 HTTP smoke | PASS | 核心页面与 API 请求 | `/`、听力、语法、错题、统计、设置、settings API、stats API 均返回 200 |
| T14 Browser smoke | PASS | `node scripts/smoke/browser-smoke.mjs`，Playwright + Edge | 6 个核心页面均有可读文本 |
| T16 V1.1 spec-driven 文档补充 | PASS | 检查 `spec.md`、`design.md`、`tasks.md` | 已补充 V1.1 UI 打磨规格、设计和任务记录 |
| T16 首页真实统计 | PASS | `GET /`、`GET /api/stats`、`npm run build` 路由输出 | 首页不再使用固定占位统计，展示来自 SQLite 统计服务的数据；`/` 和 `/stats` 已设为动态渲染 |
| T16 练习工作区 UI 打磨 | PASS | `GET /listening`、`GET /grammar`、`node scripts/smoke/browser-smoke.mjs` | 增强生成设置摘要、题目元信息、选项选中态和提交后正确/错误反馈 |
| T16 工程验证 | PASS | `npm run lint`、`npm run build`、`npx prisma migrate deploy` | 全部通过，无新增依赖 |
| T17 spec-driven 文档补充 | PASS | 检查 `spec.md`、`design.md`、`tasks.md` | 已补充 V1.2 丰富动效、动态背景和卡通贴纸范围 |
| T17 Motion 依赖 | PASS | `npm install motion`、`package.json` | 已新增 `motion`，未引入大型 3D、粒子、Lottie、Rive 或游戏引擎 |
| T17 首页丰富动效 | PASS | `GET /`、Playwright 截图 `output/playwright/v1-2-home.png` | 首页接入 Motion 页面进入、统计 stagger、入口 hover / tap 和代码原生卡通贴纸 |
| T17 听力页动效与背景 | PASS | `GET /listening`、Playwright 截图 `output/playwright/v1-2-listening.png` | 听力页增加声波背景、页面进入、题目切换和贴纸空状态；答题前隐藏选项规则未改 |
| T17 语法页动效与背景 | PASS | `GET /grammar`、Playwright 截图 `output/playwright/v1-2-grammar.png` | 语法页增加漂浮词块背景、页面进入、题目切换和贴纸空状态 |
| T17 reduced motion | PASS | 检查 `app/globals.css` | `prefers-reduced-motion: reduce` 下关闭背景和贴纸 CSS 动画 |
| T17 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs` | 全部通过 |
| T18 spec-driven 文档补充 | PASS | 检查 `spec.md`、`design.md`、`tasks.md` | 已补充 V1.3 生成中、进度和完成面板范围 |
| T18 生成中状态 | PASS | 检查 `components/practice-workspace.tsx`、浏览器 smoke | `loading` 时显示“正在生成题目”状态面板 |
| T18 练习进度条 | PASS | 检查 `components/practice-workspace.tsx` | 生成题目后显示 `answeredCount / questions.length` 和百分比进度条 |
| T18 完成面板 | PASS | Playwright API 拦截 UI 流程、截图 `output/playwright/v1-3-completion.png` | 最后一题提交后显示“本组完成”，提供再来一组、查看错题、学习统计入口 |
| T18 听力隐藏选项规则 | PASS | Playwright API 拦截 UI 流程 | 提交前英文选项正文隐藏，提交后显示完整英文选项 |
| T18 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs` | 全部通过，无新增依赖 |
| T19 spec-driven 文档补充 | PASS | 检查 `spec.md`、`design.md`、`tasks.md` | 已补充 V1.4 视觉对齐和响应式巡检范围 |
| T19 指标卡片对齐 | PASS | 新增 `components/metric-card.tsx`，截图 `output/playwright/v1-4-home-desktop.png` | 首页统计卡片改用统一指标卡片，数字与单位使用 baseline 对齐 |
| T19 统计页同类修复 | PASS | 截图 `output/playwright/v1-4-stats-desktop.png` | 统计页汇总指标改用同一 `MetricCard`，避免同类错位 |
| T19 移动端溢出巡检 | PASS | Playwright 桌面 / 移动端截图和 bounding box 检查 | 首页、统计页、听力页、语法页桌面与移动端 `overflowCandidates=0` |
| T19 移动端导航 | PASS | 截图 `output/playwright/v1-4-home-mobile.png` | 顶部导航移动端改为自动换行，不再横向溢出视口 |
| T19 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs` | 全部通过，无新增依赖 |
| T20 题目查询接口 | PASS | `GET /api/questions`、`type` / `difficulty` / `tag` 筛选、非法枚举请求 | 新增查询接口可返回已生成题目；非法 `type` / `difficulty` 返回 `REQUEST_INVALID` |
| T20 错题重新练习 | PASS | 错题题目调用 `POST /api/practice-records` 答错、答对、重复答错 | 复练复用现有答题 API；重复答错时 `wrongCount+1` 且状态变为 `reviewing` |
| T20 错题页入口 | PASS | `GET /mistakes` | 页面包含“重新练习”入口；已掌握、移除、笔记能力保持不变 |
| T20 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs`、`npm run smoke:generation` | 全部通过；9 个 MaaS 子题型真实生成仍全部 PASS |
| T21 首页 Hero 今日计划卡片 | PASS | Playwright 首页桌面 / 移动端截图 | CTA 下方新增“今日智能练习计划”卡片；桌面卡片约 639px × 190px |
| T21 听力 CTA 可读性 | PASS | Playwright 读取计算样式 | “开始听力”按钮为深绿背景、白色文字，解决黑底文字不清问题 |
| T21 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs` | 全部通过，无新增依赖 |
| T22 学习统计 Hero | PASS | Playwright 统计页桌面 / 移动端截图 | `/stats` 主体新增浅色 Hero、淡网格和卡通报告插画；顶部导航未修改 |
| T22 数据卡片重构 | PASS | Playwright 可见性检查、页面截图 | 7 个统计项改为圆角渐变数据卡片，保留原有数据含义 |
| T22 最近 7 天折线图 | PASS | Playwright 检查 Recharts SVG 渲染 | 最近 7 天使用 Recharts 双折线 / 面积图，包含 legend 和 tooltip 能力 |
| T22 薄弱标签优化 | PASS | Playwright 可见性检查 | 薄弱标签改为有权重层级的胶囊标签，并加入轻量辅助插画 |
| T22 响应式与工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs`、Playwright scrollWidth 检查 | 桌面 / 移动端无横向滚动；新增依赖 `recharts` |

## MVP 验收汇总

| 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- |
| 首页可访问并展示统计壳 | PASS | HTTP / 浏览器访问 `/` | 当前为 0 值基础仪表盘，后续真实数据来自 T12 统计服务 |
| 听力页可访问并具备答题前隐藏选项规则 | PASS | 代码与页面验证 | 提交前显示 A/B/C/D 与隐藏提示，不展示英文选项正文 |
| 听力题真实 MaaS 生成 | PASS | `POST /api/ai/generate-questions` | 已生成并落库 1 道听力题，包含听力脚本与完整选项 |
| 语法页可访问并具备答题闭环 UI | PASS | HTTP / 浏览器访问 `/grammar` | 生成依赖 MaaS Key |
| 语法题真实 MaaS 生成 | PASS | `POST /api/ai/generate-questions` | 已生成并落库 1 道语法题，中文解析保存正常 |
| 练习记录写入 SQLite | PASS | T08 API 验证 | 答对/答错记录均可写入 |
| 错题自动创建或更新 | PASS | T08 / T11 API 验证 | 重复答错增加 `wrongCount` |
| 错题可标记掌握和移除 | PASS | T11 API 验证 | `mastered` / `removed` 可更新 |
| 学习统计与记录一致 | PASS | T12 测试数据验证 | 正确率、错题数、趋势和薄弱标签可计算 |
| 设置页不泄露 API Key | PASS | T05 / T13 验证 | 只返回 `hasApiKey` |
| 工程验证 | PASS | T14 | lint、build、Prisma deploy、浏览器 smoke 均通过 |
| V1.1 UI 打磨 | PASS | T16 | 首页真实统计和练习工作区状态反馈已完成 |
| V1.2 丰富动效 | PASS | T17 | 首页、听力页、语法页已完成 Motion 动效、动态背景和卡通贴纸 |
| V1.3 练习体验 | PASS | T18 | 生成中状态、进度条、完成面板和下一步入口已完成 |
| V1.4 视觉对齐 | PASS | T19 | 首页和统计页指标卡片对齐已统一，桌面 / 移动端巡检通过 |
| V1.5 功能补齐 | PASS | T20 | 已补齐题目查询接口和错题本内重新练习闭环 |
| V1.6 首页 Hero 优化 | PASS | T21 | 已新增今日计划卡片并修复听力 CTA 文字对比度 |
| V1.7 学习统计 UI 重构 | PASS | T22 | 已完成卡通学习仪表盘、数据卡片、折线图和薄弱标签优化 |

## 剩余风险项

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| MaaS 真实生成验收 | PASS | 本地 `.env.local` 已配置，听力和语法各 1 道真实题生成并落库 |
| API Key 轮换建议 | RECOMMENDED | 用户已在聊天中贴出 Key，建议在华为云控制台轮换后再用于长期开发 |

## MaaS 补测记录

| 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- |
| 配置状态 | PASS | `GET /api/settings` | 返回 `hasApiKey: true`，不返回完整 Key |
| 语法题生成 | PASS | `POST /api/ai/generate-questions`，`practiceType=grammar` | 生成 ID `cmowyt88o0000u8iolltn7h88`，写入 SQLite |
| 听力题生成 | PASS | `POST /api/ai/generate-questions`，`practiceType=listening` | 生成 ID `cmowyuaru0001u8iox1rt1l8n`，写入 SQLite，包含 `listeningScript` |
| MaaS JSON 兼容 | PASS | 真实 MaaS 响应验证 | 若模型返回完整 JSON 代码块，后端剥离外层代码块后继续进行严格字段校验；夹杂额外文本仍拒绝 |
| 工程验证 | PASS | `npm run lint`、`npm run build`、`node scripts/smoke/browser-smoke.mjs` | 全部通过 |

## V1.8 / V2 / V2.1 改进验收记录

| 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- |
| 统一 API 响应 | PASS | 代码检查、单测覆盖 | 新增 `lib/api-response.ts`，业务 API 复用统一成功 / 失败结构 |
| 管理员登录、注册与首次初始化 | PASS | `tests/unit/api/auth-login.route.test.ts`、`tests/unit/api/auth-register.route.test.ts` | 首次无用户时创建管理员；登录页支持新用户注册，也可通过 `PUBLIC_REGISTRATION_ENABLED=false` 关闭 |
| 页面登录保护 | PASS | Proxy 与服务端页面检查 | 未登录页面请求跳转 `/login`，API 返回 JSON 401 |
| 用户数据隔离 | PASS | Prisma schema 与 service 查询检查 | 题目、记录、错题、设置均加入 `userId` 作用域 |
| 清空数据服务端确认 | PASS | `tests/unit/api/clear-data.route.test.ts` | 除弹窗外，接口要求 `confirmText: "CLEAR"` |
| 设置真正生效 | PASS | 代码检查 | 练习页读取默认难度、题量和听力语速 |
| 答题事务化 | PASS | `tests/unit/lib/practice-service.test.ts` | 练习记录和错题 upsert 在同一事务内完成 |
| 图片文件化 | PASS | 代码检查 | base64 图片保存到 `output/generated-images/`，数据库保存受保护 API 路径 |
| AI 生成限额 | PASS | 代码检查 | `GenerationUsage` 按用户和日期记录题量，默认每日 50 题 |
| CI 与 typecheck | PASS | `.github/workflows/ci.yml` | CI 覆盖安装、Prisma 校验、typecheck、lint、单测和 build |

### 本轮工程验证摘要

| 检查 | 状态 | 结果 |
| --- | --- | --- |
| `npm install` | PASS | 使用本地 npm cache 安装成功；npm audit 当前报告 7 个漏洞，未执行自动修复 |
| `npm run typecheck` | PASS | TypeScript 类型检查通过 |
| `npm run lint` | PASS | 0 error；`output/presentation/src/build-report-deck.mjs` 保留 4 个既有 unused warnings |
| `npm run test:run` | PASS | 7 个测试文件、27 个测试全部通过 |
| `npm run build` | PASS | Next.js 生产构建通过；登录保护已使用 Next 16 `proxy.ts` 约定 |
| `npx prisma validate` | PASS | 当前 `.env` 指向的 SQLite 配置下 schema 校验通过 |
| `npx prisma migrate deploy` | PASS | 已为当前非空 `dev.db` 补齐 3 个 migration baseline 记录，随后 deploy / status 均显示无待应用迁移 |
| `node --check scripts/smoke/*.mjs` | PASS | `public-acceptance.mjs` 与 `generation-smoke.mjs` 登录适配后语法检查通过 |
| `git diff --check` | PASS | 未发现空白错误，仅有 Git 提示后续可能按配置转换 CRLF |

## V3 paper-domain 首包验收记录

| 验收项 | 状态 | 验证方式 | 备注 |
| --- | --- | --- | --- |
| Prisma 试卷域模型 | PASS | `npx prisma migrate dev --name add_paper_domain` | 已新增核心表和预留导入表，旧单题模型保留 |
| Paper / Version / Attempt API | PASS | 代码检查、`tests/unit/api/papers.route.test.ts` | API 沿用 `{ ok, data/error }` 和登录鉴权 |
| draft-only 编辑规则 | PASS | `tests/unit/lib/paper-service.test.ts` | 非 draft 编辑 / 发布路径返回 `VERSION_NOT_EDITABLE` |
| 发布校验 | PASS | `tests/unit/lib/paper-service.test.ts` | A-D 选项与答案键校验已覆盖 |
| AttemptResponse autosave | PASS | `tests/unit/lib/paper-service.test.ts` | `attemptId + itemId` upsert 并刷新 `lastAutosavedAt` |
| Submit 幂等入口 | PASS | `tests/unit/lib/paper-service.test.ts` | 已存在 GradingResult 时直接返回报告 |
| 最小 UI 闭环 | PASS | 页面文件检查 | 已新增 `/papers`、创建、详情、版本编辑、作答、报告页面 |
| seed 样例 | PASS | 文件检查 | 已新增 `data/papers/toeic-sample-001.json` 与 `npm run seed:papers` |
| seed 幂等性 | PASS | 连续执行 `npm run seed:papers` | 首次 `PASS toeic-sample-001 v1`，第二次 `SKIP toeic-sample-001 v1` |
| V3 工程验证 | PASS | `typecheck`、`test:run`、`lint`、`build`、`prisma validate` | lint 仅保留既有 presentation unused warnings |

## V3 paper-domain E2E smoke hardening acceptance

| Item | Result |
| --- | --- |
| Command | `npm run smoke:papers` |
| BASE_URL | `http://127.0.0.1:3000` |
| Seed sourceKey | `toeic-sample-001` |
| Attempt ID | `cmqsaecw3000bu8w4okhx6okd` |
| Report summary | `total=3`, `correct=1`, `wrong=1`, `unanswered=1` |
| Autosave reload | PASS |
| Submit idempotency | PASS |
| Published read-only UI | PASS |
| Direct published edit API | PASS, returned `VERSION_NOT_EDITABLE` |
| Scope guard | PASS, no OCR / Redis / Qdrant / FastAPI and no rewrite of old Question / PracticeRecord / Mistake flows |

## V4 paper document import acceptance

| Item | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run test:run` | PASS, 13 files / 46 tests |
| `npx prisma validate` | PASS |
| `npm run lint` | PASS, existing presentation warnings only |
| `npm run build` | PASS |
| `npx prisma migrate deploy` | PASS, applied `20260625012000_add_paper_import_fields` |
| `npm run smoke:papers` | PASS, attemptId `cmqsutaub002vu8asd4i2x9k9`, report `total=3 correct=1 wrong=1 unanswered=1` |
| `npm run smoke:paper-import` | PASS, uploaded generated DOCX, parsed 3 questions, missing answers 0, created draft PaperVersion `cmqsuqubp001vu8as7mm6ag4r`, import history visible |
| Import resume UI/API | PASS, `/api/paper-imports` returned recent jobs for smoke user; `/papers/import` rendered upload, history, and Import lab UI |
| AI answer completion unit test | PASS, MaaS helper mock fills missing answer and marks `answerSource=ai` |
| Real MaaS smoke | FAIL, direct MaaS call returns 401 `Invalid authorization header`; current local `MAAS_API_KEY` must be replaced before true AI generation can pass |
| MaaS diagnostics | PASS, settings page includes a protected server-side connection check endpoint and UI button; failures preserve `AI_GENERATION_FAILED` |
| MaaS config required | `MAAS_API_KEY`, `MAAS_BASE_URL=https://api.modelarts-maas.com/v1/`, `MAAS_MODEL=<Huawei Cloud model id>` |
| Scope guard | PASS, no OCR / Redis / Qdrant / FastAPI and no rewrite of old Question / PracticeRecord / Mistake flows |
