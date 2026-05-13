# 项目上下文缓存

## 1. 项目基本信息

- 项目名称：TOEIC Practice Studio（暂定）
- 项目根目录：`E:\托业`
- 项目类型：混合型项目（Next.js Web 前端 + 本地 API Route）
- 当前阶段：V1.7 学习统计卡通仪表盘完成，MVP 本地版与 MaaS 真实生成均已通过
- 主要目标：先以 spec-driven coding 方式明确听力练习、语法练习、错题本、学习统计和 MaaS 生成题目的产品规格
- 项目级规则文件：暂无

## 2. 环境识别结论

- 当前目录已创建 Next.js 最小项目骨架
- 包管理器：npm
- 运行时：Node v24.14.0，npm 11.9.0
- Tailwind 状态：已接入 Tailwind CSS v4
- shadcn/ui 状态：已接入，使用 Radix 基础与 lucide 图标
- 当前任务已完成 T01-T22，已接入 Prisma + SQLite、本地 API Route、MaaS 生成链路、Motion 动效和 Recharts 图表
- 可运行脚本：`npm run dev`、`npm run dev:public`、`npm run build`、`npm run start`、`npm run start:public`、`npm run lint`
- 开发服务器：`http://127.0.0.1:3000`
- 锁文件：`package-lock.json`
- ESLint：已配置 `eslint.config.mjs`
- UI 组件：`components/ui/button.tsx`、`card.tsx`、`input.tsx`、`select.tsx`、`tabs.tsx`、`badge.tsx`、`alert.tsx`、`dialog.tsx`、`separator.tsx`
- 应用壳：`components/app-shell.tsx`
- 动效组件：`components/motion-ui.tsx`
- 卡通贴纸组件：`components/cartoon-sticker.tsx`
- 指标卡片组件：`components/metric-card.tsx`
- 空状态：`components/empty-state.tsx`
- Prisma：6.19.3
- SQLite 数据库：`C:\Users\ALGH\toeic-practice-studio\dev.db`
- 数据模型：`Question`、`PracticeRecord`、`Mistake`、`UserSetting`
- 已确认后续技术方向：Next.js + TypeScript + Tailwind + shadcn/ui + Motion + Prisma + SQLite
- 已确认 MaaS 模型：DeepSeek-V3.2，model 参数为 `deepseek-v3.2`
- 已接入 OpenAI Image API：仅听力 `picture-description` 题型使用 `OPENAI_API_KEY` 与 `OPENAI_IMAGE_MODEL` 生成原创配图，默认模型 `gpt-image-2`

## 3. 工具状态

- fd：已安装，`10.4.2`
- ripgrep：已安装，`15.1.0`
- Context7：本次无需启用
- ast-grep：本次无需启用
- shadcn/ui：已最小接入
- Aider：本次无需启用

## 4. 当前最小执行建议

- 当前 `spec.md` 已 Approved
- 当前 `design.md` 已 Approved
- 当前 `tasks.md` 已 Approved
- 按 T01 到 T15 顺序小步实现
- 当前最小下一步：配置 `OPENAI_API_KEY` 后人工验收听力图片描述题，重点检查真实配图、播放、隐藏选项、提交后解析和非图片题型不触发图片生成

## 5. 最近一次完整扫描

- 时间：2026-05-08
- 执行范围：规则读取、根目录空白状态确认、fd / ripgrep 检查
- 结论：T01-T22 已完成；MaaS 听力/语法真实生成补测通过；题目查询接口、错题重新练习、首页 Hero 今日计划卡片、学习统计卡通仪表盘、首页和统计页指标对齐、桌面 / 移动端响应式巡检已通过
