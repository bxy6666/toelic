# TOEIC Practice Studio Spec

状态：Approved  
阶段：V2.1 implemented / documentation maintained  
最后更新：2026-06-24  
开发原则：严格执行 `spec.md -> design.md -> tasks.md -> implementation -> acceptance.md`

当前最新版说明：前文中关于“第一版本机个人使用、不做登录”的描述保留为 MVP / V1.x 历史边界；自 V2 起，项目已加入登录、注册、Session Cookie、公网访问保护和用户数据隔离。当前最终功能边界以第 14 节 V1.8 / V2 / V2.1 工程与公网安全增强规格为准。

## 0. Spec-Driven 流程

本项目不完全照搬华为云博客示例，只借鉴其规范驱动开发流程。任何开发动作必须按以下闸门推进：

1. Gate 1：完善并审核 `spec.md`
2. Gate 2：在 `spec.md` 审核通过后生成 `design.md`
3. Gate 3：在 `design.md` 审核通过后生成 `tasks.md`
4. Gate 4：按 `tasks.md` 小步实现，不临时扩范围
5. Gate 5：生成或更新 `acceptance.md`，记录验收结果

当前 `spec.md`、`design.md` 和 `tasks.md` 已由用户确认通过，允许进入 Gate 4 并按 `tasks.md` 顺序逐项实现。开发期间必须持续更新 `acceptance.md`，不得临时扩展第一版范围。

后续任何新需求必须先更新 `spec.md`，再同步更新 `design.md` / `tasks.md`，最后才改代码。

## 1. 项目概述

### 1.1 应用名称

暂定名：TOEIC Practice Studio（托业练习助手）。

### 1.2 目标用户

- 正在备考 TOEIC 的中文用户
- 听力和语法较弱、需要高频练习的自学用户
- 希望用 AI 生成托业风格练习题的个人学习者

第一版只面向本机个人使用，不做机构、教师端、班级、多用户协作。

### 1.3 核心价值

- 使用华为云 MaaS 生成原创托业风格题目
- 打通听力练习、语法练习、错题本、学习统计的闭环
- 使用本地后端读取 API Key，避免浏览器端暴露密钥
- 通过可审核文档控制开发范围，便于用户逐项验收

### 1.4 技术方向

第一版技术方向固定为：

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- SQLite
- 本机运行

### 1.5 产品边界

第一版包含：

- 首页 / 仪表盘
- 听力练习
- 语法练习
- AI 题目生成
- 错题本
- 学习统计
- 设置页
- 本地 SQLite 数据持久化

第一版不包含：

- 登录 / 注册
- 多端同步
- 云部署
- 付费系统
- 班级 / 教师端
- 官方真题导入
- 原生 App / 小程序
- 云端 TTS

题目必须是 AI 生成的原创托业风格内容，不使用或声称使用官方真题。

## 2. 功能需求

### 2.1 首页 / 仪表盘

首页用于让用户快速进入学习状态。

必须展示：

- 今日练习题数
- 今日正确率
- 总练习题数
- 当前错题数
- 听力练习入口
- 语法练习入口
- 错题本入口
- 学习统计入口
- 设置入口

验收标准：

- 用户打开首页后，无需登录即可看到学习概览
- 无数据时显示空状态，而不是报错或空白
- 每个入口能跳转到对应页面

### 2.2 听力练习

目标：模拟 TOEIC 听力练习，让用户通过听音频选择答案。

第一版支持题型：

- 图片描述风格题：AI 生成场景描述，不生成真实图片
- 问答题风格题
- 简短对话题
- 简短讲话题

练习流程：

1. 用户选择题型、难度、题量
2. 前端请求本地后端 `/api/ai/generate-questions`
3. 后端调用 MaaS 生成题目并写入 SQLite
4. 前端展示题号和 A/B/C/D 选项按钮
5. 答题前隐藏英文选项正文
6. 浏览器 Web Speech API 播放听力文本和选项内容
7. 用户选择答案
8. 提交后显示英文选项、正确答案、中文解析
9. 保存练习记录
10. 答错时自动写入或更新错题本

