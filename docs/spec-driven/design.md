# TOEIC Practice Studio Design

状态：Approved  
阶段：V2.1 implemented / documentation maintained  
最后更新：2026-06-24  
依据规格：[spec.md](./spec.md)

当前最新版说明：本文件前半部分保留 MVP / V1.x 的历史设计边界；登录、注册、公网保护、用户隔离、图片文件化和 AI 限额已作为 V2 / V2.1 增强实现，最终设计以第 19 节为准。

## 0. Gate 2 设计边界

本设计文档用于把已批准的 `spec.md` 转换为可实现方案。当前 `tasks.md` 已由用户确认可执行，允许进入 Gate 4 并按任务顺序开发。

进入下一阶段的条件：

1. 用户审核并确认 `tasks.md` 可执行
2. `tasks.md` 状态从 `Draft` 改为 `Approved`
3. 再进入 Gate 4 按任务顺序开发

禁止越界事项：

- 不在本阶段写业务代码
- 不在本阶段生成真实 API Key
- 不把 `MAAS_API_KEY` 写入文档、源码或前端环境变量
- 不新增登录、多端同步、云部署、支付等第一版外功能

## 1. 总体架构

### 1.1 技术栈

- 框架：Next.js App Router
- 语言：TypeScript
- UI：Tailwind CSS + shadcn/ui
- 数据库：SQLite
- ORM：Prisma
- AI 供应商：华为云 MaaS
- 模型：DeepSeek-V3.2，`model=deepseek-v3.2`
- 运行方式：本机个人版，开发阶段使用 `npm run dev`

### 1.2 分层结构

推荐目录结构：

```text
app/
  page.tsx
  layout.tsx
  globals.css
  listening/page.tsx
  grammar/page.tsx
  mistakes/page.tsx
  stats/page.tsx
  settings/page.tsx
  api/
    ai/generate-questions/route.ts
    practice-records/route.ts
    questions/route.ts
    mistakes/route.ts
    mistakes/[id]/route.ts
    stats/route.ts
    settings/route.ts
    settings/clear-data/route.ts
components/
  app-shell.tsx
  stat-card.tsx
  question-card.tsx
  practice-form.tsx
  result-panel.tsx
  speech-controls.tsx
  empty-state.tsx
  confirm-dialog.tsx
lib/
  prisma.ts
  maas-client.ts
  question-generation.ts
  question-validation.ts
  practice-service.ts
  mistake-service.ts
  stats-service.ts
  settings-service.ts
  errors.ts
  constants.ts
prompts/
  generate-listening-question.ts
  generate-grammar-question.ts
prisma/
  schema.prisma
```

分层职责：

- `app/*/page.tsx`：页面组合、加载状态、用户交互
- `app/api/**/route.ts`：服务端 API 边界、请求校验、错误响应
- `components/*`：可复用 UI 组件，只处理展示和轻量交互
- `lib/*`：MaaS 调用、Prisma 访问、业务规则、统计计算
- `prompts/*`：AI Prompt 模板，集中维护
- `prisma/schema.prisma`：本地 SQLite 数据模型

## 2. 页面设计

### 2.1 全局布局

使用左侧或顶部导航，保留以下入口：

- 首页
- 听力练习
- 语法练习
- 错题本
- 学习统计
- 设置

布局要求：

- 桌面端优先，主内容区最大宽度约束，保持清晰密度
- 移动端基础响应式，导航可折叠或改为顶部横向入口
- 不做营销落地页，首页即学习仪表盘

### 2.2 首页 / 仪表盘

数据来源：

- 调用 `GET /api/stats`

主要模块：

- 今日练习题数
- 今日正确率
- 总练习题数
- 当前错题数
- 听力、语法、错题本、统计、设置的快捷入口
- 无数据时显示 0 和空状态

交互：

- 点击入口跳转对应页面
- 统计加载失败时显示可读错误，不阻塞导航

### 2.3 听力练习页

页面状态：

- `idle`：选择题型、难度、题量
- `generating`：等待 AI 生成
- `practicing`：答题中
- `submitted`：已提交并显示解析
- `error`：生成或保存失败

