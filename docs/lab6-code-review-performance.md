# 实验六：代码评审与程序性能优化说明

## 1. 本次新增范围

本次实验按当前项目的实际技术栈完成，项目语言与框架为：

- TypeScript / TSX
- Next.js App Router
- React
- Prisma / SQLite
- Tailwind CSS / shadcn/ui
- Node.js 脚本环境

因此实验六不使用 Java 项目的 Checkstyle、SpotBugs、PMD，而是使用更适合本项目的 TypeScript / JavaScript 工具链完成代码评审与性能优化。

## 2. 静态代码评审工具

本次静态代码评审采用 3 个工具：

| 工具 | 命令 | 主要作用 | 本次结果 |
| --- | --- | --- | --- |
| ESLint | `npm.cmd run lint` | 检查 Next.js、React、TypeScript 代码规范与潜在问题 | 通过，存在既有脚本警告 |
| TypeScript | `npm.cmd run typecheck` | 检查类型安全、接口一致性、空值风险 | 通过 |
| Semgrep | `npx.cmd --yes semgrep scan --config p/typescript --config p/javascript --config p/owasp-top-ten --exclude node_modules --exclude .next` | 检查 TypeScript / JavaScript 常见缺陷与 Web 安全风险 | 通过，0 findings |

Semgrep 仅作为实验审查工具临时执行，不写入项目运行时依赖，也不修改 `package.json`。

## 3. 性能优化目标

优化目标位于：

- `lib/stats-service.ts`

优化场景是统计服务 `getStats` 中“最近 7 天数据聚合”逻辑。

优化前思路：

- 对 7 天中的每一天分别执行 `filter`
- 每次都重复遍历 `recentRecords`
- 重复格式化日期字符串
- 当数据量变大时，CPU 时间会明显增加

优化后思路：

- 使用 `summarizeDailyRecords(records, startDate, dayCount)` 封装聚合逻辑
- 单次遍历记录并写入 `Map`
- 再按最近 7 天顺序读取汇总结果
- 降低重复遍历和重复字符串处理开销

## 4. 新增与修改文件

| 文件 | 作用 |
| --- | --- |
| `lib/stats-service.ts` | 新增最近 7 天统计聚合函数，并在 `getStats` 中使用优化后的 Map 聚合逻辑 |
| `tests/unit/lib/stats-service.test.ts` | 验证优化后的 7 天统计结果与预期一致 |
| `scripts/perf/stats-benchmark.ts` | 输出优化前后性能对比，并生成中文结果文件 |
| `output/lab6/perf-benchmark.json` | 性能测试结构化结果 |
| `output/lab6/perf-benchmark.txt` | 中文性能测试文本结果 |
| `output/lab6/实验六-代码评审与程序性能优化报告.md` | 实验报告 Markdown 版本 |
| `output/lab6/实验六-代码评审与程序性能优化报告.docx` | 实验报告 Word 版本 |
| `output/lab6/screenshots/` | 静态审查、性能测试、代码对比截图 |
| `output/lab6/profiles/` | Node.js CPU Profile 采样文件 |

## 5. 测试脚本中文输出

性能测试脚本：

```powershell
npx.cmd tsx scripts/perf/stats-benchmark.ts
```

脚本会在终端输出中文结果，并同步写入：

```text
output/lab6/perf-benchmark.txt
```

文本文件使用 UTF-8 BOM 写入，便于 Windows PowerShell、记事本和 Word 正确显示中文。

当前性能对比结果：

| 指标 | 优化前 | 优化后 | 变化 |
| --- | ---: | ---: | ---: |
| 平均耗时 | 22.713 ms | 4.947 ms | 提升约 78.22% |
| p95 耗时 | 24.835 ms | 5.571 ms | 明显降低 |
| 总耗时 | 2725.547 ms | 593.677 ms | 明显降低 |
| 校验值 | 9999960 | 9999960 | 结果一致 |

校验值一致表示优化前后的统计结果一致，性能差异来自实现方式优化，而不是业务结果改变。

## 6. 可复现命令

静态代码评审：

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd --yes semgrep scan --config p/typescript --config p/javascript --config p/owasp-top-ten --exclude node_modules --exclude .next
```

功能验证：

```powershell
npm.cmd run test:run
npm.cmd run build
```

性能验证：

```powershell
npx.cmd tsx scripts/perf/stats-benchmark.ts
```

## 7. 报告与截图位置

实验六最终产物统一放在：

```text
output/lab6/
```

主要交付文件：

- `output/lab6/实验六-代码评审与程序性能优化报告.docx`
- `output/lab6/实验六-代码评审与程序性能优化报告.md`
- `output/lab6/perf-benchmark.txt`
- `output/lab6/perf-benchmark.json`
- `output/lab6/screenshots/`
- `output/lab6/profiles/`

## 8. 文档结论

本次实验完成了与项目语言匹配的代码评审与性能优化：

- 静态代码评审覆盖代码规范、类型安全和安全风险。
- 性能优化聚焦真实业务统计逻辑，没有修改 UI 和业务流程。
- 新增测试保证优化前后统计结果一致。
- 性能脚本输出中文结果，并生成可提交的报告、截图和性能数据。
