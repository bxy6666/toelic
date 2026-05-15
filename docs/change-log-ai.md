# AI 变更记录

## 2026-05-13 / Codex 对话记录归档

- 将 3 个指定 Codex 会话 `.jsonl` 原始记录复制到 `docs/codex-conversations/raw/`，保留全局 `.codex` 原始会话不删除，避免破坏 Codex 桌面端历史记录。
- 新增 `docs/codex-conversations/README.md`，记录线程 ID、主题、项目内归档路径、文件大小和 SHA256 校验值。
- 本次未修改业务代码、未安装依赖、未运行构建链；仅做项目内对话证据归档。

## 2026-05-13 / Codex 对话 Markdown 导出

- 新增 `scripts/export-codex-conversations-md.py`，从 `docs/codex-conversations/raw/*.jsonl` 提取用户询问与助手回复，导出为 Markdown。
- 新增 `docs/codex-conversations/markdown/README.md` 和 3 个线程 Markdown 文件，分别包含 227、112、62 条 user/assistant 消息。
- 转换时刻意跳过工具调用和终端输出，保留问答正文，便于课堂材料整理与人工阅读。

## 2026-05-10 / 开发过程截图 Word 汇总

- 新增 `scripts/build-dev-process-doc.py`，用于生成开发过程截图说明 Word。
- 生成 `output/doc/toeic-dev-process-screenshots.docx`，仅收录开发过程材料，不包含课堂展示 PPT 页面内容。
- Word 内容覆盖大模型对话日志摘录、spec-driven Gate 流程、设计文档、T01-T22 任务拆分、验收记录、AI 变更时间线、工程结构、终端验证摘要、产品运行与响应式截图。
- 大模型对话截图来源为 Codex 本地会话日志摘录，未伪造聊天 UI 截图；若课堂要求聊天窗口原图，可按 Word 第 1 节提示补拍替换。
- 验证结果：DOCX 可被 `python-docx` 打开，包含 25 张图片和 35 段文本；当前环境未检测到 LibreOffice / Poppler，未执行 DOCX 渲染成逐页 PNG 的视觉复核。

## 2026-05-10 / 课堂汇报 PPT 软基表达、GPT UML 与架构图增强

- 按用户要求去除 PPT 中“课程对齐 / 第几章 / 资源页证据”等显式对齐话术，改为在正文中自然体现需求建模、过程控制、对象抽象、接口边界、测试验收和工程反思。
- 删除原第 19 页“课堂现场演示路线”，新版 PPT 固定生成 19 页；预览目录会先清理旧 `slide-*.png`，避免残留旧第 20 页。
- 所有 UML 建模素材均改为 GPT 生图结果，并复制到 `output/presentation/assets/`：用例图、活动图、类图、时序图；脚本不再调用原先的程序化 UML 生成作为最终素材。
- 技术架构页改为 GPT 生成的贴合项目实际架构图，展示浏览器 UI、Next.js API Route、业务服务层、MaaS Client、MaaS 云服务、JSON 校验、Prisma ORM、SQLite 本地数据库与安全边界。
- spec-driven 与推进证据页增加真实文档片段截图素材，覆盖 `spec.md`、`design.md`、`tasks.md`、`acceptance.md`，用于证明开发流程和验收证据链。
- 总结反思页改为 6 个维度展开：方法收获、建模收获、工程收获、产品收获、不足反思、后续扩展。
- 重新生成 `output/presentation/toeic-practice-studio-final-report.pptx`、19 张预览图、`contact-sheet.png`、`speaker-notes.md` 和 `manifest.json`；未修改业务代码和项目运行依赖。

## 2026-05-10 / 课堂汇报 PPT 课程贴合与 UML 建模增强

