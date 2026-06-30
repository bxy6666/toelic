const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const smokeUsername = process.env.SMOKE_USERNAME || "smoke_admin";
const smokePassword = process.env.SMOKE_PASSWORD || "SmokePass123";

let authCookie = "";

const results = {
  baseUrl,
  sourceKey: "",
  jobId: "",
  paperId: "",
  paperVersionId: "",
  status: "",
  importedItems: 0,
  missingAnswers: 0,
  draftCreated: false,
  historyVisible: false,
};

function url(path) {
  return new URL(path, baseUrl).toString();
}

function fail(message) {
  const error = new Error(message);
  error.smokeFailure = true;
  throw error;
}

function authHeaders(headers = {}) {
  return authCookie ? { ...headers, Cookie: authCookie } : headers;
}

async function readPayload(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { message: text.slice(0, 500) } };
  }
}

async function login() {
  const response = await fetch(url("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: smokeUsername, password: smokePassword }),
  }).catch((error) => {
    fail(`Dev server is not reachable at ${baseUrl}: ${error.message}`);
  });

  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok) {
    const message = payload?.error?.message || response.statusText;
    fail(
      `No usable smoke user. Login failed for "${smokeUsername}": ${message}. ` +
        "Create a user or set SMOKE_USERNAME/SMOKE_PASSWORD.",
    );
  }

  const setCookie = response.headers.get("set-cookie");
  authCookie = setCookie?.split(";")[0] || "";
  if (!authCookie) {
    fail("Login succeeded but no session cookie was returned.");
  }
}

function crc32(buffer) {
  const table =
    crc32.table ||
    (crc32.table = Array.from({ length: 256 }, (_, index) => {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      return value >>> 0;
    }));

  let value = 0xffffffff;
  for (const byte of buffer) {
    value = table[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function writeLocalHeader(nameBuffer, contentBuffer, checksum) {
  const { dosDate, dosTime } = dosDateTime();
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(contentBuffer.length, 18);
  header.writeUInt32LE(contentBuffer.length, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBuffer, contentBuffer]);
}

function writeCentralHeader(nameBuffer, contentBuffer, checksum, offset) {
  const { dosDate, dosTime } = dosDateTime();
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(checksum, 16);
  header.writeUInt32LE(contentBuffer.length, 20);
  header.writeUInt32LE(contentBuffer.length, 24);
  header.writeUInt16LE(nameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, nameBuffer]);
}

function createZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const contentBuffer = Buffer.from(file.content, "utf8");
    const checksum = crc32(contentBuffer);
    const local = writeLocalHeader(nameBuffer, contentBuffer, checksum);
    locals.push(local);
    centrals.push(writeCentralHeader(nameBuffer, contentBuffer, checksum, offset));
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralDirectory, end]);
}

function xmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(line) {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
}