听力硬性规则：

- 答题前不得直接展示英文选项正文
- 答题前只能展示选项标识，例如 A / B / C / D
- 选项英文内容必须通过语音播报
- 提交答案后才显示所有选项文本
- DeepSeek-V3.2 只生成文本，音频由浏览器朗读完成

验收标准：

- 可生成至少 3 道听力题
- 可播放听力文本
- 答题前看不到英文选项正文
- 提交后能看到用户答案、正确答案、全部选项文本和中文解析
- 答错题目进入错题本

### 2.3 语法练习

目标：练习 TOEIC Reading 中常见语法点。

第一版支持：

- 单句填空题
- 词性选择题
- 时态 / 语态题
- 介词 / 连词 / 关系词题
- 商务邮件或公告语境题

练习流程：

1. 用户选择语法点、难度、题量
2. 前端请求本地后端生成题目
3. 用户选择答案
4. 提交后显示正确答案、中文解析、语法点说明
5. 保存练习记录
6. 答错时自动写入或更新错题本

验收标准：

- 可生成至少 5 道语法题
- 每题有唯一正确答案
- 每题有中文解析
- 答题结果保存到 SQLite
- 错题自动进入错题本

### 2.4 AI 题目生成

目标：通过华为云 MaaS 生成结构化题目。

MaaS 配置固定为：

- `MAAS_BASE_URL=https://api.modelarts-maas.com/v1/`
- `MAAS_MODEL=deepseek-v3.2`
- `MAAS_API_KEY` 由用户写入 `.env.local`

调用安全规则：

- 前端只调用本地 Next.js API Route
- 前端不得直接请求华为云 MaaS
- `MAAS_API_KEY` 只允许服务端读取
- API Key 不得写入源码、文档正文、Git、localStorage、sessionStorage、浏览器可见环境变量
- 日志不得输出 API Key、Authorization 请求头、完整敏感响应

本地后端接口：

`POST /api/ai/generate-questions`

请求字段：

- `practiceType`: `listening` 或 `grammar`
- `subtype`: 题型
- `difficulty`: `easy` / `medium` / `hard`
- `count`: 1 到 10
- `tags`: 字符串数组，可为空
- `grammarPoint`: 语法题可选

响应字段：

- `questions`: 结构化题目数组
- `source`: `maas` 或 `mock`
- `message`: 可选提示信息

当缺少 `MAAS_API_KEY` 时：

- 不调用 MaaS
- 返回可读错误
- 前端提示用户到 `.env.local` 配置 API Key

模型输出要求：

- 返回严格 JSON
- 不使用 Markdown 代码块包裹
- 每题包含题干、选项、答案、中文解析、标签
- 每题只有一个正确答案
- 听力题包含 `listeningScript`
- 语法题包含 `grammarPoint`

验收标准：

- MaaS 正常时可生成并保存题目
- MaaS 返回非 JSON 时不落库
- 答案不在选项中时不落库
- 生成失败时前端显示明确错误

### 2.5 错题本

错题来源：

- 听力练习答错
- 语法练习答错
- 用户后续可手动收藏，第一版可不做手动收藏

错题状态：

- `new`
- `reviewing`
- `mastered`

功能要求：

- 查看错题列表
- 按题型筛选
- 按标签 / 语法点筛选
- 查看原题、用户答案、正确答案、解析
- 重新练习
- 标记已掌握
- 从错题本移除

重复答错规则：

- 同一道题重复答错时，不创建重复错题
- 更新 `wrongCount`
- 更新 `lastWrongAt`
- 状态改回 `reviewing`

验收标准：

- 答错后错题本出现记录
- 重复答错增加错误次数
- 标记掌握后状态变为 `mastered`
- 移除后不再出现在默认错题列表

### 2.6 学习统计

统计从练习记录和错题记录计算，第一版不做复杂冗余缓存。

必须展示：

- 今日练习题数
- 总练习题数
- 总正确率
- 听力正确率
- 语法正确率
- 当前错题数
- 已掌握错题数
- 最近 7 天练习趋势
- 高频错误标签 / 语法点