- 通过课程资源页核对《软件工程基础》翻转课堂要求，确认课程章节覆盖软件过程、软件需求、面向对象分析与设计、软件系统设计、软件编码与实现、软件测试。
- 保持 PPT 页数为 20 页不变，增强 `output/presentation/src/build-report-deck.mjs`，将课程要求融入封面、目录、开发方法、用户流程、数据模型、AI 生成链路和讲稿备注。
- 新增并嵌入课程贴合素材：课程资源页截图、UML 用例图、UML 活动图、UML 类图、UML 时序图；四类 UML 图均由脚本生成到 `output/presentation/assets/`。
- 重新生成 `output/presentation/toeic-practice-studio-final-report.pptx`、20 张页面预览、`contact-sheet.png`、`speaker-notes.md` 和 `manifest.json`。
- 验证结果：PPTX 内部 slide XML 数量为 20；20 页均存在 transition/timing 节点；普通幻灯片无可见占位符残留；PPTX 内部 XML 未检出真实登录凭据、密钥模式或敏感请求头模式；预览图已抽查第 5、6、10、11 页，UML 图和课程截图未见拉伸变形或明显重叠。
- 本次未修改业务代码、未修改 `package.json` / `package-lock.json`，未新增项目运行依赖。

## 2026-05-10 / 课堂汇报 PPT 增强版

- 重写 `output/presentation/src/build-report-deck.mjs`，将课堂汇报 PPT 从 15 页升级为 20 页高信息量版本。
- 新版 PPT 覆盖学习痛点、产品目标、用户闭环、spec-driven coding、文档链路、T01-T22 推进证据、技术架构、数据模型、AI 生成链路、安全边界、听力/语法/错题/统计展示、UI 迭代、验收结果、课堂演示路线和总结反思。
- 修复截图横向拉伸问题：所有截图通过原始宽高与 `contain` / `cover` 规则等比例放置；长截图使用局部聚焦，不压扁整张图。
- 增加课堂展示视觉元素：原生形状卡通人物、对话气泡、流程节点、证据标签、文档卡片、任务矩阵、架构图、数据模型图和截图标注。
- 增加 PPTX XML 动画后处理：为 20 张幻灯片注入转场和 timing 节点；复杂对象动画仍需 PowerPoint 桌面版播放验证。
- 重新生成 `output/presentation/toeic-practice-studio-final-report.pptx`、`output/presentation/previews/slide-01.png` 至 `slide-20.png`、`output/presentation/previews/contact-sheet.png`、`output/presentation/speaker-notes.md` 和 `output/presentation/manifest.json`。
- 验证结果：PPTX 内部 slide XML 数量为 20；20 页均存在 transition/timing 节点；普通幻灯片无可见占位符残留；未检出真实密钥、Bearer、Authorization 或敏感环境文件名；预览图已抽查，截图未见拉伸变形。
- 本次未修改业务代码、未修改 `package.json`、未新增项目运行依赖。

## 2026-05-09 / 听力图片描述真实配图

- 为 `Question` 增加 `imageUrl` 和 `imagePrompt` 字段，并新增 Prisma 迁移 `20260509000000_add_question_images`。
- 新增 `lib/image-generation.ts`，使用服务端 `OPENAI_API_KEY` 调用 OpenAI Image API，默认 `OPENAI_IMAGE_MODEL=gpt-image-2`，返回 data URL。
- 强化听力 `picture-description` Prompt，要求返回 `imagePrompt`，并要求图片无文字、无商标、适合 TOEIC Part 1。
- 生成接口在 `picture-description` 题型中先生成题目 JSON，再逐题生成图片，图片生成失败时不保存半成品题目。
- 练习页在题目存在 `imageUrl` 时展示真实配图，并保持听力提交前隐藏英文选项正文。
- 更新 `.env.local.example` 和 `readme.md`，补充 OpenAI 图片生成所需环境变量。
- 执行 `npx prisma migrate deploy`、`npx prisma generate`、`npm run lint`、`npm run build` 均通过；缺少 OpenAI Key 的配置错误验证返回 `OPENAI_IMAGE_CONFIG_MISSING`。

## 2026-05-08

- 创建 `spec.md`，用于 TOEIC 练习网页的 spec-driven coding 开发前审核。
- 创建最小 `docs/project-context.md`，记录当前为空白规划项目、尚未启动开发。
- 未安装依赖，未创建业务代码，未启动开发服务器。

## 2026-05-08 Gate 1