function createDocxBuffer(lines) {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${lines.map(paragraph).join("\n    ")}
    <w:sectPr/>
  </w:body>
</w:document>`;

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: "word/document.xml",
      content: documentXml,
    },
  ]);
}

function createSmokeDocx() {
  return createDocxBuffer([
    "Part 5 Incomplete Sentences",
    "Choose the best answer to complete each sentence.",
    "1. The meeting ____ at 9 a.m. sharp.",
    "A. begin",
    "B. begins",
    "C. beginning",
    "D. began",
    "2. Please send the report ____ Friday.",
    "A. by",
    "B. at",
    "C. in",
    "D. over",
    "3. The new software is ____ than the old system.",
    "A. efficient",
    "B. most efficient",
    "C. more efficient",
    "D. efficiently",
    "Answer Key",
    "1 B",
    "2 A",
    "3 C",
  ]);
}

async function uploadImport() {
  const timePart = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17);
  const randomPart = Math.random().toString(36).slice(2, 7);
  const runId = `${timePart}-${randomPart}`;
  const sourceKey = `smoke-docx-${runId}`;
  const versionLabel = `docx-${runId}`;
  const fileName = `${sourceKey}.docx`;
  results.sourceKey = sourceKey;

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([createSmokeDocx()], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    fileName,
  );
  formData.append("title", `Smoke DOCX Import ${runId}`);
  formData.append("sourceKey", sourceKey);
  formData.append("versionLabel", versionLabel);

  const response = await fetch(url("/api/paper-imports"), {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok) {
    fail(
      `DOCX import upload failed: ${response.status} ${JSON.stringify(payload).slice(
        0,
        500,
      )}`,
    );
  }

  const job = payload.data;
  results.jobId = job.id;
  results.status = job.status;
  results.importedItems = job.result?.items?.length || 0;
  results.missingAnswers = job.result?.missingAnswerCount ?? -1;

  if (job.status !== "ready") {
    fail(`Import job was not ready after synchronous parse. Status: ${job.status}`);
  }
  if (results.importedItems !== 3 || results.missingAnswers !== 0) {
    fail(
      `Unexpected parse result: items=${results.importedItems}, missing=${results.missingAnswers}.`,
    );
  }

  return job;
}

async function verifyJob(jobId) {
  const response = await fetch(url(`/api/paper-imports/${jobId}`), {
    headers: authHeaders(),
  });
  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok) {
    fail(`Import job read failed: ${response.status} ${JSON.stringify(payload).slice(0, 500)}`);
  }

  const job = payload.data;
  if (job.id !== jobId || job.status !== "ready" || job.result?.items?.length !== 3) {
    fail(`Import job read returned an unexpected payload: ${JSON.stringify(job).slice(0, 500)}`);
  }
}

async function applyImport(jobId) {
  const response = await fetch(url(`/api/paper-imports/${jobId}/apply`), {
    method: "POST",
    headers: authHeaders(),
  });
  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok) {
    fail(`Import apply failed: ${response.status} ${JSON.stringify(payload).slice(0, 500)}`);
  }

  results.paperId = payload.data.paperId;
  results.paperVersionId = payload.data.paperVersionId;
  if (!results.paperId || !results.paperVersionId) {
    fail(`Apply did not return paperId and paperVersionId: ${JSON.stringify(payload.data)}`);
  }
}

async function verifyDraftPaper() {
  const response = await fetch(url(`/api/papers/${results.paperId}`), {
    headers: authHeaders(),
  });
  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok) {
    fail(`Created paper detail read failed: ${response.status} ${JSON.stringify(payload).slice(0, 500)}`);
  }

  const version = payload.data.versions?.find(
    (candidate) => candidate.id === results.paperVersionId,
  );
  if (!version) {
    fail("Created paper did not include the imported version.");
  }
  if (version.status !== "draft") {
    fail(`Imported version should remain draft, got ${version.status}.`);
  }
  if (version.items?.length !== 3 || version.sections?.length < 1) {
    fail(
      `Imported draft has unexpected shape: sections=${version.sections?.length}, items=${version.items?.length}.`,
    );
  }

  const answers = version.items.map((item) => item.answer?.choice).join(",");
  if (answers !== "B,A,C") {
    fail(`Imported answer mapping was not preserved. Expected B,A,C, got ${answers}.`);
  }

  results.draftCreated = true;
}

async function verifyHistory(jobId) {
  const response = await fetch(url("/api/paper-imports"), {
    headers: authHeaders(),
  });
  const payload = await readPayload(response);
  if (!response.ok || !payload?.ok || !Array.isArray(payload.data)) {
    fail(`Import history read failed: ${response.status} ${JSON.stringify(payload).slice(0, 500)}`);
  }

  results.historyVisible = payload.data.some(
    (job) => job.id === jobId && job.status === "applied",
  );
  if (!results.historyVisible) {
    fail(`Applied import job ${jobId} was not visible in recent import history.`);
  }
}

async function run() {
  await login();
  const job = await uploadImport();
  await verifyJob(job.id);
  await applyImport(job.id);
  await verifyDraftPaper();
  await verifyHistory(job.id);
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error.smokeFailure ? error.message : error);
  console.log(JSON.stringify(results, null, 2));
  process.exitCode = 1;
});