验收标准：

- 完成练习后统计立即反映变化
- 答错后错题数变化
- 标记掌握后已掌握数量变化
- 无数据时显示 0 和空状态

### 2.7 设置

设置页用于查看本地配置状态和管理学习偏好。

必须展示：

- API Key 是否已配置
- MaaS Base URL
- MaaS Model
- 默认难度
- 默认题量
- 听力语速
- 清除本地学习数据入口

禁止展示：

- 完整 API Key
- Authorization 请求头

验收标准：

- API Key 未配置时显示“未配置”
- API Key 已配置时只显示“已配置”
- 清除数据需要二次确认
- 清除后题目、记录、错题、统计归零

## 3. 非功能需求

### 3.1 性能

- 首页首次可交互目标小于 3 秒
- 单次 AI 生成限制 1 到 10 题
- AI 生成期间必须显示加载状态
- 本地 SQLite 数据量 5000 条以内应保持流畅

### 3.2 安全

- API Key 永不进入前端代码和浏览器存储
- `.env.local` 必须加入 `.gitignore`
- 后端接口限制请求体大小和字段
- 后端校验 MaaS 响应结构
- 前端展示用户输入或模型文本时避免 XSS

### 3.3 隐私

- 不采集姓名、手机号、身份证等个人信息
- 学习数据默认保存在本机 SQLite
- 不上传学习记录到第三方
- 调用 MaaS 时只发送生成题目所需上下文

### 3.4 兼容性

第一版支持：

- Chrome 最新稳定版
- Edge 最新稳定版
- 桌面端优先
- 移动端基础响应式

### 3.5 可维护性

- Prompt 模板独立维护
- MaaS 调用封装独立维护
- 数据库访问通过 Prisma
- 统计逻辑集中实现
- 不做过度抽象和无关重构

## 4. 数据需求

### 4.1 Question

保存字段：

- `id`
- `type`: `listening` / `grammar`
- `subtype`
- `difficulty`
- `prompt`
- `optionsJson`
- `answer`
- `explanationZh`
- `tagsJson`
- `listeningScript`
- `grammarPoint`
- `source`
- `createdAt`

### 4.2 PracticeRecord

保存字段：

- `id`
- `questionId`
- `practiceType`
- `userAnswer`
- `isCorrect`
- `timeSpentSeconds`
- `practicedAt`

### 4.3 Mistake

保存字段：

- `id`
- `questionId`
- `wrongCount`
- `lastWrongAt`
- `status`
- `note`
- `masteredAt`

### 4.4 UserSetting

保存字段：

- `id`
- `defaultDifficulty`
- `defaultQuestionCount`
- `speechRate`
- `createdAt`
- `updatedAt`

### 4.5 不保存的数据

- 不保存 API Key 到数据库
- 不保存用户登录身份
- 不保存支付信息
- 不保存官方真题来源声明

## 5. 接口需求

### 5.1 AI 生成接口

`POST /api/ai/generate-questions`

用途：生成题目并写入 SQLite。

失败情况：

- `MAAS_CONFIG_MISSING`
- `AI_GENERATION_FAILED`
- `AI_RESPONSE_INVALID`
- `QUESTION_VALIDATION_FAILED`

### 5.2 答题记录接口

`POST /api/practice-records`

用途：

- 保存用户答案
- 判断正误
- 更新错题本

### 5.3 题目查询接口

`GET /api/questions`

支持查询参数：

- `type`
- `subtype`
- `difficulty`
- `tag`

### 5.4 错题接口

- `GET /api/mistakes`
- `PATCH /api/mistakes/:id`

用途：

- 查询错题
- 标记掌握
- 移除错题
- 更新笔记

### 5.5 统计接口

`GET /api/stats`

返回：

- 首页统计
- 总体正确率
- 分类正确率
- 最近 7 天趋势
- 高频错误标签

### 5.6 设置接口

- `GET /api/settings`
- `PATCH /api/settings`
- `POST /api/settings/clear-data`