- 按本地 API Key 的 spec-driven 流程重写 `spec.md` 为 Draft 审核稿。
- 明确 `spec.md -> design.md -> tasks.md -> implementation -> acceptance.md` 闸门。
- 明确本地后端读取 `MAAS_API_KEY`，前端不得直接持有 API Key。
- 明确听力练习答题前隐藏英文选项正文，提交后再显示。
- 同步更新 `docs/project-context.md`，仍未启动开发、未安装依赖、未创建业务代码。

## 2026-05-08 Gate 2

- 根据用户确认，将 `spec.md` 状态从 `Draft` 更新为 `Approved`。
- 新增 `design.md`，覆盖架构、页面、数据库、API、MaaS 调用、Prompt、错误处理和测试策略。
- 同步更新 `docs/project-context.md`，当前阶段为 Gate 2 设计审核中。
- 未生成 `tasks.md`，未初始化 Next.js，未安装依赖，未创建业务代码。

## 2026-05-08 Gate 3

- 根据用户“进入 Gate 3”的确认，将 `design.md` 状态从 `Draft` 更新为 `Approved`。
- 新增 `tasks.md`，将后续开发拆分为 T01 到 T15 的可验收任务。
- 同步更新 `spec.md` 和 `docs/project-context.md`，当前阶段为 Gate 3 任务审核中。
- 未初始化 Next.js，未安装依赖，未创建业务代码，未生成 `acceptance.md`。

## 2026-05-08 Gate 4 / T01

- 根据用户确认，将 `tasks.md` 状态从 `Draft` 更新为 `Approved`，项目进入 Gate 4。
- 创建 Next.js + TypeScript 最小项目骨架。
- 新增 `.gitignore`，确保 `.env.local` 不提交。
- 新增 `acceptance.md`，开始记录任务验收。
- 执行 `npm install` 完成依赖安装并生成锁文件。
- 执行 `npm run build` 通过生产构建。
- 启动本地 dev server，并验证 `http://127.0.0.1:3000` 返回 200。
- 补充 ESLint flat config，适配 ESLint 9。
- 当前只完成 T01，尚未接入 Tailwind、shadcn/ui、Prisma、SQLite 或 MaaS 业务代码。

## 2026-05-08 Gate 4 / T02

- 接入 Tailwind CSS v4 与 PostCSS 配置。
- 接入 shadcn/ui，生成 `components.json`、`lib/utils.ts` 和基础 UI 组件。
- 新增 Button、Card、Input、Select、Tabs、Badge、Alert、Dialog、Separator。
- 首页改为渲染 shadcn Button、Card、Badge 和 lucide 图标，用于验证 UI 基础设施。
- 执行 `npm run lint` 和 `npm run build` 均通过。
- 验证 `http://127.0.0.1:3000` 返回 200，并包含 T02 页面内容。
- 当前只完成 T02，尚未接入 Prisma、SQLite 或 MaaS 业务代码。

## 2026-05-08 Gate 4 / T03

- 安装并固定 Prisma 6.19.3 与 `@prisma/client` 6.19.3。
- 新增 Prisma SQLite schema，包含 `Question`、`PracticeRecord`、`Mistake`、`UserSetting`。
- 新增 `lib/prisma.ts`，复用开发环境 Prisma Client 实例。
- Prisma 7 与 Prisma 6 的 `migrate dev` 在当前环境返回空 schema engine 错误；已通过 `migrate diff` 等价 SQL、`prisma db execute`、`migrate resolve --applied` 和 `migrate deploy` 完成本地 SQLite baseline。
- SQLite 数据库位于 `C:\Users\ALGH\toeic-practice-studio\dev.db`，避免 Windows 中文项目路径影响 Prisma engine。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T04

- 新增 `components/app-shell.tsx`，提供全局标题、主导航和内容容器。
- 新增 `components/empty-state.tsx`，用于未实现页面的统一空状态。
- 更新首页为基础仪表盘壳，展示 0 值统计与核心入口。
- 更新听力、语法、错题、统计、设置页面为空状态壳。
- 执行 `npm run lint` 和 `npm run build` 均通过。
- 验证 `/`、`/listening`、`/grammar`、`/mistakes`、`/stats`、`/settings` 均返回 200。

## 2026-05-08 Gate 4 / T05

