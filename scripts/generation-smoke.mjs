const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const smokeUsername = process.env.SMOKE_USERNAME || "smoke_admin";
const smokePassword = process.env.SMOKE_PASSWORD || "SmokePass123";
let authCookie = "";

const cases = [
  {
    practiceType: "listening",
    subtype: "picture-description",
    difficulty: "easy",
    tags: ["smoke", "picture"],
  },
  {
    practiceType: "listening",
    subtype: "question-response",
    difficulty: "medium",
    tags: ["smoke", "response"],
  },
  {
    practiceType: "listening",
    subtype: "short-conversation",
    difficulty: "medium",
    tags: ["smoke", "conversation"],
  },
  {
    practiceType: "listening",
    subtype: "short-talk",
    difficulty: "hard",
    tags: ["smoke", "talk"],
  },
  {
    practiceType: "grammar",
    subtype: "sentence-completion",
    difficulty: "easy",
    grammarPoint: "时态",
    tags: ["smoke", "grammar"],
  },
  {
    practiceType: "grammar",
    subtype: "part-of-speech",
    difficulty: "medium",
    grammarPoint: "词性",
    tags: ["smoke", "grammar"],
  },
  {
    practiceType: "grammar",
    subtype: "tense-voice",
    difficulty: "medium",
    grammarPoint: "时态 / 语态",
    tags: ["smoke", "grammar"],
  },
  {
    practiceType: "grammar",
    subtype: "preposition-conjunction",
    difficulty: "hard",
    grammarPoint: "介词 / 连词",
    tags: ["smoke", "grammar"],
  },
  {
    practiceType: "grammar",
    subtype: "business-context",
    difficulty: "hard",
    grammarPoint: "商务语境",
    tags: ["smoke", "grammar"],
  },
];

function validateQuestion(question, testcase) {
  const problems = [];
  const optionKeys = Object.keys(question?.options || {}).sort();

  if (!question?.id) problems.push("missing id");
  if (question?.type !== testcase.practiceType) problems.push("type mismatch");
  if (question?.subtype !== testcase.subtype) problems.push("subtype mismatch");
  if (question?.difficulty !== testcase.difficulty) {
    problems.push("difficulty mismatch");
  }
  if (!question?.prompt) problems.push("missing prompt");
  if (optionKeys.join(",") !== "A,B,C,D") problems.push("bad options");
  if (!["A", "B", "C", "D"].includes(question?.answer)) {
    problems.push("bad answer");
  }
  if (!question?.explanationZh) problems.push("missing explanationZh");
  if (testcase.practiceType === "listening" && !question?.listeningScript) {
    problems.push("missing listeningScript");
  }
  if (testcase.practiceType === "grammar" && !question?.grammarPoint) {
    problems.push("missing grammarPoint");
  }

  return problems;
}

function authHeaders(headers = {}) {
  return authCookie ? { ...headers, Cookie: authCookie } : headers;
}

async function loginOrSetup() {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: smokeUsername,
      password: smokePassword,
    }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    const message = payload?.error?.message || response.statusText;
    throw new Error(
      `Login failed for ${smokeUsername}: ${message}. Set SMOKE_USERNAME and SMOKE_PASSWORD if an admin already exists.`,
    );
  }

  const setCookie = response.headers.get("set-cookie");
  const sessionCookie = setCookie?.split(";")[0];

  if (!sessionCookie) {
    throw new Error("Login succeeded but no session cookie was returned.");
  }

  authCookie = sessionCookie;
}

async function runCase(testcase) {
  const started = Date.now();
  const response = await fetch(`${baseUrl}/api/ai/generate-questions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ ...testcase, count: 1 }),
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    return {
      type: testcase.practiceType,
      subtype: testcase.subtype,
      http: response.status,
      seconds,
      status: `FAIL: ${payload.error?.message || response.statusText}`,
    };
  }

  const question = payload.data.questions?.[0];
  const problems = validateQuestion(question, testcase);

  return {
    type: testcase.practiceType,
    subtype: testcase.subtype,
    http: response.status,
    seconds,
    id: question?.id || "",
    answer: question?.answer || "",
    status: problems.length ? `FAIL: ${problems.join("; ")}` : "PASS",
  };
}

await loginOrSetup();

const settingsResponse = await fetch(`${baseUrl}/api/settings`, {
  headers: authHeaders(),
});
const settings = await settingsResponse.json();

if (!settingsResponse.ok || !settings.ok || !settings.data.hasApiKey) {
  console.error("MaaS API Key is not configured or the dev server is unavailable.");
  process.exit(1);
}

const results = [];

for (const testcase of cases) {
  try {
    results.push(await runCase(testcase));
  } catch (error) {
    results.push({
      type: testcase.practiceType,
      subtype: testcase.subtype,
      http: "ERR",
      seconds: "0.0",
      id: "",
      answer: "",
      status: `FAIL: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

console.table(results);

if (results.some((result) => result.status !== "PASS")) {
  process.exit(1);
}