用途：

- 读取配置状态
- 更新学习偏好
- 清除本地学习数据

## 6. 验收标准

### 6.1 文档验收

`spec.md` 必须满足：

- 包含项目概述
- 包含功能需求
- 包含非功能需求
- 包含数据需求
- 包含接口需求
- 包含验收标准
- 明确本地 API Key 安全边界
- 明确听力隐藏选项规则
- 明确 spec-driven 闸门

### 6.2 开发前验收

进入 `design.md` 前必须满足：

- 用户确认 `spec.md` 质量 OK
- `spec.md` 状态从 `Draft` 改为 `Approved`
- 不存在未确认的高影响需求分歧

进入代码开发前必须满足：

- 用户确认 `design.md` 质量 OK
- 用户确认 `tasks.md` 可执行
- `.env.local` 由用户本地配置 API Key

### 6.3 功能验收

MVP 完成必须满足：

- 首页可访问并展示统计
- 听力题可生成、可语音播放、答题前隐藏选项正文
- 语法题可生成、可答题、可查看解析
- 练习记录写入 SQLite
- 错题自动创建或更新
- 错题可标记掌握
- 统计与记录一致
- 设置页不泄露 API Key

### 6.4 安全验收

必须满足：

- API Key 不在前端源码中
- API Key 不在浏览器网络公开参数中
- API Key 不在 localStorage / sessionStorage 中
- API Key 不在日志中
- `.env.local` 不提交

### 6.5 工程验收

必须满足：

- `npm run lint` 通过
- `npm run build` 通过
- Prisma migration 成功
- Chrome / Edge 主流程可用

### 6.6 验收记录

开发阶段必须维护 `acceptance.md`。

每项验收记录格式：

- 验收项
- 状态：`PASS` / `FAIL` / `BLOCKED` / `SKIP`
- 验证方式
- 备注

## 7. V1.1 UI 打磨补充规格

状态：Approved  
触发来源：用户要求在已完成 MVP 后继续优化 UI，使界面更有设计感并略微增加活力。

### 7.1 范围

本轮只做本机个人版的界面表现与验收补强，不新增登录、云部署、多端同步、支付或新的业务模块。

### 7.2 功能补充

- 首页必须展示真实学习统计，而不是固定占位数据。
- 首页必须提供清晰的下一步入口：听力练习、语法练习、错题本、学习统计。
- 听力 / 语法练习页必须更清晰地展示生成状态、当前题号、难度、题型和答题结果。
- 听力答题前隐藏英文选项正文的规则必须保持不变。

### 7.3 UI 质量要求

- 采用安静、可读、适合长期学习的产品界面风格。
- 允许使用少量青绿色 / 暖色点缀，但不得变成大面积单色主题。
- 不引入新的 UI 依赖，不重做整站结构。
- 保持 shadcn/ui + Tailwind 现有体系。

### 7.4 V1.1 验收标准

- 首页统计来自 SQLite 练习记录与错题记录。
- 练习工作区在生成前、生成中、答题中、提交后都有清晰状态。
- UI 改动不破坏 MaaS 生成、答题记录、错题和统计逻辑。
- `npm run lint` 通过。
- `npm run build` 通过。
- Edge / Chrome smoke 验证核心页面可访问。

## 8. V1.2 丰富动效与活力重设计补充规格

状态：Approved  
触发来源：用户确认采用“丰富动效”路线，要求页面重新设计、增加活力、背景动画和卡通风格视觉。

### 8.1 范围

本轮只重设计首页、听力页、语法页的视觉与动效，不改变 MaaS、SQLite、答题记录、错题本和统计 API。

### 8.2 动效需求

- 引入 `motion` 作为 React 动画库。
- 首页需要页面进入动画、统计卡片 stagger 出场、入口卡片 hover / tap 反馈。
- 听力 / 语法页需要页面进入动画、题目切换动效、答案正确 / 错误反馈动画。
- 按钮和可点击卡片需要轻量 hover / tap 反馈。
- 背景需要 CSS/Tailwind 动画，并支持 `prefers-reduced-motion`。