- 新增设置服务 `lib/settings-service.ts` 和常量 `lib/constants.ts`。
- 新增 `GET /api/settings`、`PATCH /api/settings`、`POST /api/settings/clear-data`。
- 设置页改为真实可操作界面，显示 API Key 是否已配置、MaaS Base URL、MaaS Model、默认难度、默认题量和听力语速。
- 新增 `.env.local.example`，只包含占位符，不包含真实 API Key。
- 验证设置读取、保存、清除数据均可用；API 不返回完整 API Key。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T06

- 新增 `lib/maas-client.ts`，封装 MaaS Chat Completions 调用。
- 新增 `prompts/generate-listening-question.ts` 和 `prompts/generate-grammar-question.ts`。
- 新增 `lib/question-validation.ts`，校验严格 JSON、A/B/C/D 选项、唯一答案、听力脚本和语法点。
- 新增 `lib/question-generation.ts`，组合 Prompt、MaaS 调用和题目校验。
- 新增 `lib/errors.ts`，统一可控错误类型。
- 使用 `npx tsx` 验证合法 JSON、Markdown 响应和缺字段响应的处理结果。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T07

- 新增 `POST /api/ai/generate-questions`。
- 实现练习类型、题型、难度、题量和标签请求校验。
- 生成接口调用 T06 的 MaaS 生成与题目校验服务。
- 合格题目写入 SQLite 的 `Question` 表。
- 缺少本地 `MAAS_API_KEY` 时返回 `MAAS_CONFIG_MISSING`，不向前端暴露 Key。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T08

- 新增 `lib/practice-service.ts`，实现答题判分和练习记录写入。
- 新增 `lib/mistake-service.ts`，实现错题创建、重复答错计数和状态回退。
- 新增 `POST /api/practice-records`。
- 使用本地测试题验证答对、答错、重复答错闭环。
- 验证完成后清除测试数据。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T09

- 新增 `components/practice-workspace.tsx`，实现生成题目、选择答案、提交答案和结果展示状态机。
- 听力页接入练习工作区。
- 听力答题前只显示 A/B/C/D 和隐藏提示，不展示英文选项正文。
- 听力页提供浏览器 Web Speech 播放与停止控制。
- 执行 `npm run lint` 和 `npm run build` 均通过。
- 验证 `/listening` 返回 200；真实 MaaS 题目生成需本地 `.env.local` 配置 API Key 后补测。

## 2026-05-08 Gate 4 / T10

- 语法页接入 `components/practice-workspace.tsx`。
- 语法页支持题型、难度、题量、标签和语法点输入。
- 执行 `npm run lint` 和 `npm run build` 均通过。
- 验证 `/grammar` 返回 200；真实 MaaS 题目生成需本地 `.env.local` 配置 API Key 后补测。

## 2026-05-08 Gate 4 / T11

- 新增 `GET /api/mistakes` 和 `PATCH /api/mistakes/:id`。
- 新增 `components/mistakes-panel.tsx`，提供错题列表、筛选、详情、标记掌握、移除和笔记入口。
- 错题页接入真实错题列表。
- 使用测试错题验证列表读取、标记掌握、移除和默认列表过滤。
- 验证完成后清除测试数据。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T12

- 新增 `lib/stats-service.ts`，从 `PracticeRecord` 和 `Mistake` 实时计算统计。
- 新增 `GET /api/stats`。
- 统计页接入真实统计数据，展示汇总指标、最近 7 天趋势和薄弱标签。
- 修复最近 7 天日期键使用 UTC 导致今天数据错位的问题，改为本机日期格式化。
- 使用测试记录验证统计结果，验证完成后清除测试数据。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T13

- 检查 API Key 边界：当前未创建 `.env.local`，`.env` / `.env.local` / `.env*.local` 均已忽略。
- 检查前端公开变量、浏览器存储、危险 HTML 渲染和日志调用。
- 确认 `MAAS_API_KEY` 只在服务端设置状态服务与 MaaS client 中读取。
- 执行 `npm run lint` 和 `npm run build` 均通过。

## 2026-05-08 Gate 4 / T14

- 执行 `npm run lint`、`npm run build`、`npx prisma migrate deploy`，均通过。
- 执行核心页面与 API HTTP smoke，均返回 200。
- 新增 `scripts/browser-smoke.mjs`，使用 Playwright + 本机 Edge 验证核心页面有可读内容。
- 安装开发期依赖 `playwright`，仅用于浏览器验收。