主要控件：

- 题型选择
- 难度选择
- 题量选择
- 生成按钮
- Web Speech 播放按钮
- A/B/C/D 答案按钮
- 提交按钮
- 下一题按钮

硬性展示规则：

- 提交前只显示 A/B/C/D，不显示英文选项正文
- 播放时使用 Web Speech API 朗读 `listeningScript` 和选项正文
- 提交后显示选项正文、用户答案、正确答案、中文解析

### 2.4 语法练习页

页面状态与听力页一致，但不使用语音作为必需流程。

主要控件：

- 语法点选择
- 难度选择
- 题量选择
- 生成按钮
- A/B/C/D 答案按钮
- 提交按钮
- 下一题按钮

展示规则：

- 答题前可直接显示题干和选项
- 提交后显示正确答案、中文解析、语法点说明

### 2.5 错题本页

数据来源：

- `GET /api/mistakes`
- `PATCH /api/mistakes/:id`

主要模块：

- 错题列表
- 题型筛选
- 标签 / 语法点筛选
- 状态筛选
- 详情区：原题、用户答案、正确答案、解析、错误次数

操作：

- 标记已掌握
- 移除错题
- 更新笔记
- 重新练习入口

默认列表不展示已移除项目；`mastered` 项可通过状态筛选查看。

### 2.6 学习统计页

数据来源：

- `GET /api/stats`

主要模块：

- 今日练习题数
- 总练习题数
- 总正确率
- 听力正确率
- 语法正确率
- 当前错题数
- 已掌握错题数
- 最近 7 天趋势
- 高频错误标签 / 语法点

统计原则：

- 从 `PracticeRecord` 和 `Mistake` 实时计算
- 第一版不建立复杂统计缓存表

### 2.7 设置页

数据来源：

- `GET /api/settings`
- `PATCH /api/settings`
- `POST /api/settings/clear-data`

展示内容：

- API Key 状态：仅显示“已配置”或“未配置”
- MaaS Base URL
- MaaS Model
- 默认难度
- 默认题量
- 听力语速
- 清除本地数据入口

安全规则：

- 不显示完整 API Key
- 不显示 Authorization 请求头
- 清除数据必须二次确认

## 3. 数据库设计

### 3.1 Question

用途：保存 AI 生成题目。

字段：

- `id`: String，主键，建议 `cuid()`
- `type`: String，`listening` / `grammar`
- `subtype`: String
- `difficulty`: String，`easy` / `medium` / `hard`
- `prompt`: String，题干
- `optionsJson`: String，JSON 字符串，保存 A/B/C/D
- `answer`: String，`A` / `B` / `C` / `D`
- `explanationZh`: String
- `tagsJson`: String，JSON 字符串
- `listeningScript`: String，可空
- `grammarPoint`: String，可空
- `source`: String，第一版主要为 `maas`
- `createdAt`: DateTime

索引：

- `type`
- `difficulty`
- `createdAt`

### 3.2 PracticeRecord

用途：保存每次答题记录。

字段：

- `id`: String，主键
- `questionId`: String，外键
- `practiceType`: String
- `userAnswer`: String
- `isCorrect`: Boolean
- `timeSpentSeconds`: Int，可空或默认 0
- `practicedAt`: DateTime

索引：

- `questionId`
- `practiceType`
- `practicedAt`
- `isCorrect`

### 3.3 Mistake

用途：保存错题状态。

字段：

- `id`: String，主键
- `questionId`: String，唯一索引
- `wrongCount`: Int
- `lastWrongAt`: DateTime
- `status`: String，`new` / `reviewing` / `mastered` / `removed`
- `note`: String，可空
- `masteredAt`: DateTime，可空

规则：

- 同一 `questionId` 只能有一条错题记录
- 重复答错时增加 `wrongCount`
- 已掌握后再次答错，状态改回 `reviewing`
- 移除错题使用 `removed` 软删除状态，便于保留历史

### 3.4 UserSetting

用途：保存本机学习偏好。

字段：