### 8.3 视觉需求

- 整体更有活力，但仍保持学习工具的清爽、可读和可维护。
- 背景允许使用轻微移动网格、声波、漂浮词块等轻量视觉元素。
- 保留 lucide 作为功能图标。
- 首页、练习页空状态和完成状态加入代码原生卡通贴纸式视觉，不批量替换所有功能图标。

### 8.4 验收标准

- `motion` 依赖已安装并用于核心页面动效。
- 首页、听力页、语法页视觉明显更活泼，但正文不被背景遮挡。
- `prefers-reduced-motion` 下背景和装饰动画降级。
- 听力答题前隐藏英文选项正文的规则不变。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器 smoke 验证核心页面可访问。

## 9. V1.3 练习流程体验补充规格

状态：Approved  
触发来源：用户要求继续完善，当前优先补齐练习主流程的生成中、进度和完成状态。

### 9.1 范围

本轮只完善听力 / 语法练习页的前端流程体验，不改变 MaaS、SQLite、错题、统计或设置 API。

### 9.2 功能补充

- 生成题目时必须显示明确的生成中状态。
- 生成题目后必须显示练习进度条和当前完成比例。
- 最后一题提交后必须显示完成面板。
- 完成面板必须提供继续练习、查看错题本、查看学习统计的入口。
- 听力答题前隐藏英文选项正文的规则必须保持不变。

### 9.3 验收标准

- 生成中状态、进度条、最后完成面板可在听力 / 语法页展示。
- 完成面板不影响答题记录和错题逻辑。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器 smoke 验证核心页面可访问。

## 10. V1.4 视觉对齐与响应式巡检补充规格

状态：Approved  
触发来源：用户指出首页统计卡片中数字与单位出现错位，要求检查类似情况并继续完善网页版。

### 10.1 范围

本轮只修复和统一首页、统计页中指标卡片的排版对齐，并做浏览器截图巡检。不改变业务 API、数据库、MaaS 生成和练习逻辑。

### 10.2 UI 修复要求

- 数字与单位必须使用统一基线，不得通过 `padding-bottom` 之类的手工偏移对齐。
- 指标卡片高度、标题、数值、单位位置应在桌面和移动端保持一致。
- 首页和统计页必须复用同一指标卡片组件，减少类似错位再次出现。
- 页面背景动画不得遮挡指标文字。

### 10.3 验收标准

- 首页截图中“今日练习 / 今日正确率 / 总练习 / 当前错题”卡片无明显错位。
- 统计页指标卡片无明显错位。
- 桌面和移动端核心页面截图可读。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器 smoke 验证核心页面可访问。

## 11. V1.5 题目查询与错题重新练习补充规格

状态：Approved  
触发来源：用户要求按 spec-driven 开发补齐已规划但未完整实现的功能。

### 11.1 范围

本轮只补齐题目查询接口和错题本内重新练习闭环，不新增登录、云部署、分页 UI 或新的数据库表。

### 11.2 功能补充

- 提供 `GET /api/questions` 查询已生成题目。
- 查询接口支持 `type`、`subtype`、`difficulty`、`tag`、`limit` 参数。
- 错题本每条错题提供“重新练习”入口。
- 用户可在错题卡片内重新选择 A/B/C/D 并提交。
- 重新练习复用现有答题记录接口，答错时沿用现有错题更新规则。

### 11.3 验收标准

- `GET /api/questions` 无参数可返回最近题目。
- `type`、`difficulty` 和 `tag` 筛选可用，非法枚举返回可读错误。
- 错题卡片内可完成重新练习并显示结果。
- 再次答错会更新错题错误次数和状态。
- 已掌握、移除、笔记功能不受影响。
- `npm run lint` 通过。
- `npm run build` 通过。

## 12. V1.6 首页 Hero 今日计划卡片补充规格

状态：Approved  
触发来源：用户指出首页 Hero 左侧按钮下方留白过大，且“开始听力”按钮黑底文字不清。