## 2026-05-08 Gate 5 / T15

- 更新 `acceptance.md`，汇总 T01-T15、MVP 验收项和剩余阻塞项。
- 标记 MaaS 真实生成验收为 `BLOCKED`，等待本机 `.env.local` 配置 API Key 后补测。

## 2026-05-08 Gate 5 / MaaS 补测

- 根据用户提供的本地 MaaS Key 配置 `.env.local`，保持 `.gitignore` 忽略规则不变。
- 在 MaaS 请求体中补充 `response_format: { type: "json_object" }`。
- 将 AI JSON 解析增强为仅兼容“完整响应为 JSON 代码块”的情况，剥离外层代码块后仍执行严格字段校验。
- 使用真实 MaaS 调用生成 1 道语法题和 1 道听力题，并写入 SQLite。
- 验证 `GET /api/settings` 只返回 `hasApiKey`，不返回完整 Key。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs`，均通过。
- 更新 `acceptance.md`，将听力/语法 MaaS 实题生成补测状态更新为 `PASS`。

## 2026-05-08 V1.1 / UI 打磨

- 按 spec-driven 流程补充 `spec.md`、`design.md`、`tasks.md` 的 V1.1 UI 打磨范围。
- 首页改为服务端读取 `getStats()`，展示真实今日练习、今日正确率、总练习和当前错题。
- 首页和统计页设置为动态渲染，避免 SQLite 统计在构建时被固化。
- 优化首页入口层级，加入听力、语法、错题本和统计的快捷入口。
- 优化全局导航壳，增加 sticky header 和当前导航的轻量高亮。
- 优化练习工作区，增加队列 / 已提交 / 难度状态、题型摘要、选项选中态和提交后的正确 / 错误反馈。
- 保持听力答题前隐藏英文选项正文、API Key 服务端读取和 MaaS / 答题 API 不变。
- 执行 `npm run lint`、`npm run build`、`npx prisma migrate deploy`、`node scripts/browser-smoke.mjs`，均通过。

## 2026-05-08 V1.2 / 丰富动效与活力重设计

- 按 spec-driven 流程补充 `spec.md`、`design.md`、`tasks.md` 的 V1.2 动效和视觉范围。
- 新增 `motion` 依赖，创建 `components/motion-ui.tsx`，提供页面进入、stagger、hover / tap 动效容器。
- 新增 `components/cartoon-sticker.tsx`，用代码原生 TSX / CSS 实现首页和练习页贴纸式卡通视觉。
- 首页接入 Motion 页面进入、统计卡片 stagger、快捷入口 hover / tap 动效。
- 听力页和语法页接入题目切换、选项反馈、结果反馈动效。
- `app/globals.css` 增加全局动态网格背景、听力声波背景、语法漂浮词块背景，并支持 `prefers-reduced-motion` 降级。
- 清理旧原型遗留的全局 `h1/h2/p` 样式，避免覆盖 Tailwind 页面字号。
- 保持 MaaS、SQLite、答题记录、错题和统计 API 不变。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs`，均通过。
- 使用 Playwright 截图检查首页、听力页、语法页，截图保存到 `output/playwright/`。

## 2026-05-08 V1.3 / 练习流程体验完善

- 按 spec-driven 流程补充 `spec.md`、`design.md`、`tasks.md` 的 V1.3 练习流程体验范围。
- 在 `components/practice-workspace.tsx` 中新增生成中状态面板，避免生成请求期间仍显示普通等待状态。
- 新增练习进度条，展示已提交题数、总题数和完成百分比。
- 新增最后一题完成面板，提供“再来一组”“查看错题”“学习统计”入口。
- 使用 Playwright 拦截本地 API 验证听力题提交前隐藏英文选项、提交后显示英文选项和完成面板。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs`，均通过。

## 2026-05-08 V1.4 / 视觉对齐与响应式巡检

- 按 spec-driven 流程补充 `spec.md`、`design.md`、`tasks.md` 的 V1.4 视觉对齐和响应式巡检范围。
- 新增 `components/metric-card.tsx`，统一指标卡片的标题、数字、单位和基线对齐。
- 首页统计区改用 `MetricCard`，修复数字与单位错位问题。
- 统计页汇总区改用同一 `MetricCard`，避免同类排版问题复现。
- 移动端顶部导航从横向滚动改为自动换行，消除移动端可见元素溢出候选。
- 使用 Playwright 生成首页、统计页、听力页、语法页的桌面和移动端截图，并执行 bounding box 巡检；核心页面均无文本溢出候选。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs`，均通过。