- `id`: String，主键
- `defaultDifficulty`: String
- `defaultQuestionCount`: Int
- `speechRate`: Float
- `createdAt`: DateTime
- `updatedAt`: DateTime

规则：

- 第一版只维护一条设置记录
- 不保存 API Key
- MaaS Base URL 和 Model 从服务端环境变量读取，不写入数据库

## 4. API 设计

### 4.1 通用响应格式

成功：

```json
{
  "ok": true,
  "data": {}
}
```

失败：

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "可读错误信息"
  }
}
```

日志规则：

- 可记录错误代码、接口名、时间
- 不记录 API Key
- 不记录 Authorization
- 不记录完整 MaaS 原始响应

### 4.2 `POST /api/ai/generate-questions`

请求：

```json
{
  "practiceType": "listening",
  "subtype": "short-conversation",
  "difficulty": "medium",
  "count": 3,
  "tags": ["business", "meeting"],
  "grammarPoint": ""
}
```

服务端流程：

1. 校验请求字段和 `count` 范围
2. 读取 `MAAS_API_KEY`、`MAAS_BASE_URL`、`MAAS_MODEL`
3. 缺少 `MAAS_API_KEY` 时返回 `MAAS_CONFIG_MISSING`
4. 根据 `practiceType` 选择 Prompt 模板
5. 调用 MaaS
6. 解析严格 JSON
7. 校验题目结构
8. 校验每题答案唯一且存在于选项
9. 校验听力题有 `listeningScript`
10. 校验语法题有 `grammarPoint`
11. 写入 `Question`
12. 返回已保存题目

失败代码：

- `REQUEST_INVALID`
- `MAAS_CONFIG_MISSING`
- `AI_GENERATION_FAILED`
- `AI_RESPONSE_INVALID`
- `QUESTION_VALIDATION_FAILED`
- `DATABASE_WRITE_FAILED`

### 4.3 `POST /api/practice-records`

请求：

```json
{
  "questionId": "question-id",
  "userAnswer": "B",
  "timeSpentSeconds": 42
}
```

服务端流程：

1. 查询题目
2. 比对答案
3. 创建 `PracticeRecord`
4. 如果答错，创建或更新 `Mistake`
5. 返回判分结果和题目解析

重复错题规则：

- 没有错题记录：创建 `Mistake`，`wrongCount=1`，`status=new`
- 已有错题记录：`wrongCount+1`，更新 `lastWrongAt`，`status=reviewing`

### 4.4 `GET /api/questions`

用途：查询已生成题目。

支持参数：

- `type`
- `subtype`
- `difficulty`
- `tag`
- `limit`

第一版主要用于调试和重新练习，不作为主生成入口。

### 4.5 错题 API

`GET /api/mistakes`

支持参数：

- `type`
- `tag`
- `grammarPoint`
- `status`

默认排除 `removed`。

`PATCH /api/mistakes/:id`

支持动作：

```json
{
  "action": "mark-mastered"
}
```

```json
{
  "action": "remove"
}
```

```json
{
  "action": "update-note",
  "note": "容易混淆时态"
}
```

### 4.6 `GET /api/stats`

返回：

```json
{
  "todayCount": 0,
  "todayAccuracy": 0,
  "totalCount": 0,
  "totalAccuracy": 0,
  "listeningAccuracy": 0,
  "grammarAccuracy": 0,
  "activeMistakeCount": 0,
  "masteredMistakeCount": 0,
  "last7Days": [],
  "weakTags": []
}
```

计算规则：

- 今日范围按本机日期计算
- 正确率无记录时返回 0
- 活跃错题排除 `mastered` 和 `removed`
- 高频薄弱点从错题对应题目的 `tagsJson` 和 `grammarPoint` 聚合

### 4.7 设置 API

`GET /api/settings`

返回：

- `hasApiKey`: Boolean
- `maasBaseUrl`: String
- `maasModel`: String
- `defaultDifficulty`
- `defaultQuestionCount`
- `speechRate`

`PATCH /api/settings`

更新：

- 默认难度
- 默认题量
- 听力语速

`POST /api/settings/clear-data`

流程：

1. 前端二次确认
2. 后端删除 `PracticeRecord`
3. 后端删除 `Mistake`
4. 后端删除 `Question`
5. 保留或重置 `UserSetting`

## 5. MaaS 调用设计

### 5.1 环境变量

`.env.local` 示例只能包含占位符：

```text
MAAS_API_KEY=your_local_api_key_here
MAAS_BASE_URL=https://api.modelarts-maas.com/v1/
MAAS_MODEL=deepseek-v3.2
```

规则：

- `.env.local` 必须在 `.gitignore`
- `MAAS_API_KEY` 不进入 `NEXT_PUBLIC_*`
- API Key 只在 Route Handler 或服务端 `lib/maas-client.ts` 读取

### 5.2 MaaS Client

`lib/maas-client.ts` 职责：

- 拼接 MaaS Chat Completions 请求
- 设置请求超时
- 注入服务端 Authorization
- 统一处理 HTTP 错误
- 返回文本内容给上层解析

设计注意：

- 不把请求头写入日志
- 不把完整响应写入日志
- 超时和非 2xx 响应统一转换为可控错误

### 5.3 JSON 解析与校验

`lib/question-validation.ts` 职责：

- 解析模型返回文本
- 拒绝 Markdown 代码块
- 校验根对象包含 `questions`
- 校验选项只包含 A/B/C/D
- 校验 answer 为 A/B/C/D 且存在
- 校验解释为中文可读文本
- 校验听力题 `listeningScript` 非空
- 校验语法题 `grammarPoint` 非空

如校验失败：

- 不写入数据库
- 返回 `AI_RESPONSE_INVALID` 或 `QUESTION_VALIDATION_FAILED`

## 6. Prompt 设计

### 6.1 通用约束

Prompt 必须要求模型：

- 生成原创 TOEIC 风格题目
- 不声称来自官方真题
- 只返回 JSON
- 不返回 Markdown
- 每题只有一个正确答案
- 选项为 A/B/C/D
- 解析使用中文
- 难度匹配用户选择

### 6.2 听力 Prompt 输出结构

```json
{
  "questions": [
    {
      "type": "listening",
      "subtype": "short-conversation",
      "difficulty": "medium",
      "prompt": "Question text or instruction",
      "listeningScript": "Full spoken script",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "A",
      "explanationZh": "中文解析",
      "tags": ["business"]
    }
  ]
}
```

### 6.3 语法 Prompt 输出结构

```json
{
  "questions": [
    {
      "type": "grammar",
      "subtype": "sentence-completion",
      "difficulty": "medium",
      "prompt": "The sentence with a blank.",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "C",
      "explanationZh": "中文解析",
      "grammarPoint": "时态",
      "tags": ["tense"]
    }
  ]
}
```

## 7. 前端状态与交互设计

### 7.1 练习状态机

```text
idle -> generating -> practicing -> submitted
                  \-> error
