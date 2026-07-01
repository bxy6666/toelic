import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const username = process.env.SMOKE_USERNAME || "smoke_admin";
const password = process.env.SMOKE_PASSWORD || "SmokePass123";
const virtualUsers = Number(process.env.LOAD_USERS || 20);
const loops = Number(process.env.LOAD_LOOPS || 5);
const timeoutMs = Number(process.env.LOAD_TIMEOUT_MS || 30_000);
const outputDir = "output/lab7";

const requestPlan = [
  { name: "login-page", method: "GET", path: "/login", expectStatus: 200 },
  { name: "home-page", method: "GET", path: "/", expectStatus: 200 },
  { name: "papers-page", method: "GET", path: "/papers", expectStatus: 200 },
  { name: "stats-page", method: "GET", path: "/stats", expectStatus: 200 },
  { name: "settings-page", method: "GET", path: "/settings", expectStatus: 200 },
  { name: "settings-api", method: "GET", path: "/api/settings", expectStatus: 200 },
  { name: "stats-api", method: "GET", path: "/api/stats", expectStatus: 200 },
  { name: "papers-api", method: "GET", path: "/api/papers", expectStatus: 200 },
];

function url(path) {
  return new URL(path, baseUrl).toString();
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index];
}

function summarize(records) {
  const durations = records.map((record) => record.durationMs);
  const failures = records.filter((record) => !record.ok);
  const byName = new Map();

  for (const record of records) {
    const current = byName.get(record.name) ?? [];
    current.push(record);
    byName.set(record.name, current);
  }

  const endpoints = [...byName.entries()].map(([name, items]) => {
    const endpointDurations = items.map((item) => item.durationMs);
    const endpointFailures = items.filter((item) => !item.ok);

    return {
      name,
      total: items.length,
      success: items.length - endpointFailures.length,
      failures: endpointFailures.length,
      avgMs:
        endpointDurations.reduce((sum, value) => sum + value, 0) /
        endpointDurations.length,
      p95Ms: percentile(endpointDurations, 0.95),
      maxMs: Math.max(...endpointDurations),
    };
  });

  return {
    totalRequests: records.length,
    successRequests: records.length - failures.length,
    failedRequests: failures.length,
    successRate:
      records.length === 0
        ? 0
        : ((records.length - failures.length) / records.length) * 100,
    avgMs: durations.reduce((sum, value) => sum + value, 0) / durations.length,
    minMs: Math.min(...durations),
    p50Ms: percentile(durations, 0.5),
    p90Ms: percentile(durations, 0.9),
    p95Ms: percentile(durations, 0.95),
    maxMs: Math.max(...durations),
    endpoints,
    failures: failures.slice(0, 20),
  };
}

async function request(name, method, path, cookie, body) {
  const startedAt = performance.now();
  const headers = cookie
    ? { Cookie: cookie, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  try {
    const response = await fetch(url(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    const durationMs = performance.now() - startedAt;

    return {
      name,
      method,
      path,
      status: response.status,
      durationMs,
      ok: true,
      bodySample: text.slice(0, 160),
    };
  } catch (error) {
    return {
      name,
      method,
      path,
      status: 0,
      durationMs: performance.now() - startedAt,
      ok: false,
      error: error.message,
    };
  }
}

async function login() {
  const result = await request("auth-login", "POST", "/api/auth/login", "", {
    username,
    password,
  });

  if (result.status === 200) {
    const response = await fetch(url("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    if (cookie) {
      return cookie;
    }
  }

  const registerResponse = await fetch(url("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(() => null);

  if (!registerResponse || registerResponse.status >= 500) {
    throw new Error(
      `Cannot login or register ${username}. Start the app and check smoke credentials.`,
    );
  }

  const retryResponse = await fetch(url("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const cookie = retryResponse.headers.get("set-cookie")?.split(";")[0];

  if (!retryResponse.ok || !cookie) {
    throw new Error(
      `Cannot obtain session cookie for ${username}: ${retryResponse.status}`,
    );
  }

  return cookie;
}

async function runVirtualUser(index) {
  const cookie = await login();
  const records = [];

  for (let loop = 0; loop < loops; loop += 1) {
    for (const item of requestPlan) {
      const record = await request(item.name, item.method, item.path, cookie);
      record.user = index + 1;
      record.loop = loop + 1;
      record.ok = record.status === item.expectStatus;
      if (!record.ok && !record.error) {
        record.error = `expected ${item.expectStatus}, got ${record.status}`;
      }
      records.push(record);
    }
  }

  return records;
}

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

async function main() {
  mkdirSync(outputDir, { recursive: true });

  const startedAt = performance.now();
  const allRecords = (await Promise.all(
    Array.from({ length: virtualUsers }, (_, index) => runVirtualUser(index)),
  )).flat();
  const durationSeconds = (performance.now() - startedAt) / 1000;
  const summary = summarize(allRecords);
  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    virtualUsers,
    loops,
    requestPlan,
    durationSeconds,
    throughputRps: summary.totalRequests / durationSeconds,
    summary,
    records: allRecords,
  };

  const text = [
    "实验七系统测试压测结果",
    `被测地址: ${baseUrl}`,
    `虚拟用户数: ${virtualUsers}`,
    `每用户循环次数: ${loops}`,
    `总请求数: ${summary.totalRequests}`,
    `成功请求数: ${summary.successRequests}`,
    `失败请求数: ${summary.failedRequests}`,
    `成功率: ${formatNumber(summary.successRate)}%`,
    `总耗时: ${formatNumber(durationSeconds)} s`,
    `吞吐量: ${formatNumber(result.throughputRps)} requests/s`,
    `平均响应时间: ${formatNumber(summary.avgMs)} ms`,
    `P50: ${formatNumber(summary.p50Ms)} ms`,
    `P90: ${formatNumber(summary.p90Ms)} ms`,
    `P95: ${formatNumber(summary.p95Ms)} ms`,
    `最大响应时间: ${formatNumber(summary.maxMs)} ms`,
    "",
    "分接口结果:",
    ...summary.endpoints.map(
      (item) =>
        `- ${item.name}: total=${item.total}, success=${item.success}, fail=${item.failures}, avg=${formatNumber(item.avgMs)} ms, p95=${formatNumber(item.p95Ms)} ms, max=${formatNumber(item.maxMs)} ms`,
    ),
    "",
    summary.failedRequests === 0
      ? "结论: 本次负载条件下所有请求均达到预期状态码，系统基本稳定。"
      : "结论: 本次负载条件下存在失败请求，需要优先排查失败接口和响应状态。",
  ].join("\n");

  writeFileSync(`${outputDir}/system-load-test.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${outputDir}/system-load-test.txt`, `\uFEFF${text}\n`);
  console.log(text);

  if (summary.failedRequests > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