## 2026-05-08 / 启动文档

- 新增根目录 `readme.md`，记录本机启动、MaaS 环境变量、Prisma / SQLite、常用验证命令和生产模式本地预览方法。
- 在启动文档中补充 API Key 安全注意事项，明确真实 Key 不写入源码、文档、Git 或前端公开环境变量。
- 补充缺少 `MAAS_API_KEY`、数据库命令失败、页面样式或动效异常时的排查步骤。

## 2026-05-09 / MaaS 全题型生成验收

- 启动本地 dev server，验证 `GET /api/settings` 返回 `hasApiKey: true`，未回显完整 API Key。
- 通过 `POST /api/ai/generate-questions` 对前端 9 个子题型各生成 1 道题。
- 听力 4 个子题型均返回 200、字段校验通过，并写入 SQLite：`picture-description`、`question-response`、`short-conversation`、`short-talk`。
- 语法 5 个子题型均返回 200、基础字段校验通过，并写入 SQLite：`sentence-completion`、`part-of-speech`、`tense-voice`、`preposition-conjunction`、`business-context`。
- 发现模型对子题型遵循不稳定：`tense-voice` 和 `business-context` 请求返回的 `subtype` 被模型写成 `sentence-completion`，后续应收紧后端校验或在保存时以请求子题型覆盖模型子题型。

## 2026-05-09 / 生成链路子题型约束完善

- 在题目校验中增加请求子题型一致性检查，模型返回的 `subtype` 必须等于请求的 `subtype`。
- MaaS 生成遇到 `subtype` 不一致时最多自动重试 1 次，连续不一致则返回明确错误。
- 强化听力和语法 Prompt，要求 `subtype` 与 `difficulty` 原样返回，并让示例 JSON 使用当前请求值。
- 新增 `scripts/generation-smoke.mjs` 和 `npm run smoke:generation`，一键验证 9 个前端子题型的真实生成、字段完整性、子题型一致性和落库 ID。
- 执行 `npm run lint`、`npm run smoke:generation`、`npm run build` 均通过；复测 9 个子题型全部 PASS。

## 2026-05-09 / V1.5 题目查询与错题重新练习

- 在 `spec.md`、`design.md`、`tasks.md` 中追加 V1.5 / T20 文档闭环。
- 新增 `GET /api/questions`，支持 `type`、`subtype`、`difficulty`、`tag`、`limit` 查询已生成题目。
- 错题本卡片新增“重新练习”入口，可在卡片内选择 A/B/C/D 并复用 `POST /api/practice-records` 提交。
- 重新练习提交后显示正确 / 错误结果，并刷新错题列表；重复答错沿用 `wrongCount+1` 和 `reviewing` 状态规则。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs`、`npm run smoke:generation` 均通过。

## 2026-05-09 / V1.6 首页 Hero 今日计划卡片

- 在 `spec.md`、`design.md`、`tasks.md` 中追加 V1.6 / T21 文档闭环。
- 修复首页 Hero 中“开始听力”按钮深色背景下文字不清的问题，改为深绿色背景与白色文字。
- 在首页 Hero 左侧按钮下方新增“今日智能练习计划”卡片，包含三项任务、预计用时、弱项标签和“开始今日计划”入口。
- 卡片采用浅绿色到浅米色渐变、浅边框、轻阴影和淡线性耳机图标，保持右侧插画布局不变。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs` 均通过，并生成首页桌面 / 移动端截图到 `output/playwright/`。

## 2026-05-09 / V1.7 学习统计卡通仪表盘