### 12.1 范围

本轮只优化首页 Hero 区域的左侧视觉重心和主要 CTA 可读性，不改变右侧状态卡片、MaaS、错题、统计或练习业务逻辑。

### 12.2 UI 补充

- 在“开始听力 / 开始语法”按钮下方新增“今日智能练习计划”卡片。
- 卡片包含轻量练习说明、三个任务、预计用时、弱项标签和“开始今日计划”入口。
- 卡片采用浅绿色到浅米色柔和渐变、浅边框、轻阴影和卡通式小图标。
- 修复“开始听力”按钮文字对比度，确保深色按钮上文字清晰可读。

### 12.3 验收标准

- 首页桌面端 Hero 左侧留白被今日计划卡片合理填补。
- “开始听力”按钮文字为高对比可读状态。
- 今日计划卡片桌面宽度约 640px，桌面高度不超过约 190px。
- 移动端卡片位于标题和按钮下方，独占一行，不影响右侧状态布局。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器截图验证首页桌面和移动端可读。

## 13. V1.7 学习统计卡通仪表盘补充规格

状态：Approved  
触发来源：用户要求直接重构“学习统计”页面主体 UI，保持顶部导航不变。

### 13.1 范围

本轮只优化 `/stats` 页面主体内容区域，不修改顶部导航栏、路由、数据读取业务逻辑或统计口径。

### 13.2 UI 补充

- 顶部标题区改为浅色 Hero，包含 badge、标题、副标题和轻量卡通报告插画。
- 统计概览改为圆角、浅渐变、轻阴影的数据卡片，并保留原有统计含义。
- 最近 7 天改为基于现有数据的双折线图，展示练习题数和正确题数。
- 薄弱标签改为有权重层级的胶囊标签，并增加轻量辅助插画。
- 页面风格保持浅绿色、米白色、轻卡通和学习产品感。

### 13.3 验收标准

- 顶部导航栏完全不变。
- 最近 7 天区域渲染折线图、legend 和 tooltip。
- 大屏统计卡片为多列布局，小屏无横向滚动。
- 薄弱标签区域不再单调空洞。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器截图验证统计页桌面和移动端可读。

## 14. V1.8 / V2 / V2.1 工程与公网安全增强规格

触发来源：从专业软件工程师角度复盘后，要求补齐工程质量、安全边界、登录保护、数据治理和验收证据链。

### 14.1 V1.8 工程稳固范围

- 统一所有业务 API 的成功 / 失败返回格式，保持 `{ ok, data }` 与 `{ ok, error }`。
- 练习页必须实际读取设置中的默认难度、默认题量和听力语速。
- 答题记录与错题更新必须作为同一事务提交。
- 题目选项和标签 JSON 解析必须集中封装，避免散落在多个 route / service 中。
- 新增 `typecheck` 与 CI，覆盖依赖安装、Prisma 校验、类型检查、lint、单测和构建。

### 14.2 V2 登录与公网安全范围

- 本机首次访问登录页时，如果数据库中没有用户，允许创建第一个管理员账号。
- 登录页提供普通用户注册入口；公网演示时可通过 `PUBLIC_REGISTRATION_ENABLED=false` 关闭新用户注册。
- 公网模式下未登录只能访问登录页和认证接口。
- 所有会消耗额度或修改数据的接口必须要求登录，包括 AI 生题、答题、错题状态、设置保存和清空数据。
- Session 必须使用 HttpOnly Cookie，浏览器端不得读取完整 session token。
- 题目、练习记录、错题和设置必须按当前登录用户隔离。
- 清空数据除前端二次确认外，服务端还必须要求确认文本 `CLEAR`。

### 14.3 V2.1 数据与成本治理范围

- 图片生成结果不得长期以 base64 data URL 存入 SQLite，必须保存为本地文件并在数据库中保存受保护的访问路径。
- AI 生题必须按用户记录每日生成题量，并提供默认每日上限。
- 答题耗时必须由前端记录并写入 `timeSpentSeconds`，不能长期固定为 0。

