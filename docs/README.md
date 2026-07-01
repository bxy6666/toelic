# TOEIC Practice Studio 文档索引

本目录保存项目文档、过程记录和课程汇报辅助材料。根目录只保留标准 `README.md` 与框架要求的配置文件，详细文档统一放在这里。

## 核心文档

- [需求规格](./spec-driven/spec.md)
- [设计文档](./spec-driven/design.md)
- [任务拆分](./spec-driven/tasks.md)
- [验收记录](./spec-driven/acceptance.md)

## 项目记录

- [AI 变更记录](./change-log-ai.md)
- [项目上下文](./project-context.md)
- [Codex 会话归档](./codex-conversations/README.md)

## 当前实现摘要

- 应用入口：`app/`
- 公共组件：`components/`
- 业务服务：`lib/`
- 数据模型：`prisma/schema.prisma`
- 单元测试：`tests/unit/`
- smoke 脚本：`scripts/smoke/`
- 公网脚本：`scripts/public/`
- 报告脚本：`scripts/reports/`

当前版本包含登录、注册、用户数据隔离、AI 生成限流、图片文件化存储、答题事务和清空数据服务端确认。最新验证结果记录在 [验收记录](./spec-driven/acceptance.md)。

## 实验六代码评审与性能优化

- [实验六说明文档](./lab6-code-review-performance.md)
- 报告产物：`output/lab6/实验六-代码评审与程序性能优化报告.docx`
- Markdown 报告：`output/lab6/实验六-代码评审与程序性能优化报告.md`
- 性能测试中文结果：`output/lab6/perf-benchmark.txt`
- 性能测试结构化结果：`output/lab6/perf-benchmark.json`
- 关联脚本：`scripts/perf/stats-benchmark.ts`
- 优化代码：`lib/stats-service.ts`
- 单元测试：`tests/unit/lib/stats-service.test.ts`

本次实验按项目实际语言 TypeScript / TSX / Next.js 完成，静态评审使用 ESLint、TypeScript typecheck 和 Semgrep；性能优化使用 Node.js 基准测试与 CPU Profile 对 `getStats` 最近 7 天统计聚合逻辑做优化前后对比。

## 实验七系统测试与性能压力测试

- [实验七说明文档](./lab7-system-test.md)
- 完整 Markdown 报告：`output/lab7/实验七-系统测试与性能压力测试报告.md`
- Word 报告：`output/lab7/实验七-系统测试与性能压力测试报告.docx`
- JMeter 测试计划：`output/lab7/jmeter-toeic-system-test.jmx`
- JMeter 参数文件：`output/lab7/jmeter-users.csv`
- Node.js 压测脚本：`scripts/perf/system-load-test.mjs`
- 压测命令：`npm run perf:system`
- 压测结果：20 个虚拟用户、每用户 5 轮、800 次请求、100.00% 成功率、吞吐量 12.00 requests/s、平均响应时间 1618.41 ms、P95 3822.37 ms。

本次实验按课件中的“CSV Data Set Config、HTTP Request、Thread Group、Summary Report”思路生成 JMeter 计划；由于当前本机未检测到 `jmeter` 命令，实际数据使用项目内 Node.js 压测脚本生成，并保留可导入 JMeter 的复测文件。