- 在 `spec.md`、`design.md`、`tasks.md` 中追加 V1.7 / T22 文档闭环。
- 新增 `recharts` 依赖，用于最近 7 天双折线 / 面积图。
- 将 `/stats` 页面主体拆为 `components/stats-dashboard.tsx`，包含 `StatsHero`、`StatCard`、`WeeklyTrendCard`、`WeakTagsCard`。
- 学习统计 Hero 改为浅绿色 / 奶油色卡通报告区，保留原标题、副标题和 Gate badge。
- 7 个统计项改为轻卡通数据卡片，正确率卡片增加环形进度。
- 薄弱标签改为有权重层级的胶囊标签，并增加小型便利贴插画。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs` 均通过，并生成统计页桌面 / 移动端截图到 `output/playwright/`。

## 2026-05-09 / 统计页薄弱标签图标对齐修复

- 修复 `WeakTagsMascot` 内书本图标与白色便签背景错位的问题。
- 将插画容器改为居中布局，书本图标与背景同心对齐，星星固定在右上角。
- 执行 `npm run lint`、`npm run build` 均通过，并生成 `output/playwright/v1-7-stats-icon-fix-desktop.png` 复核截图。

## 2026-05-09 / 统计页折线图颜色区分修复

- 将最近 7 天图表的“正确题数”从蓝绿色调整为暖橙色，和“练习题数”的绿色形成更明显区分。
- 同步调整顶部图例胶囊和面积填充颜色。
- 执行 `npm run lint`、`npm run build` 均通过，并生成 `output/playwright/v1-7-stats-chart-color-fix-desktop.png` 复核截图。

## 2026-05-09 / 本机后端公网访问说明

- 新增 `npm run dev:public` 和 `npm run start:public`，用于让 Next.js 监听 `0.0.0.0:3000`。
- 更新 `readme.md`，补充本机运行时通过 Cloudflare Quick Tunnel 临时公网访问的方法。
- 更新 `readme.md`，补充固定域名 Cloudflare Tunnel 配置、运行方式、排查步骤和安全注意事项。
- 修正 `.env.local.example`，将真实 MaaS Key 替换回占位符，避免示例文件泄露密钥。
- 执行 `npm run lint`、`npm run build` 均通过。

## 2026-05-09 / Cloudflare Quick Tunnel 启动脚本

- 新增 `scripts/public-tunnel.ps1`，自动定位 `cloudflared.exe`、检查本地 `127.0.0.1:3000` 服务，并使用 IPv4 + HTTP/2 启动 Quick Tunnel。
- 脚本支持 `-CheckOnly`，可只验证 `cloudflared` 与本地服务可用性，不启动长驻公网隧道。
- 脚本会从 `cloudflared` 日志中提取 `https://*.trycloudflare.com`，并用中文高亮输出“公网访问地址”。
- 修复 Windows PowerShell 将 `cloudflared` 的 stderr 日志当作 `NativeCommandError` 中断脚本的问题。
- 新增 `npm run tunnel:quick`，降低 Windows PATH 未刷新、手动命令换行和临时握手失败带来的启动误判。
- 更新 `readme.md`，将临时公网访问流程改为优先使用 `npm run tunnel:quick`，并补充 `Unauthorized: Tunnel not found`、`status_code=500` 等常见日志说明。
- 真实验收 Cloudflare Quick Tunnel：成功获取临时 `trycloudflare.com` 地址，并通过公网地址访问首页返回 200；验收后已停止临时隧道进程。

## 2026-05-09 / 公网页面只显示背景修复

- 修复 `components/motion-ui.tsx` 中页面进入动画在服务端 HTML 阶段输出 `opacity:0` 的问题。
- 将 `MotionPage` 和 `MotionStagger` 的 `initial` 改为 `false`，确保公网端 JS chunk 暂时未加载时仍能显示完整静态页面内容。
- 执行 `npm run lint`、`npm run build`、`node scripts/browser-smoke.mjs` 均通过。
- 执行 `npm run tunnel:quick -- -CheckOnly`，确认本地服务与 `cloudflared` 检查通过。

## 2026-05-09 / Tunnel 脚本中文乱码修复