### 14.4 验收标准

- 未登录访问 `/`、`/listening`、`/grammar`、`/mistakes`、`/stats`、`/settings` 会进入 `/login`。
- 首次登录创建管理员后，旧的单用户数据归属到该管理员。
- 未登录调用受保护 API 返回 `UNAUTHORIZED`。
- 登录后可完成生题、答题、错题复练、设置保存和统计刷新。
- 设置中的听力语速会影响 Web Speech 播放。
- 图片描述题生成的图片路径不再是 `data:image/...`。
- `npm run typecheck`、`npm run lint`、`npm run test:run`、`npm run build` 可作为 CI 门禁。

## 15. V3 paper-domain 整卷系统首包规格

状态：Approved
触发来源：基于外部研究报告与用户确认，新增可演示整卷系统闭环。

### 15.1 范围

本阶段新增整卷试卷系统，并与旧单题系统并行存在。必须支持：

- 创建 Paper。
- 创建 PaperVersion。
- 手工添加 PaperSection、QuestionItem、QuestionOption。
- 发布 PaperVersion。
- 仅基于 published PaperVersion 创建或恢复 Attempt。
- 保存 AttemptResponse。
- 提交时按服务端时间判断是否超时，并对 `single_choice` 幂等批改。
- 查看 Attempt report。
- 通过 `data/papers/*.json` seed 本地试卷。

### 15.2 非目标

- 不接 OCR、Redis、Qdrant、FastAPI。
- 不重写旧 `Question / PracticeRecord / Mistake`。
- 不重写旧 `ai/generate-questions`、`practice-records`、`mistakes`、`stats`。
- 不迁移旧单题数据到新试卷系统。

### 15.3 数据与安全要求

- 新增 Paper、PaperVersion、PaperSection、QuestionItem、QuestionOption、Attempt、AttemptResponse、GradingResult。
- 预留 UploadedFile、ImportJob、ParseJob。
- 所有接口必须使用现有 `{ ok, data/error }` 风格。
- 所有 Paper / Version / Attempt 访问必须强制 user isolation。
- 所有修改 PaperSection / QuestionItem / QuestionOption 的接口必须校验父级 PaperVersion 为 `draft`，否则返回 `VERSION_NOT_EDITABLE`。
- Submit 必须通过 transaction 与 `GradingResult.attemptId` 唯一约束实现幂等。

### 15.4 UI 验收页

- `/papers`
- `/papers/new`
- `/papers/{paperId}`
- `/paper-versions/{versionId}/edit`
- `/paper-versions/{versionId}/take`
- `/attempts/{attemptId}/report`

## 16. V4 paper document import spec

Status: Approved

- Add a paper import entry for user-uploaded text PDF and DOCX files.
- Do not add OCR, Redis, Qdrant, or FastAPI in this phase.
- Do not rewrite legacy `Question / PracticeRecord / Mistake` models or old `ai/generate-questions`, `practice-records`, `mistakes`, `stats` flows.
- Uploaded files are stored under `output/uploads/papers/<userId>/`; database rows keep metadata and local paths only.
- Import APIs must keep `{ ok, data/error }`, `AppError`, `handleApiError`, and `requireUserFromRequest`.
- Import creates `UploadedFile`, `ImportJob`, and `ParseJob`, extracts text, parses `single_choice` items, and stores a reviewable import result.
- Missing answers can be completed through existing MaaS / DeepSeek service and must be marked as AI sourced.
- Applying an import creates a `draft` PaperVersion only; users must review before publishing.
- Scanned PDFs without extractable text return `UNSUPPORTED_SCANNED_DOCUMENT`.
- AI parsing and answer completion use the same Huawei Cloud MaaS OpenAI-compatible chat configuration as legacy generation: `MAAS_API_KEY`, `MAAS_BASE_URL`, and `MAAS_MODEL`.
- `MAAS_MODEL` may point to any enabled Huawei MaaS chat model, such as GLM or DeepSeek variants, but the value must exactly match the model id exposed by the Huawei Cloud console.
