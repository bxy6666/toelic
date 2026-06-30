import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

type PracticeRecord = {
  practicedAt: Date;
  isCorrect: boolean;
};

type DailySummary = {
  date: string;
  count: number;
  correct: number;
};

const outputDir = "output/lab6";
const reportDocxPath = `${outputDir}/实验六-代码评审与程序性能优化报告.docx`;
const reportMarkdownPath = `${outputDir}/实验六-代码评审与程序性能优化报告.md`;
const benchmarkJsonPath = `${outputDir}/perf-benchmark.json`;
const benchmarkTextPath = `${outputDir}/perf-benchmark.txt`;
const benchmarkScreenshotPath = `${outputDir}/screenshots/04-benchmark.png`;
const cpuProfileDir = `${outputDir}/profiles`;
const recordCount = 50_000;
const iterations = 120;
const warmupIterations = 20;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function baselineSummarizeDailyRecords(
  records: PracticeRecord[],
  startDate: Date,
  dayCount: number,
) {
  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    const key = formatDateKey(day);
    const matchedRecords = records.filter(
      (record) => formatDateKey(record.practicedAt) === key,
    );

    return {
      date: key,
      count: matchedRecords.length,
      correct: matchedRecords.filter((record) => record.isCorrect).length,
    };
  });
}

function optimizedSummarizeDailyRecords(
  records: PracticeRecord[],
  startDate: Date,
  dayCount: number,
) {
  const countsByDate = new Map<string, { count: number; correct: number }>();

  for (const record of records) {
    const key = formatDateKey(record.practicedAt);
    const current = countsByDate.get(key) ?? { count: 0, correct: 0 };
    current.count += 1;
    if (record.isCorrect) {
      current.correct += 1;
    }
    countsByDate.set(key, current);
  }

  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    const date = formatDateKey(day);
    const summary = countsByDate.get(date);

    return {
      date,
      count: summary?.count ?? 0,
      correct: summary?.correct ?? 0,
    };
  });
}

function createRecords(count: number, startDate: Date) {
  return Array.from({ length: count }, (_, index) => {
    const dayOffset = (index * 17) % 7;
    const hour = (index * 13) % 24;
    const minute = (index * 29) % 60;
    const practicedAt = new Date(startDate);
    practicedAt.setDate(startDate.getDate() + dayOffset);
    practicedAt.setHours(hour, minute, 0, 0);

    return {
      practicedAt,
      isCorrect: index % 3 !== 0,
    };
  });
}

function percentile(values: number[], ratio: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);

  return sorted[index] ?? 0;
}

function measure(
  name: string,
  summarize: (
    records: PracticeRecord[],
    startDate: Date,
    dayCount: number,
  ) => DailySummary[],
  records: PracticeRecord[],
  startDate: Date,
) {
  for (let index = 0; index < warmupIterations; index += 1) {
    summarize(records, startDate, 7);
  }

  const durations: number[] = [];
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    const startedAt = performance.now();
    const summary = summarize(records, startDate, 7);
    durations.push(performance.now() - startedAt);
    checksum += summary.reduce((sum, day) => sum + day.count + day.correct, 0);
  }

  const totalMs = durations.reduce((sum, value) => sum + value, 0);

  return {
    name,
    iterations,
    recordCount: records.length,
    totalMs,
    avgMs: totalMs / iterations,
    minMs: Math.min(...durations),
    maxMs: Math.max(...durations),
    p95Ms: percentile(durations, 0.95),
    checksum,
  };
}

mkdirSync(outputDir, { recursive: true });

const startDate = new Date(2026, 5, 23);
const records = createRecords(recordCount, startDate);
const baseline = measure(
  "baseline-filter-per-day",
  baselineSummarizeDailyRecords,
  records,
  startDate,
);
const optimized = measure(
  "optimized-single-pass-map",
  optimizedSummarizeDailyRecords,
  records,
  startDate,
);
const improvementPercent =
  ((baseline.avgMs - optimized.avgMs) / baseline.avgMs) * 100;

const result = {
  generatedAt: new Date().toISOString(),
  scenario: "stats-service last7Days aggregation",
  baseline,
  optimized,
  improvementPercent,
};

const text = [
  "实验六性能测试关联结果",
  `测试场景：统计页最近 7 天练习记录聚合（${result.scenario}）`,
  `测试数据：${recordCount} 条练习记录，${iterations} 次正式迭代，${warmupIterations} 次预热`,
  "",
  "优化前结果：",
  `- 算法：逐日 filter 过滤 recentRecords`,
  `- 平均耗时：${baseline.avgMs.toFixed(3)} ms`,
  `- P95 耗时：${baseline.p95Ms.toFixed(3)} ms`,
  `- 总耗时：${baseline.totalMs.toFixed(3)} ms`,
  "",
  "优化后结果：",
  `- 算法：单次遍历 Map 聚合`,
  `- 平均耗时：${optimized.avgMs.toFixed(3)} ms`,
  `- P95 耗时：${optimized.p95Ms.toFixed(3)} ms`,
  `- 总耗时：${optimized.totalMs.toFixed(3)} ms`,
  "",
  "对比结论：",
  `- 平均耗时提升：${improvementPercent.toFixed(2)}%`,
  `- 结果一致性校验：${baseline.checksum === optimized.checksum ? "通过" : "失败"}`,
  `- 优化前 checksum：${baseline.checksum}`,
  `- 优化后 checksum：${optimized.checksum}`,
  "",
  "关联产物：",
  `- 性能 JSON：${benchmarkJsonPath}`,
  `- 性能文本：${benchmarkTextPath}`,
  `- CPU Profile 目录：${cpuProfileDir}`,
  `- Benchmark 截图：${benchmarkScreenshotPath}`,
  `- Markdown 报告：${reportMarkdownPath}`,
  `- Word 报告：${reportDocxPath}`,
].join("\n");

writeFileSync(benchmarkJsonPath, `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(benchmarkTextPath, `\uFEFF${text}\n`);

console.log(text);