- 在 `scripts/public-tunnel.ps1` 启动时设置控制台输入 / 输出编码为 UTF-8，并在 Windows 下切换代码页到 `65001`。
- 将脚本内直接输出的中文提示改为 Unicode 码点拼接，避免 Windows PowerShell 5 读取 UTF-8 无 BOM 脚本时出现中文乱码。
- 将 `npm run tunnel:quick` 增加 `-NoProfile`，减少用户 PowerShell 配置文件对编码设置的影响。
- 执行 `npm run tunnel:quick -- -CheckOnly` 和 `npm run lint` 均通过；单独验证中文提示可正确显示。

## 2026-05-09 / 公网完整功能验收与点击修复

- 新增 `scripts/public-acceptance.mjs` 和 `npm run smoke:public`，用于对公网 URL 进行 Playwright 验收。
- 验收覆盖桌面 / 移动端 6 个页面可见控件 trial click、顶部导航、首页入口、语法生成与答题、听力生成与播放 / 停止 / 答题、错题筛选与复练、设置刷新 / 保存 / 恢复、清除数据弹窗和统计 API / 图表 / 薄弱标签。
- 将顶层页面导航与入口链接改为普通 `<a href>`，避免 Cloudflare Quick Tunnel 下 Next 客户端 RSC 导航偶发 502 导致点击后页面不完整。
- 修复 `scripts/public-tunnel.ps1` 误把 `https://api.trycloudflare.com` 当作公网访问地址输出的问题。
- 执行 `npm run lint`、`npm run build` 均通过。
- 使用公网地址 `https://sent-murray-doctor-san.trycloudflare.com` 执行 `npm run smoke:public`，结果为 41 PASS、0 FAIL。

## 2026-05-09 / start:public 端口占用提示修复

- 新增 `scripts/start-public.ps1`，在启动公网服务前检查 `3000` 端口。
- 若 `3000` 已经由本项目 `next start` 占用，`npm run start:public` 会提示服务已在运行并正常退出，避免 `EADDRINUSE` 被误认为启动失败。
- 若 `3000` 被其他进程占用，会输出占用进程 PID 和命令行，方便处理。
- 将 `package.json` 中的 `start:public` 改为调用 `scripts/start-public.ps1`。
- 执行 `npm run start:public`、`npm run lint` 和 `GET /api/settings` 检查均通过。
## 2026-05-10 / 课堂汇报 PPT 产出

- 安装补充设计技能 `figma-create-new-file` 到 `C:\Users\ALGH\.codex\skills\figma-create-new-file`，未写入项目依赖。
- 新增 `output/presentation/src/build-report-deck.mjs`，使用本地演示文稿运行时依赖生成课堂汇报材料。
- 生成 15 页课堂精美型汇报 PPT：`output/presentation/toeic-practice-studio-final-report.pptx`。
- 生成 15 张逐页 PNG 预览与总览图：`output/presentation/previews/`。
- 生成讲稿备注：`output/presentation/speaker-notes.md`。
- PPT 内容覆盖开发背景、spec-driven coding 流程、技术架构、AI 生成链路、听力/语法/错题/统计成果、UI 迭代、验收安全和课堂演示路线。
- QA：确认 PPTX 内含 15 个 slide XML；预览图共 15 页；普通幻灯片中未发现可见 `Slide Number` / `sldNum` 占位符；敏感字段搜索未命中真实 Key、Authorization 或 Bearer。
- 说明：未修改业务代码，未修改 `package.json`，未新增运行时依赖；PPTX 未通过 PowerPoint/Keynote 桌面程序做人工打开验收。

## 2026-05-14 / 两人分工演讲稿

- 基于 `output/presentation/toeic-practice-studio-final-report-slides6-8-redesign.pptx`、`output/presentation/speaker-notes.md`、`spec.md`、`design.md`、`acceptance.md` 和 `readme.md` 生成两人分工版课堂演讲稿。
- 新增 `output/presentation/two-person-speech-script.md`，按第 1-9 页和第 10-19 页拆分讲者 A / 讲者 B。
- 内容覆盖项目背景、学习痛点、spec-driven 流程、技术架构、数据模型、AI 生成链路、听力/语法/错题/统计成果、验收结果和总结反思。
- 本次仅新增汇报文稿和变更记录，未修改业务代码，未新增依赖。
- 后续补充 spec-driven 开发总结、收获与个人体会，强调边界意识、任务拆分、验收证据和 AI 辅助开发中的规格约束价值。
