# TOEIC Practice Studio

TOEIC Practice Studio 是一个本地运行的 TOEIC 听力 / 语法练习应用。它使用 Next.js、TypeScript、Tailwind、shadcn/ui、Prisma 和 SQLite 构建，题目由本机后端调用 MaaS / OpenAI 生成，浏览器端不会直接持有 API Key。

## 当前能力

- 登录、注册、退出，以及 HttpOnly Session Cookie 保护。
- 首次启动可创建管理员账号，后续可注册普通账号。
- 可通过 `PUBLIC_REGISTRATION_ENABLED=false` 关闭公开注册。
- 听力与语法题目生成、答题、错题复练、学习统计和设置保存。
- 按用户隔离题目、练习记录、错题、统计和设置。
- 答题记录与错题更新使用同一数据库事务。
- AI 图片保存为本地文件路径，数据库不长期保存 base64。
- AI 生成次数按用户和日期限流，默认每日 50 题。

## 目录结构

```text
app/                    Next.js 页面与 API Routes
components/             页面组件与 shadcn/ui 组件
lib/                    业务服务、认证、AI、统计、Prisma client
prisma/                 Prisma schema、SQLite 数据库与 migrations
prompts/                听力 / 语法生成 Prompt
scripts/smoke/          浏览器、生成题、公网验收脚本
scripts/public/         公网启动与 Cloudflare Tunnel 脚本
scripts/reports/        课程汇报与过程文档生成脚本
docs/spec-driven/       spec、design、tasks、acceptance
docs/                   文档索引、变更记录、项目上下文
output/                 截图、PPT、报告、临时验证数据库等生成物
tests/                  Vitest 单元测试
```

## 快速启动

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

打开：

[http://127.0.0.1:3000](http://127.0.0.1:3000)

第一次访问 `/login` 时，如果数据库中没有用户，输入用户名和至少 8 位密码会创建第一个管理员。之后可以继续在登录页注册普通用户。

## 环境变量

参考 `.env.example` 或 `.env.local.example`：

```env
DATABASE_URL=file:./dev.db
MAAS_API_KEY=your_local_api_key_here
MAAS_BASE_URL=https://api.modelarts-maas.com/v1/
MAAS_MODEL=deepseek-v3.2
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_IMAGE_MODEL=gpt-image-2
DAILY_AI_GENERATION_LIMIT=50
PUBLIC_REGISTRATION_ENABLED=true
```

注意：

- 不要把真实 API Key 写入源码、文档正文或 Git。
- 不要使用 `NEXT_PUBLIC_*` 保存服务端 API Key。
- `.env` 和 `.env.local` 都已被 `.gitignore` 忽略。

## 常用命令

```powershell
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:run
npm run smoke:generation
npm run smoke:public
```

浏览器 smoke 脚本：

```powershell
node scripts/smoke/browser-smoke.mjs
```

## 测试方法

单元测试使用 Vitest，测试文件位于 `tests/unit/`。用例名称采用 `Acceptance:` / `Scenario:` 风格，便于在验收时直接查看每个场景是否通过。

运行全部单元测试：

```powershell
npm run test:run
```

开发时监听测试：

```powershell
npm run test
```

运行指定测试文件：

```powershell
npx vitest run tests/unit/api/generate-questions.route.test.ts
```

生成覆盖率报告：

```powershell
npm run test:coverage
```

提交或验收前建议同时执行：

```powershell
npm run typecheck
npm run lint
npm run test:run
```

如果 Windows PowerShell 提示无法加载 `npm.ps1`，可改用 `npm.cmd`，例如：

```powershell
npm.cmd run test:run
```

## 公网演示

开发模式：

```powershell
npm run dev:public
```

更接近正式演示：

```powershell
npm run build
npm run start:public
```

Cloudflare Quick Tunnel：

```powershell
npm run tunnel:quick
```

公网演示建议关闭注册：

```env
PUBLIC_REGISTRATION_ENABLED=false
```

## 验证状态

当前工程验证：

- `npm run typecheck`：通过
- `npm run lint`：通过，`output/presentation/src/build-report-deck.mjs` 仍有既有 unused warning
- `npm run test:run`：7 个测试文件、27 个测试通过
- `npm run build`：通过
- `npx prisma validate`：通过

详细验收记录见 [docs/spec-driven/acceptance.md](./docs/spec-driven/acceptance.md)。

## 文档入口

- [文档索引](./docs/README.md)
- [需求规格](./docs/spec-driven/spec.md)
- [设计文档](./docs/spec-driven/design.md)
- [任务拆分](./docs/spec-driven/tasks.md)
- [验收记录](./docs/spec-driven/acceptance.md)
- [AI 变更记录](./docs/change-log-ai.md)

后续新增需求继续按 `spec -> design -> tasks -> implementation -> acceptance` 的流程推进，相关文档统一维护在 `docs/spec-driven/`。