practicing -> saving -> submitted
saving -> error
submitted -> practicing
submitted -> idle
```

### 7.2 听力播放

使用浏览器 Web Speech API：

- `speechSynthesis`
- `SpeechSynthesisUtterance`

播放内容顺序：

1. `listeningScript`
2. `Option A`
3. `Option B`
4. `Option C`
5. `Option D`

设置：

- 使用 `UserSetting.speechRate`
- 提供播放、停止、重播按钮
- 浏览器不支持时显示可读提示，但仍可提交答案

### 7.3 错误展示

前端错误分为：

- 配置错误：提示配置 `.env.local`
- 生成错误：提示稍后重试或减少题量
- 数据保存错误：提示刷新或重试
- 浏览器能力错误：提示当前浏览器不支持语音朗读

错误信息应可操作，不显示堆栈。

## 8. 安全设计

### 8.1 API Key 边界

必须满足：

- `.env.local` 本地保存
- 只在服务端读取
- 不传给前端
- 不写入数据库
- 不写入日志
- 不出现在网络公开参数中

设置页只返回：

```json
{
  "hasApiKey": true
}
```

### 8.2 输入校验

所有 API Route 必须校验：

- 字段存在性
- 枚举值
- `count` 范围
- 字符串长度
- 数组长度

### 8.3 输出安全

- React 默认转义文本
- 不使用 `dangerouslySetInnerHTML`
- 模型输出只作为纯文本展示

## 9. 测试与验证策略

### 9.1 文档验证

- `spec.md` 状态为 `Approved`
- `design.md` 覆盖架构、页面、数据库、API、Prompt、错误处理、测试策略
- 进入 Gate 3 前由用户确认 `design.md`

### 9.2 工程验证

开发阶段必须执行：

- Prisma migration
- `npm run lint`
- `npm run build`

### 9.3 API 验证

重点验证：

- 缺少 `MAAS_API_KEY` 返回 `MAAS_CONFIG_MISSING`
- MaaS 返回非 JSON 时不落库
- 答案不在选项中时不落库
- 生成成功后写入 SQLite
- 答题后写入 `PracticeRecord`
- 答错后创建或更新 `Mistake`

### 9.4 浏览器验证

使用 Chrome / Edge 验证：

- 首页加载
- 听力生成流程
- 听力答题前隐藏选项正文
- Web Speech 可播放
- 语法答题流程
- 错题本更新
- 统计更新
- 设置页不泄露 API Key

### 9.5 验收记录

开发阶段创建并维护 `acceptance.md`，每项记录：

- 验收项
- 状态：`PASS` / `FAIL` / `BLOCKED` / `SKIP`
- 验证方式
- 备注

## 10. 实施顺序建议

本节只作为后续 `tasks.md` 的拆分依据，不代表当前可以开发。

1. 初始化 Next.js + TypeScript + Tailwind + shadcn/ui
2. 配置 Prisma + SQLite
3. 建立数据模型和 migration
4. 实现基础布局和导航
5. 实现设置页和配置状态 API
6. 实现 MaaS Client 和题目校验
7. 实现 AI 生成 API
8. 实现听力练习闭环
9. 实现语法练习闭环
10. 实现错题本
11. 实现统计
12. 执行浏览器验证和工程验证
13. 更新 `acceptance.md`

## 11. Gate 2 验收清单

- `design.md` 包含总体架构：待用户审核
- `design.md` 包含页面设计：待用户审核
- `design.md` 包含数据库设计：待用户审核
- `design.md` 包含 API 设计：待用户审核
- `design.md` 包含 MaaS 调用设计：待用户审核
- `design.md` 包含 Prompt 设计：待用户审核
- `design.md` 包含错误处理：待用户审核
- `design.md` 包含测试策略：待用户审核
- 未创建代码或安装依赖：已满足

## 12. V1.1 UI 打磨设计

状态：Approved

### 12.1 视觉方向

- Visual thesis：安静的学习控制台，以高留白、清晰密度、青绿色状态点缀和轻微暖色强调营造专注感。
- Content plan：首页先显示今日状态和核心统计，再给出练习入口；练习页先显示生成控制，再进入当前题目与结果反馈。
- Interaction thesis：按钮、选项和结果区域使用轻量 hover / ring / color state；不引入动画库，不增加复杂动效。

### 12.2 首页设计

首页改为服务端读取 `getStats()`：

- 顶部显示应用名、今日练习状态和主要入口。
- 统计块展示今日练习、今日正确率、总练习、当前错题。
- 快捷入口使用现有 `Button` 和 lucide 图标。
- 保持信息密度，避免营销式大段文案。
- 首页设置 `dynamic = "force-dynamic"`，避免 SQLite 统计在构建时被固化。

### 12.3 练习工作区设计

`components/practice-workspace.tsx` 保持为听力 / 语法复用组件，增加：

- 生成设置区的状态摘要。
- 当前题元信息：题型、难度、题号。
- 选项按钮的提交后反馈色：正确、错误、未选。
- 结果区保留中文解析和正确答案。

### 12.4 安全与兼容

- 不改变 API Key 读取边界。
- 不新增浏览器存储。
- 不改变 MaaS 请求和答题记录 API。
- 使用现有 shadcn/ui、Tailwind、lucide-react，不新增依赖。

### 12.5 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- 必要时通过 HTTP 请求检查首页包含真实统计相关文案

## 13. V1.2 丰富动效与活力重设计

状态：Approved

### 13.1 技术选择

- 新增依赖：`motion`
- 使用 `motion/react` 提供页面进入、stagger、hover / tap、题目切换和结果反馈动画。
- 使用 CSS keyframes 提供背景网格、声波、漂浮词块等轻量背景动画。
- 代码原生卡通贴纸使用 TSX + CSS 形状实现，避免引入不可控位图素材。

### 13.2 组件设计

新增轻量动效组件：

- `MotionPage`：页面进入容器。
- `MotionStagger` / `MotionItem`：列表和卡片 stagger 出场。
- `MotionSurface`：可点击区域 hover / tap 反馈。

新增轻量视觉组件：

- `CartoonSticker`：首页和练习页使用的贴纸式卡通视觉，可根据 `listening` / `grammar` / `focus` / `success` 变体切换。

### 13.3 页面设计

首页：

- 首屏改为更强的产品信号：品牌、行动按钮、今日状态和卡通贴纸视觉。
- 统计卡片使用 stagger 出场和 hover 反馈。
- 快捷入口卡片使用轻量 hover / tap 动效。

听力页：

- 使用 `practice-scene-listening` 背景类，展示轻微声波背景。
- 保持答题前隐藏英文选项正文。
- 播放、生成、选项和结果反馈使用 Motion 动效。

语法页：

- 使用 `practice-scene-grammar` 背景类，展示漂浮词块背景。
- 题目区和选项区使用 Motion 动效。

### 13.4 无障碍与性能

- CSS 动画必须在 `prefers-reduced-motion: reduce` 下停止或显著降级。
- Motion 动效控制在 opacity、transform、scale，避免布局抖动。
- 不引入大型 3D、粒子、Lottie、Rive 或游戏引擎。
- 不改变 API Key 安全边界。

### 13.5 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- 使用 Playwright 截图检查首页、听力页、语法页是否可读且背景未遮挡正文

## 14. V1.3 练习流程体验设计

状态：Approved

### 14.1 目标

在不改后端 API 的前提下，完善 `PracticeWorkspace` 的前端流程闭环：生成中、答题进度、最后完成态和下一步入口。

### 14.2 交互设计

- `loading=true` 且当前没有题目时，显示生成中面板，包含动效贴纸、状态文案和轻量进度感。
- `questions.length > 0` 时，在题目卡片前显示进度条：`answeredCount / questions.length`。
- 每题提交后继续保留正确 / 错误反馈。
- 最后一题提交后，在结果区下方显示完成面板：
  - 再来一组：调用现有 `generateQuestions()`
  - 查看错题本：跳转 `/mistakes`
  - 学习统计：跳转 `/stats`

### 14.3 约束

- 不改变 `POST /api/ai/generate-questions` 请求结构。
- 不改变 `POST /api/practice-records` 请求结构。
- 不新增依赖。
- 听力题提交前仍只显示 A/B/C/D 和隐藏提示。

### 14.4 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- Playwright 截图检查听力页和语法页空状态 / 生成前状态可读

## 15. V1.4 视觉对齐与响应式巡检设计

状态：Approved

### 15.1 目标

修复首页统计卡片中数字与单位的视觉错位，并把指标卡片抽成复用组件，应用到首页和统计页。

### 15.2 组件设计

新增 `MetricCard`：

- 输入：`label`、`value`、`unit?`、`className?`
- 内部使用 shadcn `Card`、`CardHeader`、`CardDescription`
- 数值行使用 `items-baseline`、`leading-none`、`tabular-nums`
- 单位不使用 `pb-*` 手动偏移
- 卡片设置稳定 `min-height`，减少不同单位长度导致的视觉跳动

### 15.3 页面应用

- 首页统计区改用 `MetricCard`。
- 统计页汇总区改用 `MetricCard`。
- 首页首屏右侧“今日状态 / 当前错题”保持现有结构，但如出现数值单位组合，后续也应优先复用 `MetricCard`。

### 15.4 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- Playwright 生成首页、统计页桌面截图
- Playwright 生成首页、听力页、语法页移动端截图，检查是否有文字重叠或明显错位

## 16. V1.5 题目查询与错题重新练习设计

状态：Approved

### 16.1 题目查询接口

新增 `GET /api/questions`，用于查询已落库题目。接口接受 `type`、`subtype`、`difficulty`、`tag`、`limit` 查询参数，默认返回最近 20 条，最多返回 50 条。返回数据需要把 `optionsJson` 和 `tagsJson` 转成前端可直接使用的 `options` 和 `tags`。

### 16.2 错题重新练习

在 `MistakesPanel` 内为每条错题维护本地复练状态，包括选中答案、提交中状态和提交结果。点击“重新练习”后在当前错题卡片内展示 A/B/C/D 选择区，提交时调用现有 `POST /api/practice-records`。成功后刷新错题列表，确保 `wrongCount` 和状态与后端一致。

### 16.3 约束

- 不新增 Prisma model 或 migration。
- 不改变 MaaS 生成接口。
- 不新增跳转练习页并加载指定题目的路由能力。
- 错题复习场景可以直接显示选项文本。

### 16.4 验证

- `GET /api/questions` 默认查询、组合筛选、标签筛选和非法枚举验证。
- 错题卡片内重新练习答错、答对、刷新错题次数验证。
- `npm run lint`
- `npm run build`

## 17. V1.6 首页 Hero 今日计划卡片设计

状态：Approved

### 17.1 视觉方向

Hero 左侧在 CTA 下方加入一张轻量“学习计划便签”，使用浅绿到浅米色渐变、浅边框、白色半透明任务块和小型线性耳机图标，填补空白但不与右侧卡通贴纸竞争。

### 17.2 交互设计

- 卡片复用现有 `MotionSurface`，hover 时轻微上浮和阴影增强。
- “开始今日计划”按钮使用浅色描边风格，hover 时切换浅绿色背景。
- “开始听力”主 CTA 使用深绿色背景和白色文字，避免黑底黑字。

### 17.3 响应式

- 桌面端卡片位于 Hero 左侧按钮下方，最大宽度约 640px–720px。
- 小屏端随左侧内容自然堆叠，位于标题和按钮下方。
- 右侧 `CartoonSticker` 与状态卡片布局不调整。

### 17.4 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- Playwright 生成首页桌面和移动端截图，检查按钮文字颜色、计划卡片可见性和桌面卡片高度。

## 18. V1.7 学习统计卡通仪表盘设计

状态：Approved

### 18.1 组件结构

`app/stats/page.tsx` 继续作为服务端页面读取 `getStats()`，主体 UI 下沉到 `components/stats-dashboard.tsx`。组件内拆分 `StatsHero`、`StatCard`、`WeeklyTrendCard`、`WeakTagsCard`，保持统计页面结构清晰。

### 18.2 图表方案

新增 `recharts` 作为图表依赖。最近 7 天使用 `ResponsiveContainer` + `AreaChart` 渲染双折线，`count` 表示练习题数，`correct` 表示正确题数，并提供 tooltip、legend、圆点 marker 和淡面积填充。

### 18.3 视觉与交互

- Hero 使用浅绿色 / 奶油色渐变、淡网格和小型卡通报告角色。
- 统计卡片使用 20px 以上圆角、柔和渐变、轻阴影和 hover 上浮。
- 正确率卡片使用 SVG 环形进度。
- 薄弱标签按权重调整视觉层级，前 3 个标签更突出。
- CSS 微动效只用于图标呼吸和插画轻浮动，并支持 reduced motion 降级。

### 18.4 验证

- `npm run lint`
- `npm run build`
- `node scripts/smoke/browser-smoke.mjs`
- Playwright 生成统计页桌面和移动端截图，检查折线图、核心标题、统计卡片、薄弱标签和横向滚动。

## 19. V1.8 / V2 / V2.1 工程与公网安全设计

### 19.1 认证设计

新增 `User` 与 `Session`。首次数据库中没有用户时，登录页会创建第一个管理员，并把旧的未归属题目、练习记录、错题和设置归属给该管理员。已有用户后，登录页提供普通用户注册入口；公网演示时可通过 `PUBLIC_REGISTRATION_ENABLED=false` 关闭新用户注册。

Session token 使用随机值生成，只把哈希写入数据库；浏览器只保存 HttpOnly Cookie。`GET /api/auth/me` 用于前端读取当前登录状态，`POST /api/auth/logout` 删除服务端 session 并清除 Cookie。

### 19.2 用户数据隔离

`Question`、`PracticeRecord`、`Mistake`、`UserSetting` 增加 `userId`。业务查询默认带当前用户 ID，确保公网分享时不同账号之间数据不可见。旧数据在首个管理员创建后一次性接管。

### 19.3 API 统一错误处理

新增统一响应工具：成功返回 `{ ok: true, data }`，失败返回 `{ ok: false, error: { code, message } }`。Route Handler 只负责读取请求、校验身份和调用 service，异常统一映射为 `AppError`。

### 19.4 图片与成本治理

图片描述题的 base64 结果保存到 `output/generated-images/<userId>/`，数据库只保存 `/api/question-images/<userId>/<filename>`。图片读取接口要求登录且只能访问本人路径。

新增 `GenerationUsage`，按用户和日期记录 AI 生成题量。默认每日上限为 50 题，可通过 `DAILY_AI_GENERATION_LIMIT` 调整。

### 19.5 页面保护

Proxy 在页面层检查 session cookie，未登录跳转 `/login`；服务端页面还会读取真实 session，失效时再次重定向。API 不通过页面重定向处理，而是返回 JSON 401。

## 20. V3 paper-domain 整卷系统设计

### 20.1 领域模型

新增试卷域模型与旧单题模型并行：

- `Paper`：试卷根对象，带 `userId` 与可选 `sourceKey`。
- `PaperVersion`：版本对象，状态为 `draft / published / archived`。
- `PaperSection`：版本内分区。
- `QuestionItem`：版本内题目，首版只开放 `single_choice`。
- `QuestionOption`：题目选项，A-D。
- `Attempt`：服务端计时作答会话，包含 `startedAt / durationSeconds / expiresAt / submittedAt / lastAutosavedAt`。
- `AttemptResponse`：逐题作答与逐题批改字段。
- `GradingResult`：attempt 级总批改结果，`attemptId` 唯一。
- `UploadedFile / ImportJob / ParseJob`：为后续文档导入预留。

### 20.2 服务层规则

所有试卷域规则集中在 `lib/paper-service.ts`。Route Handler 只负责鉴权、读参、调用服务和统一错误处理。

核心规则：

- 任何访问都必须按当前 `userId` 过滤。
- 只有 `draft` 版本可编辑分区、题目、选项。
- 发布前校验至少 1 道题、每道 `single_choice` 有 A-D 选项、答案命中选项。
- Attempt 只能从 `published` 版本创建；同用户同版本存在未过期 `in_progress` Attempt 时复用。
- 保存答案使用 `AttemptResponse(attemptId,itemId)` upsert，并刷新 `lastAutosavedAt`。
- Submit 在 transaction 中批改，创建唯一 `GradingResult`；重复 submit 返回既有报告。

### 20.3 UI 设计

新增最小工作台 UI：

- `/papers`：当前用户试卷列表与 seed 提示。
- `/papers/new`：创建 Paper。
- `/papers/{paperId}`：版本列表、新建版本、进入编辑或作答。
- `/paper-versions/{versionId}/edit`：draft 版本录入分区、题目、选项，发布校验。
- `/paper-versions/{versionId}/take`：创建或恢复 Attempt、保存答案、提交。
- `/attempts/{attemptId}/report`：展示总分、正确率和逐题结果。

### 20.4 Seed 设计

`data/papers/*.json` 使用固定结构。`npm run seed:papers` 默认导入 `toeic-sample-001.json`，按 `userId + sourceKey + versionLabel` 幂等导入；无用户时失败并提示先创建用户。
