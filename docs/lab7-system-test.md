# 实验七：系统测试与性能压力测试说明

## 实验主题

本实验依据“系统测试 / 软件性能测试”课件完成，主题为对 TOEIC Practice Studio 进行系统级功能验证和并发性能压力测试。

## 课件要求对应

| 课件要求 | 本项目落地 |
| --- | --- |
| 了解负载测试、压力测试等概念 | 报告中说明并发用户数、响应时间、吞吐量、错误率等指标 |
| 使用 JMeter 进行性能测试 | 已生成 `output/lab7/jmeter-toeic-system-test.jmx` |
| 使用 CSV Data Set Config 参数化 | 已生成 `output/lab7/jmeter-users.csv` |
| 使用 Thread Group 控制用户数 | JMeter 计划默认 20 users、Ramp-Up 10s、Loop Count 5 |
| 使用 Summary Report 查看结果 | JMeter 计划包含 Summary Report，输出 `output/lab7/jmeter-summary.jtl` |
| 对已有网站进行压力测试和分析 | 使用 `npm run perf:system` 对本地 Web 应用进行 800 次请求压测 |

## 新增命令

```powershell
npm run perf:system
```

默认参数：

- `BASE_URL=http://127.0.0.1:3000`
- `LOAD_USERS=20`
- `LOAD_LOOPS=5`
- `SMOKE_USERNAME=smoke_admin`
- `SMOKE_PASSWORD=SmokePass123`

可通过环境变量调整：

```powershell
$env:LOAD_USERS="50"
$env:LOAD_LOOPS="10"
npm run perf:system
```

## 本次实测结果

| 指标 | 结果 |
| --- | ---: |
| 总请求数 | 800 |
| 成功请求数 | 800 |
| 失败请求数 | 0 |
| 成功率 | 100.00% |
| 总耗时 | 66.66 s |
| 吞吐量 | 12.00 requests/s |
| 平均响应时间 | 1618.41 ms |
| P95 响应时间 | 3822.37 ms |

结论：在 20 个虚拟用户、每用户 5 轮核心请求的本地开发服务器负载下，系统无失败请求，核心业务流程 smoke 通过，当前版本具备基本系统稳定性。页面级响应时间高于 API 响应时间，后续生产环境复测时应重点关注页面 P95。

## 产物入口

| 产物 | 路径 |
| --- | --- |
| 完整 Markdown 报告 | `output/lab7/实验七-系统测试与性能压力测试报告.md` |
| Word 报告 | `output/lab7/实验七-系统测试与性能压力测试报告.docx` |
| Node.js 压测脚本 | `scripts/perf/system-load-test.mjs` |
| JMeter 测试计划 | `output/lab7/jmeter-toeic-system-test.jmx` |
| JMeter 参数文件 | `output/lab7/jmeter-users.csv` |
| 压测文本结果 | `output/lab7/system-load-test.txt` |
| 压测 JSON 结果 | `output/lab7/system-load-test.json` |
| 系统 smoke 证据 | `output/lab7/smoke-papers.txt` |
| typecheck / test / lint / build 证据 | `output/lab7/*.txt` |

## 复测步骤

1. 启动应用：

```powershell
npm run dev
```

2. 执行系统压测：

```powershell
npm run perf:system
```

3. 执行系统功能验证：

```powershell
npm run typecheck
npm run test:run
npm run lint
npm run build
npm run seed:papers
npm run smoke:papers
```

4. 使用 JMeter 复测：

```powershell
jmeter -n -t output/lab7/jmeter-toeic-system-test.jmx -l output/lab7/jmeter-summary.jtl -e -o output/lab7/jmeter-report
```
