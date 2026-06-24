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
