import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const runtimeRequire = createRequire(
  "C:/Users/ALGH/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json",
);
const pptxgen = runtimeRequire("pptxgenjs");
const sharp = runtimeRequire("sharp");
const JSZip = runtimeRequire("jszip");

const root = "E:/托业";
const outDir = path.join(root, "output/presentation");
const previewDir = path.join(outDir, "previews");
const assetDir = path.join(outDir, "assets");
const deckPath = path.join(outDir, "toeic-practice-studio-final-report.pptx");
const notesPath = path.join(outDir, "speaker-notes.md");
const manifestPath = path.join(outDir, "manifest.json");

fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const W = 13.333;
const H = 7.5;
const PXW = 1920;
const PXH = 1080;
const S = PXW / W;

const C = {
  ink: "17342F",
  deep: "235448",
  muted: "59716A",
  paper: "FBFCF4",
  cream: "FFF5DA",
  white: "FFFFFF",
  line: "CFE3D7",
  mint: "DDF5E8",
  green: "3B8F6E",
  green2: "6FBE97",
  lime: "BFE8A8",
  orange: "F2A45D",
  yellow: "FFE08A",
  blue: "5B8DEF",
  cyan: "84D8D5",
  rose: "E8868B",
  grape: "A78BFA",
};

const screenshots = {
  home: "output/playwright/v1-6-home-desktop.png",
  homeMobile: "output/playwright/v1-6-home-mobile.png",
  listening: "output/playwright/v1-4-listening-desktop.png",
  listeningMobile: "output/playwright/v1-4-listening-mobile.png",
  grammar: "output/playwright/v1-4-grammar-desktop.png",
  grammarMobile: "output/playwright/v1-4-grammar-mobile.png",
  mistakes: "output/playwright/public-desktop-mistakes.png",
  stats: "output/playwright/v1-7-stats-chart-color-fix-desktop.png",
  statsMobile: "output/playwright/v1-7-stats-mobile.png",
  settings: "output/playwright/public-desktop-settings.png",
  publicStats: "output/playwright/public-desktop-stats.png",
};

const img = Object.fromEntries(
  Object.entries(screenshots).map(([key, rel]) => [key, path.join(root, rel)]),
);

for (const [key, file] of Object.entries(img)) {
  if (!fs.existsSync(file)) throw new Error(`Missing screenshot ${key}: ${file}`);
}

const imageMeta = new Map();

const umlAssets = {
  useCase: path.join(assetDir, "uml-use-case.png"),
  activity: path.join(assetDir, "uml-activity-flow.png"),
  classModel: path.join(assetDir, "uml-class-model.png"),
  sequence: path.join(assetDir, "uml-sequence-ai-generation.png"),
};

const docAssets = {
  spec: path.join(assetDir, "doc-spec-driven-spec.png"),
  design: path.join(assetDir, "doc-design-architecture.png"),
  tasks: path.join(assetDir, "doc-tasks-progress.png"),
  acceptance: path.join(assetDir, "doc-acceptance-proof.png"),
};

const architectureAsset = path.join(assetDir, "architecture-gpt-generated.png");
const generatedArchitectureSource = "C:/Users/ALGH/.codex/generated_images/019e1061-8f36-7633-98db-856dc7cd99c5/ig_05543dde432fccbf016a00284a3d0c8195af64c8b19bc2c139.png";
const generatedUmlSources = {
  useCase: "C:/Users/ALGH/.codex/generated_images/019e1061-8f36-7633-98db-856dc7cd99c5/ig_05543dde432fccbf016a002902ba18819594bd1b13cd85ef23.png",
  activity: "C:/Users/ALGH/.codex/generated_images/019e1061-8f36-7633-98db-856dc7cd99c5/ig_05543dde432fccbf016a002947e2188195a0afc5df440926c2.png",
  classModel: "C:/Users/ALGH/.codex/generated_images/019e1061-8f36-7633-98db-856dc7cd99c5/ig_05543dde432fccbf016a00298821b08195aadd39b6b9b4f91a.png",
  sequence: "C:/Users/ALGH/.codex/generated_images/019e1061-8f36-7633-98db-856dc7cd99c5/ig_05543dde432fccbf016a0029cb08c481958976a4d26cb47a67.png",
};

async function getImageMeta(file) {
  if (!imageMeta.has(file)) imageMeta.set(file, await sharp(file).metadata());
  return imageMeta.get(file);
}

async function fitImageContain(file, x, y, w, h) {
  const meta = await getImageMeta(file);
  const ar = meta.width / meta.height;
  const box = w / h;
  if (ar > box) {
    const ih = w / ar;
    return { x, y: y + (h - ih) / 2, w, h: ih };
  }
  const iw = h * ar;
  return { x: x + (w - iw) / 2, y, w: iw, h };
}

async function fitImageCover(file, x, y, w, h) {
  const meta = await getImageMeta(file);
  const ar = meta.width / meta.height;
  const box = w / h;
  if (ar > box) {
    const iw = h * ar;
    return { x: x - (iw - w) / 2, y, w: iw, h };
  }
  const ih = w / ar;
  return { x, y: y - (ih - h) / 2, w, h: ih };
}

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, max = 18) {
  const out = [];
  let line = "";
  for (const ch of String(text)) {
    const wide = /[^\x00-\xff]/.test(ch) ? 1 : 0.55;
    const len = [...line].reduce((a, c) => a + (/[^\x00-\xff]/.test(c) ? 1 : 0.55), 0);
    if (len + wide > max && line) {
      out.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) out.push(line);
  return out;
}

function addText(slide, text, opt = {}) {
  slide.addText(text, {
    fontFace: "Microsoft YaHei",
    margin: opt.margin ?? 0,
    fit: opt.fit ?? "shrink",
    breakLine: false,
    color: opt.color ?? C.ink,
    ...opt,
  });
}

function addShape(slide, type, opt) {
  slide.addShape(type, opt);
}

function svgBox(x, y, w, h, title, lines = [], color = C.green) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="#${color}" stroke-width="3"/>
  <text x="${x + 22}" y="${y + 36}" font-family="Microsoft YaHei, Arial" font-size="25" font-weight="800" fill="#${color}">${esc(title)}</text>
  ${lines.map((line, i) => `<text x="${x + 22}" y="${y + 76 + i * 28}" font-family="Microsoft YaHei, Arial" font-size="19" fill="#${C.ink}">${esc(line)}</text>`).join("")}`;
}

function svgActor(x, y, label) {
  return `<circle cx="${x}" cy="${y}" r="28" fill="#${C.mint}" stroke="#${C.green}" stroke-width="3"/>
  <line x1="${x}" y1="${y + 28}" x2="${x}" y2="${y + 105}" stroke="#${C.green}" stroke-width="7"/>
  <line x1="${x - 45}" y1="${y + 62}" x2="${x + 45}" y2="${y + 62}" stroke="#${C.green}" stroke-width="7"/>
  <line x1="${x}" y1="${y + 105}" x2="${x - 42}" y2="${y + 160}" stroke="#${C.green}" stroke-width="7"/>
  <line x1="${x}" y1="${y + 105}" x2="${x + 42}" y2="${y + 160}" stroke="#${C.green}" stroke-width="7"/>
  <text x="${x}" y="${y + 205}" font-family="Microsoft YaHei, Arial" font-size="23" font-weight="800" fill="#${C.ink}" text-anchor="middle">${esc(label)}</text>`;
}

function svgArrow(x1, y1, x2, y2, color = C.green, dash = false) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#${color}" stroke-width="4" ${dash ? 'stroke-dasharray="10 8"' : ""} marker-end="url(#arrow)"/>`;
}

async function writeSvgPng(file, body, w = 1600, h = 900) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#${C.green}"/></marker></defs>
  <rect width="${w}" height="${h}" rx="32" fill="#${C.paper}"/>
  <circle cx="${w - 80}" cy="60" r="190" fill="#${C.mint}" opacity=".65"/>
  <circle cx="40" cy="${h - 30}" r="160" fill="#FFE8B2" opacity=".55"/>
  ${body}
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
}

async function buildUmlAssets() {
  await writeSvgPng(umlAssets.useCase, `
    <text x="64" y="76" font-family="Microsoft YaHei, Arial" font-size="34" font-weight="900" fill="#${C.ink}">UML 用例图：TOEIC 学习系统需求边界</text>
    ${svgActor(135, 260, "学习者")}
    ${svgActor(1445, 260, "MaaS 服务")}
    <rect x="350" y="130" width="900" height="650" rx="30" fill="#fff" stroke="#${C.line}" stroke-width="4"/>
    <text x="800" y="176" font-family="Microsoft YaHei, Arial" font-size="24" font-weight="800" fill="#${C.green}" text-anchor="middle">TOEIC Practice Studio</text>
    ${[["生成听力题", 555, 260, C.green], ["生成语法题", 860, 260, C.green], ["完成练习", 555, 430, C.blue], ["查看解析", 860, 430, C.blue], ["错题复练", 555, 600, C.orange], ["查看统计", 860, 600, C.rose]].map(([t,x,y,c]) => `<ellipse cx="${x}" cy="${y}" rx="125" ry="48" fill="#fff" stroke="#${c}" stroke-width="4"/><text x="${x}" y="${y + 8}" font-family="Microsoft YaHei, Arial" font-size="22" font-weight="800" fill="#${C.ink}" text-anchor="middle">${t}</text>`).join("")}
    ${svgArrow(220, 330, 430, 260)} ${svgArrow(220, 340, 430, 430)} ${svgArrow(220, 355, 430, 600)}
    ${svgArrow(680, 260, 735, 260)} ${svgArrow(680, 430, 735, 430, C.blue, true)} ${svgArrow(680, 600, 735, 600, C.orange, true)}
    ${svgArrow(985, 260, 1335, 315)} ${svgArrow(985, 430, 1335, 360, C.blue, true)}
    <text x="80" y="840" font-family="Microsoft YaHei, Arial" font-size="22" font-weight="800" fill="#${C.deep}">设计说明：用例图把零散功能收束为参与者、系统边界与核心需求。</text>
  `);

  await writeSvgPng(umlAssets.activity, `
    <text x="64" y="76" font-family="Microsoft YaHei, Arial" font-size="34" font-weight="900" fill="#${C.ink}">UML 活动图：从生成题目到学习反馈</text>
    ${[["选择题型与参数", 165, 200, C.green], ["调用本地 API", 435, 200, C.blue], ["MaaS 生成题目", 705, 200, C.orange], ["校验并落库", 975, 200, C.rose], ["作答提交", 1245, 200, C.green], ["记录/错题/统计", 700, 525, C.deep]].map(([t,x,y,c]) => `<rect x="${x}" y="${y}" width="190" height="80" rx="24" fill="#fff" stroke="#${c}" stroke-width="4"/><text x="${x + 95}" y="${y + 50}" font-family="Microsoft YaHei, Arial" font-size="21" font-weight="800" fill="#${C.ink}" text-anchor="middle">${t}</text>`).join("")}
    ${svgArrow(355, 240, 425, 240)} ${svgArrow(625, 240, 695, 240)} ${svgArrow(895, 240, 965, 240)} ${svgArrow(1165, 240, 1235, 240)}
    ${svgArrow(1340, 285, 800, 515)}
    <polygon points="700,360 770,425 700,490 630,425" fill="#fff" stroke="#${C.orange}" stroke-width="4"/>
    <text x="700" y="433" font-family="Microsoft YaHei, Arial" font-size="20" font-weight="800" fill="#${C.ink}" text-anchor="middle">答错?</text>
    ${svgArrow(700, 280, 700, 352)}
    ${svgArrow(630, 425, 540, 565, C.orange)}
    ${svgArrow(770, 425, 860, 565, C.green)}
    <text x="505" y="600" font-family="Microsoft YaHei, Arial" font-size="19" fill="#${C.orange}">是：更新错题</text>
    <text x="870" y="600" font-family="Microsoft YaHei, Arial" font-size="19" fill="#${C.green}">否：记录正确</text>
    <text x="80" y="840" font-family="Microsoft YaHei, Arial" font-size="22" font-weight="800" fill="#${C.deep}">设计说明：活动图表达业务流程、分支条件与数据沉淀路径。</text>
  `);

  await writeSvgPng(umlAssets.classModel, `
    <text x="64" y="76" font-family="Microsoft YaHei, Arial" font-size="34" font-weight="900" fill="#${C.ink}">UML 类图：核心对象与关系</text>
    ${svgBox(90, 155, 315, 230, "Question", ["id, type, stem", "optionsJson, answer", "explanation, tagsJson"], C.green)}
    ${svgBox(520, 155, 350, 230, "PracticeRecord", ["questionId, selected", "isCorrect, createdAt", "记录每次作答"], C.blue)}
    ${svgBox(520, 520, 350, 230, "Mistake", ["questionId, wrongCount", "status, lastWrongAt", "new/reviewing/mastered"], C.orange)}
    ${svgBox(1010, 315, 350, 230, "UserSetting", ["difficulty, count", "speechRate", "本地学习偏好"], C.rose)}
    ${svgArrow(405, 260, 520, 260)} <text x="430" y="246" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.muted}">1..*</text>
    ${svgArrow(695, 385, 695, 520, C.orange)} <text x="715" y="460" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.muted}">答错创建/更新</text>
    ${svgArrow(405, 305, 520, 620, C.orange, true)}
    <text x="100" y="835" font-family="Microsoft YaHei, Arial" font-size="22" font-weight="800" fill="#${C.deep}">设计说明：类图将数据库模型抽象为对象模型，展示静态结构。</text>
  `);

  await writeSvgPng(umlAssets.sequence, `
    <text x="64" y="76" font-family="Microsoft YaHei, Arial" font-size="34" font-weight="900" fill="#${C.ink}">UML 时序图：AI 题目生成调用链</text>
    ${["前端页面", "API Route", "MaaS Client", "MaaS 服务", "SQLite"].map((t, i) => `<rect x="${150 + i * 285}" y="135" width="165" height="58" rx="16" fill="#fff" stroke="#${[C.green,C.blue,C.orange,C.rose,C.deep][i]}" stroke-width="4"/><text x="${232 + i * 285}" y="172" font-family="Microsoft YaHei, Arial" font-size="21" font-weight="800" fill="#${C.ink}" text-anchor="middle">${t}</text><line x1="${232 + i * 285}" y1="193" x2="${232 + i * 285}" y2="720" stroke="#${C.line}" stroke-width="3" stroke-dasharray="12 9"/>`).join("")}
    ${svgArrow(232, 260, 517, 260)} <text x="285" y="238" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">POST 生成请求</text>
    ${svgArrow(517, 350, 802, 350, C.blue)} <text x="570" y="328" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">构造 Prompt</text>
    ${svgArrow(802, 440, 1087, 440, C.orange)} <text x="860" y="418" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">Chat Completions</text>
    ${svgArrow(1087, 520, 802, 520, C.rose, true)} <text x="890" y="498" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">返回 JSON</text>
    ${svgArrow(802, 600, 1372, 600, C.deep)} <text x="900" y="578" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">解析、校验、落库</text>
    ${svgArrow(517, 680, 232, 680, C.green, true)} <text x="300" y="658" font-family="Microsoft YaHei, Arial" font-size="18" fill="#${C.ink}">返回题目列表</text>
    <text x="80" y="840" font-family="Microsoft YaHei, Arial" font-size="22" font-weight="800" fill="#${C.deep}">设计说明：时序图说明对象交互顺序、接口调用和异常边界。</text>
  `);
}

function pickLines(file, start, end) {
  return fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/).slice(start - 1, end);
}

async function writeDocShot(file, title, subtitle, lines, highlights = []) {
  const lineH = 30;
  const body = lines.slice(0, 18).map((line, i) => {
    const y = 178 + i * lineH;
    const isHot = highlights.some((h) => line.includes(h));
    return `${isHot ? `<rect x="84" y="${y - 22}" width="1328" height="28" rx="8" fill="#${C.mint}" opacity=".95"/>` : ""}
    <text x="102" y="${y}" font-family="Consolas, Microsoft YaHei, monospace" font-size="21" fill="#${isHot ? C.deep : C.ink}" font-weight="${isHot ? 800 : 500}">${esc(line || " ")}</text>`;
  }).join("");
  await writeSvgPng(file, `
    <rect x="64" y="70" width="1440" height="760" rx="30" fill="#fff" stroke="#${C.line}" stroke-width="4"/>
    <circle cx="112" cy="112" r="12" fill="#${C.rose}"/><circle cx="150" cy="112" r="12" fill="#${C.orange}"/><circle cx="188" cy="112" r="12" fill="#${C.green}"/>
    <text x="235" y="123" font-family="Microsoft YaHei, Arial" font-size="28" font-weight="900" fill="#${C.ink}">${esc(title)}</text>
    <text x="235" y="158" font-family="Microsoft YaHei, Arial" font-size="19" font-weight="700" fill="#${C.muted}">${esc(subtitle)}</text>
    <line x1="84" y1="178" x2="1420" y2="178" stroke="#${C.line}" stroke-width="3"/>
    ${body}
  `);
}

async function buildDocAssets() {
  await writeDocShot(
    docAssets.spec,
    "spec.md",
    "Spec-driven 流程与开发边界",
    [...pickLines("spec.md", 8, 20), "", ...pickLines("spec.md", 495, 506)],
    ["Gate", "后续任何新需求", "验收标准", "Approved"],
  );
  await writeDocShot(
    docAssets.design,
    "design.md",
    "架构、数据、API、MaaS 与测试策略",
    [...pickLines("design.md", 25, 38), "", ...pickLines("design.md", 545, 595)],
    ["分层结构", "MaaS Client", "JSON", "校验"],
  );
  await writeDocShot(
    docAssets.tasks,
    "tasks.md",
    "T01-T22 任务推进矩阵",
    pickLines("tasks.md", 33, 58),
    ["DONE", "T06", "T09", "T12", "T17", "T22"],
  );
  await writeDocShot(
    docAssets.acceptance,
    "acceptance.md",
    "PASS / FAIL 证据化验收记录",
    [...pickLines("acceptance.md", 8, 24), "", ...pickLines("acceptance.md", 68, 72)],
    ["PASS", "lint", "build", "Browser smoke", "MaaS"],
  );
}

async function buildArchitectureAsset() {
  if (!fs.existsSync(generatedArchitectureSource)) throw new Error(`Missing generated architecture image: ${generatedArchitectureSource}`);
  fs.copyFileSync(generatedArchitectureSource, architectureAsset);
}

async function buildGeneratedUmlAssets() {
  for (const [key, source] of Object.entries(generatedUmlSources)) {
    if (!fs.existsSync(source)) throw new Error(`Missing GPT-generated UML image ${key}: ${source}`);
    fs.copyFileSync(source, umlAssets[key]);
  }
}

function addLine(slide, x, y, w, h, color = C.green, width = 2) {
  addShape(slide, pptx.ShapeType.line, {
    x, y, w, h,
    line: { color, width, beginArrowType: "none", endArrowType: w || h ? "triangle" : "none" },
  });
}

function addBg(slide, section = "normal") {
  const fill = section === "cover" ? C.cream : C.paper;
  slide.background = { color: fill };
  addShape(slide, pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: fill }, line: { color: fill } });
  addShape(slide, pptx.ShapeType.arc, { x: 10.7, y: -1.25, w: 3.2, h: 3.2, rotate: 25, adjustPoint: 0.35, fill: { color: C.mint, transparency: 8 }, line: { color: C.mint, transparency: 100 } });
  addShape(slide, pptx.ShapeType.arc, { x: -0.85, y: 6.0, w: 2.7, h: 2.7, rotate: -16, adjustPoint: 0.35, fill: { color: "FFE8B2", transparency: 15 }, line: { color: "FFE8B2", transparency: 100 } });
  for (let i = 0; i < 4; i++) {
    addShape(slide, pptx.ShapeType.line, {
      x: 0.55 + i * 0.18, y: 0.22, w: 0.09, h: 0,
      line: { color: i % 2 ? C.orange : C.green, width: 2, transparency: 25 },
    });
  }
}

function addHeader(slide, title, eyebrow = "TOEIC Practice Studio") {
  addText(slide, eyebrow, { x: 0.58, y: 0.35, w: 3.6, h: 0.24, fontSize: 10.5, bold: true, color: C.green });
  addText(slide, title, { x: 0.58, y: 0.68, w: 8.9, h: 0.55, fontSize: 23, bold: true, color: C.ink });
  addShape(slide, pptx.ShapeType.line, { x: 0.6, y: 1.33, w: 1.08, h: 0, line: { color: C.orange, width: 2.5 } });
}

function addFooter(slide, index, tag = "课堂汇报增强版") {
  addText(slide, tag, { x: 0.58, y: 7.05, w: 3.1, h: 0.18, fontSize: 8.5, color: C.muted });
  addText(slide, String(index).padStart(2, "0"), { x: 12.15, y: 7.02, w: 0.55, h: 0.2, fontSize: 9, bold: true, color: C.green, align: "right" });
}

function pill(slide, text, x, y, w, color = C.green, fill = C.white) {
  addShape(slide, pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34, rectRadius: 0.06,
    fill: { color: fill, transparency: fill === C.white ? 0 : 5 },
    line: { color, width: 1.3 },
  });
  addText(slide, text, { x: x + 0.12, y: y + 0.075, w: w - 0.24, h: 0.12, fontSize: 8.8, bold: true, color, align: "center" });
}

function noteLabel(slide, text, x, y, color = C.green) {
  addShape(slide, pptx.ShapeType.line, { x: x - 0.18, y: y + 0.1, w: 0.12, h: 0, line: { color, width: 2.1 } });
  addText(slide, text, { x, y, w: 2.7, h: 0.24, fontSize: 10.3, bold: true, color });
}

function bubble(slide, text, x, y, w, color = C.green) {
  addShape(slide, pptx.ShapeType.wedgeRoundRectCallout, {
    x, y, w, h: 0.74, rectRadius: 0.08,
    fill: { color: C.white },
    line: { color, width: 1.2 },
  });
  addText(slide, text, { x: x + 0.17, y: y + 0.18, w: w - 0.32, h: 0.25, fontSize: 10.5, bold: true, color: C.ink, align: "center" });
}

function addMascot(slide, x, y, scale = 1, pose = "book") {
  const s = scale;
  addShape(slide, pptx.ShapeType.ellipse, { x: x + 0.24 * s, y, w: 0.62 * s, h: 0.62 * s, fill: { color: "FFE0B2" }, line: { color: "D9A56A", width: 0.8 } });
  addShape(slide, pptx.ShapeType.arc, { x: x + 0.21 * s, y: y - 0.04 * s, w: 0.68 * s, h: 0.36 * s, rotate: 180, adjustPoint: 0.35, fill: { color: C.deep }, line: { color: C.deep } });
  addShape(slide, pptx.ShapeType.ellipse, { x: x + 0.42 * s, y: y + 0.25 * s, w: 0.04 * s, h: 0.04 * s, fill: { color: C.ink }, line: { color: C.ink } });
  addShape(slide, pptx.ShapeType.ellipse, { x: x + 0.64 * s, y: y + 0.25 * s, w: 0.04 * s, h: 0.04 * s, fill: { color: C.ink }, line: { color: C.ink } });
  addShape(slide, pptx.ShapeType.arc, { x: x + 0.45 * s, y: y + 0.32 * s, w: 0.26 * s, h: 0.15 * s, adjustPoint: 0.2, fill: { color: "FFFFFF", transparency: 100 }, line: { color: C.rose, width: 1 } });
  addShape(slide, pptx.ShapeType.roundRect, { x: x + 0.15 * s, y: y + 0.62 * s, w: 0.82 * s, h: 0.75 * s, rectRadius: 0.06, fill: { color: C.green }, line: { color: C.green } });
  addShape(slide, pptx.ShapeType.line, { x: x + 0.23 * s, y: y + 0.78 * s, w: -0.22 * s, h: pose === "point" ? -0.3 * s : 0.18 * s, line: { color: C.green, width: 3 } });
  addShape(slide, pptx.ShapeType.line, { x: x + 0.89 * s, y: y + 0.78 * s, w: 0.24 * s, h: pose === "point" ? -0.27 * s : 0.2 * s, line: { color: C.green, width: 3 } });
  if (pose === "book") {
    addShape(slide, pptx.ShapeType.rect, { x: x + 0.32 * s, y: y + 0.95 * s, w: 0.53 * s, h: 0.32 * s, fill: { color: C.yellow }, line: { color: C.orange, width: 1 } });
    addShape(slide, pptx.ShapeType.line, { x: x + 0.59 * s, y: y + 0.95 * s, w: 0, h: 0.32 * s, line: { color: C.orange, width: 1 } });
  }
}

function addMiniTable(slide, rows, x, y, colW, rowH = 0.38) {
  rows.forEach((row, r) => {
    let cx = x;
    row.forEach((cell, c) => {
      const fill = r === 0 ? C.deep : r % 2 ? C.white : "F0F8F1";
      addShape(slide, pptx.ShapeType.rect, { x: cx, y: y + r * rowH, w: colW[c], h: rowH, fill: { color: fill }, line: { color: C.line, width: 0.8 } });
      addText(slide, cell, { x: cx + 0.08, y: y + r * rowH + 0.105, w: colW[c] - 0.16, h: 0.11, fontSize: r === 0 ? 8.8 : 8.3, color: r === 0 ? C.white : C.ink, bold: r === 0, align: c === 0 ? "center" : "left" });
      cx += colW[c];
    });
  });
}

async function addScreenshotPanel(slide, file, x, y, w, h, label, opts = {}) {
  const mode = opts.mode ?? "contain";
  addShape(slide, pptx.ShapeType.roundRect, {
    x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, rectRadius: 0.04,
    fill: { color: C.white },
    line: { color: opts.border ?? C.line, width: 1.1 },
    shadow: { type: "outer", color: "A9B9B1", opacity: 0.16, blur: 2, angle: 45, distance: 1 },
  });
  slide.addImage({
    path: file,
    x, y, w, h,
    sizing: { type: mode, x, y, w, h },
  });
  if (label) {
    addShape(slide, pptx.ShapeType.roundRect, { x: x + 0.14, y: y + 0.13, w: Math.min(2.7, w - 0.28), h: 0.32, rectRadius: 0.05, fill: { color: opts.labelColor ?? C.deep, transparency: 6 }, line: { color: opts.labelColor ?? C.deep, transparency: 100 } });
    addText(slide, label, { x: x + 0.28, y: y + 0.215, w: Math.min(2.45, w - 0.56), h: 0.09, fontSize: 8.4, bold: true, color: C.white, align: "center" });
  }
}

function addDenseContentBlock(slide, title, bullets, x, y, w, color = C.green) {
  noteLabel(slide, title, x, y, color);
  bullets.forEach((b, i) => {
    const yy = y + 0.42 + i * 0.45;
    addShape(slide, pptx.ShapeType.ellipse, { x, y: yy + 0.06, w: 0.1, h: 0.1, fill: { color }, line: { color } });
    addText(slide, b, { x: x + 0.22, y: yy, w, h: 0.22, fontSize: 10.8, color: C.ink });
  });
}

const slides = [
  {
    kind: "cover",
    title: "TOEIC Practice Studio",
    subtitle: "AI 驱动的托业练习工作室：从 spec-driven coding 到课堂可演示产品",
    takeaway: "一套能生成、练习、复盘、统计的本地个人版学习闭环",
    notes: [
      "开场先说明项目不是单纯页面展示，而是一次从需求、设计、实现到验收的完整工程实践。",
      "本次汇报会同时展示开发方法、技术路线、核心功能、验收证据和总结反思。",
      "这版 PPT 使用项目真实截图，但截图全部保持原始比例，不再横向拉伸。",
    ],
  },
  {
    kind: "agenda",
    title: "今天用四条线讲清楚这个项目",
    items: [
      ["开发流程", "spec-driven coding 如何把想法变成可验收任务"],
      ["技术路线", "Next.js + 本地 API + SQLite + MaaS 的边界设计"],
      ["功能成果", "听力、语法、错题、统计形成学习闭环"],
      ["验收反思", "用验收记录和反思说明项目如何从可用走向可靠"],
    ],
    notes: [
      "这页给听众建立路线感：先讲为什么做，再讲怎么做，最后看成果。",
      "汇报的重点不是炫功能，而是说明开发过程和方法是否可复用。",
      "后面的每一页都会尽量用证据、截图或流程图支撑，而不是堆文字。",
    ],
  },
  {
    kind: "pain",
    title: "学习痛点：题做了很多，但反馈链路经常断开",
    points: [
      ["听力", "答题前偷看选项会削弱真实训练感；播放、作答、解析经常分散在不同工具。"],
      ["语法", "题源分散，解析质量不稳定，中文学习者需要更贴近语法点的说明。"],
      ["复盘", "错题、掌握状态、重复错误次数如果不能沉淀，下一次复习很难精准。"],
      ["统计", "只知道做了题，不知道薄弱点在哪里，也看不出短期趋势。"],
    ],
    notes: [
      "这页要把项目动机讲具体：不是为了做一个 AI 玩具，而是补上学习闭环。",
      "四个痛点对应后续四个功能区，也方便课堂听众理解产品为什么这样设计。",
      "听力隐藏选项是一个很小但很关键的学习规则，后面会重点展示。",
    ],
  },
  {
    kind: "goal",
    title: "产品目标：本地个人版 TOEIC 学习闭环",
    notes: [
      "产品定位是本地个人版，降低复杂度，避免先做账号、云同步和权限系统。",
      "真正的价值在闭环：生成题目只是入口，答题记录、错题和统计才让练习可持续。",
      "本地 SQLite 保存学习数据，服务端读取 API Key，前端只负责学习体验。",
    ],
  },
  {
    kind: "umlUseCase",
    title: "用户流程：一次练习如何留下可复盘的痕迹",
    steps: ["选择题型", "AI 生成", "作答提交", "即时解析", "错题沉淀", "统计反馈"],
    notes: [
      "这页把产品主流程讲成一条用户旅程，便于后面切到技术实现。",
      "每个节点都有对应的数据或交互：题目、记录、错题状态、统计结果。",
      "闭环的意思是下一次练习会从上一次的错误和统计中得到反馈。",
    ],
  },
  {
    kind: "method",
    title: "开发方法：先让需求可审阅，再让实现可验收",
    notes: [
      "spec-driven coding 的价值是把模糊想法转成可讨论的规格，再把规格拆成任务。",
      "开发过程不是直接写页面，而是先约定边界、数据、接口、安全和验收标准。",
      "对于课堂项目，这种方法能清楚展示“我如何推进项目”，而不只是“我做出了什么”。",
    ],
  },
  {
    kind: "docs",
    title: "需求到实现：四份文档把开发链路串起来",
    docs: [
      ["spec.md", "定义范围、学习规则、安全边界、功能验收"],
      ["design.md", "确定页面、API、数据模型、Prompt、测试策略"],
      ["tasks.md", "拆成 T01-T22 小步任务，逐项推进"],
      ["acceptance.md", "记录 PASS / FAIL / BLOCKED / SKIP 与验证方式"],
    ],
    notes: [
      "这页可以结合项目根目录的四份文档讲过程。",
      "重点强调每个文档都有出口条件：不是写完就算，而是能指导下一步。",
      "这种流程让后续修改更可控，也让课堂汇报有明确证据。",
    ],
  },
  {
    kind: "taskMatrix",
    title: "推进证据：T01-T22 从骨架到体验迭代全部完成",
    notes: [
      "这一页用矩阵展示任务推进，避免只是口头说“项目已经完善”。",
      "T01-T15 是 MVP 主链路，T16-T22 是 UI、动效、复练、统计和展示体验增强。",
      "课堂讲解时可以挑 T06、T09、T12、T17、T22 作为关键里程碑。",
    ],
  },
  {
    kind: "architecture",
    title: "技术架构：前端体验与本地后端边界分离",
    notes: [
      "这页说明技术路线：前端用 Next.js App Router，后端用本地 API Route。",
      "MaaS 调用和 API Key 留在服务端，SQLite 保存题目、记录、错题和设置。",
      "这样既适合本地课堂演示，也避免把敏感配置暴露到浏览器。",
    ],
  },
  {
    kind: "umlClass",
    title: "数据模型：四张表支撑完整学习闭环",
    notes: [
      "Question 保存 AI 生成题目，PracticeRecord 保存每次作答。",
      "Mistake 聚合错误状态和 wrongCount，UserSetting 保存学习偏好。",
      "这个模型没有过度复杂，但足够支持生成、练习、错题、统计四个核心功能。",
    ],
  },
  {
    kind: "umlSequence",
    title: "AI 生成链路：不让模型输出直接进入业务",
    notes: [
      "这里强调 AI 调用不是直接相信模型，而是经过 JSON 解析和字段校验。",
      "听力题必须有 listeningScript，语法题必须有 grammarPoint，非法结构不落库。",
      "这种边界处理比单纯接入一个生成接口更接近真实工程实践。",
    ],
  },
  {
    kind: "security",
    title: "安全边界：API Key 只在服务端，本地配置不进前端",
    notes: [
      "这页讲安全验收：前端不持有完整 API Key，不使用 NEXT_PUBLIC 暴露敏感变量。",
      "设置页只显示 hasApiKey 等状态，不回显完整 Key。",
      "汇报材料也不会展示本地环境文件、真实密钥或敏感日志。",
    ],
  },
  {
    kind: "feature",
    title: "听力练习：隐藏选项让训练更接近真实考试",
    image: img.listening,
    mobile: img.listeningMobile,
    callouts: ["答题前只显示 A/B/C/D 和隐藏提示", "Web Speech 播放听力脚本", "提交后展示答案、解析与选项正文"],
    notes: [
      "听力页是最能体现学习规则的页面：答题前不能提前看英文选项正文。",
      "播放与答题在同一工作区完成，提交后才展示完整解析。",
      "截图使用等比例 contain 展示，移动端截图作为响应式证明。",
    ],
  },
  {
    kind: "feature",
    title: "语法练习：生成题变成可复盘的知识点训练",
    image: img.grammar,
    mobile: img.grammarMobile,
    callouts: ["选择语法点、难度和题量", "提交后即时反馈", "中文解析与语法点一起沉淀"],
    notes: [
      "语法页和听力页复用练习工作区，但交互规则不同。",
      "课堂演示时可以生成一题、提交答案，再指出解析和语法点如何帮助复盘。",
      "这页的重点是“题目不是一次性消费品”，它会进入记录和错题链路。",
    ],
  },
  {
    kind: "mistakes",
    title: "错题本：让每一次错误都变成下一次练习入口",
    notes: [
      "错题本不只是列表，而是包含重新练习、标记掌握和移除状态。",
      "长截图不整张压扁，而是使用局部聚焦区展示核心功能。",
      "wrongCount 和状态变化让复盘从静态记录变成动态学习过程。",
    ],
  },
  {
    kind: "stats",
    title: "学习统计：把练习结果变成可行动反馈",
    notes: [
      "统计页展示正确率、趋势、薄弱点和当前错题，帮助用户决定下一步练哪里。",
      "V1.7 把统计页做成轻卡通仪表盘，让数据更适合课堂展示。",
      "桌面和移动截图同时出现，说明页面经过响应式巡检。",
    ],
  },
  {
    kind: "uiIter",
    title: "UI 迭代：从可用页面到适合课堂展示的学习产品",
    notes: [
      "这页用版本路线展示 UI 是如何逐步增强的。",
      "V1.2 引入 Motion 动效，V1.4 做响应式巡检，V1.7 重构统计仪表盘。",
      "强调 UI 迭代不是单纯装饰，而是可读性、反馈感和演示稳定性一起提升。",
    ],
  },
  {
    kind: "acceptance",
    title: "验收结果：功能、工程和安全都有记录",
    notes: [
      "这页把验收结果集中展示，说明项目不是“能跑就行”。",
      "lint、build、browser smoke、MaaS 真实生成都留下了可复查记录。",
      "验收表把功能、工程、安全结果统一沉淀，避免只凭主观判断说完成。",
    ],
  },
  {
    kind: "demo",
    title: "课堂现场演示路线：先稳，再展示亮点",
    notes: [
      "现场演示按稳定路线走：启动、首页、语法、听力、错题、统计。",
      "需要分享给其他设备时，再启动公开隧道。",
      "如果网络或 MaaS 不稳定，就切到已有截图和本地已有题目，保证汇报不断。",
    ],
  },
  {
    kind: "closing",
    title: "总结反思：从功能实现走向工程化表达",
    notes: [
      "总结时不要只说项目完成了哪些页面，而要说明自己如何从需求、设计、实现和验收四个层面控制项目。",
      "最大的收获是先写清楚规格，再实现和验收，能减少反复返工，也能让每一次修改都有理由。",
      "工程上的收获是认识到 AI 输出不能直接进入业务，必须经过边界隔离、字段校验、错误处理和验收记录。",
      "后续可以扩展账号、多端同步、班级布置、更多题型和学习报告，但仍应先写规格再扩展实现。",
    ],
  },
];

const deckSlides = slides.filter((slide) => slide.kind !== "demo");

const pptx = new pptxgen();
pptx.defineLayout({ name: "CUSTOM_WIDE", width: W, height: H });
pptx.layout = "CUSTOM_WIDE";
pptx.author = "TOEIC Practice Studio";
pptx.company = "Classroom Demo";
pptx.subject = "课堂汇报增强版";
pptx.title = "TOEIC Practice Studio 课堂汇报增强版";
pptx.lang = "zh-CN";
pptx.theme = { headFontFace: "Microsoft YaHei", bodyFontFace: "Microsoft YaHei", lang: "zh-CN" };
pptx.margin = 0;

async function buildPptSlide(data, idx) {
  const slide = pptx.addSlide();
  addBg(slide, data.kind === "cover" ? "cover" : "normal");
  if (data.kind !== "cover") {
    addHeader(slide, data.title);
    addFooter(slide, idx + 1);
  }
  slide.addNotes(data.notes.join("\n"));

  if (data.kind === "cover") {
    addText(slide, "软件基础实验项目汇报", { x: 0.72, y: 0.62, w: 3.6, h: 0.25, fontSize: 12, bold: true, color: C.green });
    addText(slide, data.title, { x: 0.7, y: 1.08, w: 7.1, h: 0.7, fontSize: 38, bold: true, color: C.ink });
    addText(slide, data.subtitle, { x: 0.74, y: 1.96, w: 5.8, h: 0.55, fontSize: 16, color: C.muted });
    addText(slide, data.takeaway, { x: 0.76, y: 3.02, w: 4.8, h: 0.28, fontSize: 14, bold: true, color: C.deep });
    addText(slide, "软基思想：需求建模 · 过程控制 · 对象抽象 · 验证闭环", { x: 0.78, y: 3.34, w: 5.2, h: 0.18, fontSize: 10.5, bold: true, color: C.green });
    pill(slide, "Next.js", 0.78, 3.65, 0.9, C.green);
    pill(slide, "MaaS", 1.84, 3.65, 0.82, C.blue);
    pill(slide, "Prisma + SQLite", 2.82, 3.65, 1.42, C.orange);
    pill(slide, "spec-driven", 4.42, 3.65, 1.16, C.grape);
    await addScreenshotPanel(slide, img.home, 6.45, 0.82, 5.95, 4.28, "真实项目首页", { mode: "contain", labelColor: C.green });
    addMascot(slide, 1.03, 4.78, 0.75, "book");
    bubble(slide, "今天讲的不只是页面，而是一条可复盘的开发链路", 2.1, 4.83, 3.95, C.green);
    addFooter(slide, 1, "TOEIC Practice Studio · Final Report");
  }

  if (data.kind === "agenda") {
    data.items.forEach((it, i) => {
      const x = 0.9 + (i % 2) * 5.7;
      const y = 1.85 + Math.floor(i / 2) * 2.0;
      const color = [C.green, C.blue, C.orange, C.grape][i];
      addShape(slide, pptx.ShapeType.ellipse, { x, y, w: 0.62, h: 0.62, fill: { color }, line: { color } });
      addText(slide, String(i + 1), { x: x + 0.18, y: y + 0.17, w: 0.24, h: 0.12, fontSize: 12, bold: true, color: C.white, align: "center" });
      addText(slide, it[0], { x: x + 0.86, y: y - 0.03, w: 2.0, h: 0.26, fontSize: 19, bold: true, color: C.ink });
      addText(slide, it[1], { x: x + 0.86, y: y + 0.48, w: 3.9, h: 0.45, fontSize: 11.8, color: C.muted });
      addLine(slide, x + 0.1, y + 1.08, 3.8, 0, color, 1.3);
    });
    addMascot(slide, 10.8, 5.14, 0.7, "point");
    bubble(slide, "听众要记住：流程、边界、闭环、验收", 7.0, 5.23, 3.45, C.orange);
    addText(slide, "汇报主线：先说明问题与需求，再展示模型设计、编码实现、测试验收和可复盘结果。", { x: 1.0, y: 6.36, w: 10.8, h: 0.18, fontSize: 10.2, bold: true, color: C.deep, align: "center" });
  }

  if (data.kind === "pain") {
    data.points.forEach((p, i) => {
      const x = [0.8, 6.55, 0.8, 6.55][i];
      const y = [1.62, 1.62, 4.0, 4.0][i];
      const color = [C.green, C.orange, C.blue, C.rose][i];
      addShape(slide, pptx.ShapeType.arc, { x, y, w: 0.8, h: 0.8, rotate: 25, adjustPoint: 0.35, fill: { color, transparency: 6 }, line: { color, transparency: 100 } });
      addText(slide, p[0], { x: x + 1.02, y: y + 0.02, w: 1.25, h: 0.22, fontSize: 17, bold: true, color });
      wrapText(p[1], 28).slice(0, 3).forEach((line, li) => addText(slide, line, { x: x + 1.02, y: y + 0.52 + li * 0.28, w: 4.3, h: 0.16, fontSize: 10.5, color: C.ink }));
      addShape(slide, pptx.ShapeType.line, { x: x + 1.02, y: y + 1.42, w: 3.75, h: 0, line: { color: C.line, width: 1 } });
    });
  }

  if (data.kind === "goal") {
    await addScreenshotPanel(slide, img.home, 0.78, 1.62, 5.2, 3.95, "首页仪表盘", { mode: "contain" });
    const nodes = [
      ["生成", "AI 原创题目", C.green],
      ["练习", "听力 / 语法", C.blue],
      ["错题", "复练与掌握", C.orange],
      ["统计", "趋势与薄弱点", C.rose],
    ];
    nodes.forEach((n, i) => {
      const x = 6.8 + (i % 2) * 2.65;
      const y = 1.83 + Math.floor(i / 2) * 1.45;
      addShape(slide, pptx.ShapeType.ellipse, { x, y, w: 0.74, h: 0.74, fill: { color: n[2] }, line: { color: n[2] } });
      addText(slide, n[0], { x: x + 0.13, y: y + 0.23, w: 0.48, h: 0.1, fontSize: 10.5, bold: true, color: C.white, align: "center" });
      addText(slide, n[1], { x: x + 0.95, y: y + 0.24, w: 1.45, h: 0.16, fontSize: 11.4, bold: true, color: C.ink });
    });
    addDenseContentBlock(slide, "定位选择", ["本地个人版，先保证完整闭环", "SQLite 保存学习数据，降低部署成本", "服务端读取 Key，前端专注练习体验"], 6.8, 4.74, 4.8, C.green);
  }

  if (data.kind === "flow") {
    data.steps.forEach((step, i) => {
      const x = 0.72 + i * 2.03;
      const y = 2.48 + (i % 2) * 0.42;
      const color = [C.green, C.blue, C.orange, C.rose, C.grape, C.deep][i];
      addShape(slide, pptx.ShapeType.ellipse, { x, y, w: 1.04, h: 1.04, fill: { color, transparency: 2 }, line: { color } });
      addText(slide, String(i + 1).padStart(2, "0"), { x: x + 0.32, y: y + 0.18, w: 0.4, h: 0.13, fontSize: 10.5, bold: true, color: C.white, align: "center" });
      addText(slide, step, { x: x - 0.2, y: y + 1.24, w: 1.44, h: 0.16, fontSize: 10.8, bold: true, color: C.ink, align: "center" });
      if (i < data.steps.length - 1) addLine(slide, x + 1.12, y + 0.52, 0.72, (i % 2 ? -0.4 : 0.4), C.green, 1.8);
    });
    addText(slide, "关键不是“生成一次题”，而是每次练习都进入下一次复盘。", { x: 2.1, y: 5.35, w: 8.9, h: 0.35, fontSize: 20, bold: true, color: C.deep, align: "center" });
    addMascot(slide, 10.9, 5.14, 0.62, "point");
  }

  if (data.kind === "umlUseCase") {
    await addScreenshotPanel(slide, umlAssets.useCase, 0.75, 1.52, 7.25, 4.62, "UML 用例图：需求边界", { mode: "contain", labelColor: C.green });
    addDenseContentBlock(slide, "建模解释", [
      "从学习者目标出发抽取系统必须提供的能力",
      "把 MaaS 标成外部参与者，避免把外部服务误当成本地功能",
      "用系统边界区分“本应用负责什么”和“外部服务负责什么”",
      "本页把产品主流程从“功能展示”提升为“需求模型”"
    ], 8.28, 1.62, 3.75, C.green);
    addMiniTable(slide, [["模型元素", "在项目中的含义"], ["参与者", "学习者 / MaaS 服务"], ["系统边界", "本地练习工作室"], ["用例", "生成、练习、解析、错题、统计"]], 8.35, 4.85, [1.35, 2.5], 0.28);
    bubble(slide, "讲解时从学习者目标出发，再落到系统边界。", 1.08, 6.2, 4.7, C.orange);
  }

  if (data.kind === "method") {
    const left = ["需求先行", "边界明确", "小步实现", "可验收记录"];
    left.forEach((t, i) => {
      addText(slide, t, { x: 1.03, y: 1.75 + i * 0.83, w: 2.2, h: 0.24, fontSize: 16.5, bold: true, color: [C.green, C.blue, C.orange, C.rose][i] });
      addText(slide, ["先写清楚要解决什么", "不做登录/云同步等无关扩张", "T01-T22 每次只推进一块", "PASS / FAIL 都落到文档"][i], { x: 3.0, y: 1.8 + i * 0.83, w: 4.0, h: 0.16, fontSize: 11.2, color: C.ink });
    });
    addShape(slide, pptx.ShapeType.chevron, { x: 7.5, y: 2.2, w: 1.2, h: 1.35, fill: { color: C.mint }, line: { color: C.green } });
    addText(slide, "从“想法”到“证据”", { x: 8.95, y: 2.33, w: 2.6, h: 0.26, fontSize: 18, bold: true, color: C.deep });
    addText(slide, "文档不是形式，它把课堂汇报变成可验证的工程故事。", { x: 8.95, y: 2.92, w: 3.35, h: 0.6, fontSize: 12.5, color: C.muted });
    await addScreenshotPanel(slide, docAssets.spec, 7.28, 3.65, 4.62, 2.55, "spec.md 片段", { mode: "contain", labelColor: C.orange });
  }

  if (data.kind === "docs") {
    await addScreenshotPanel(slide, docAssets.spec, 0.75, 1.5, 3.0, 2.0, "spec.md", { mode: "contain", labelColor: C.green });
    await addScreenshotPanel(slide, docAssets.design, 3.95, 1.5, 3.0, 2.0, "design.md", { mode: "contain", labelColor: C.blue });
    await addScreenshotPanel(slide, docAssets.tasks, 7.15, 1.5, 3.0, 2.0, "tasks.md", { mode: "contain", labelColor: C.orange });
    await addScreenshotPanel(slide, docAssets.acceptance, 10.35, 1.5, 2.2, 2.0, "acceptance.md", { mode: "contain", labelColor: C.rose });
    addDenseContentBlock(slide, "文档链路解释", [
      "spec.md 先限定范围、功能需求和验收标准",
      "design.md 把需求转换为页面、接口、数据和安全边界",
      "tasks.md 把实现拆成 T01-T22，可按顺序推进",
      "acceptance.md 把结果记录成 PASS / FAIL，形成可复盘证据"
    ], 1.05, 4.35, 10.6, C.green);
    addText(slide, "每份文档都有出口条件，下一步才不会凭感觉推进。", { x: 2.1, y: 6.28, w: 9.1, h: 0.24, fontSize: 15.5, bold: true, color: C.deep, align: "center" });
  }

  if (data.kind === "taskMatrix") {
    await addScreenshotPanel(slide, docAssets.tasks, 0.75, 1.48, 6.05, 4.72, "tasks.md 任务总览", { mode: "contain", labelColor: C.green });
    await addScreenshotPanel(slide, docAssets.acceptance, 7.08, 1.48, 5.1, 2.15, "acceptance.md 验收记录", { mode: "contain", labelColor: C.rose });
    const milestones = [
      ["T06", "MaaS Client / Prompt / 校验"],
      ["T09-T10", "听力与语法主流程"],
      ["T12", "统计 API 与页面"],
      ["T17", "Motion 动效与视觉重设计"],
      ["T22", "统计卡通仪表盘"],
    ];
    addMiniTable(slide, [["节点", "课堂可讲价值"], ...milestones], 7.15, 4.05, [1.4, 3.55], 0.34);
  }

  if (data.kind === "architecture") {
    await addScreenshotPanel(slide, architectureAsset, 0.72, 1.42, 11.9, 5.35, "GPT 生成技术架构图", { mode: "contain", labelColor: C.green });
  }

  if (data.kind === "umlClass") {
    await addScreenshotPanel(slide, umlAssets.classModel, 0.75, 1.5, 7.35, 4.7, "UML 类图：静态结构模型", { mode: "contain", labelColor: C.green });
    addDenseContentBlock(slide, "从设计到数据库", [
      "把业务对象沉淀为稳定数据结构",
      "Question 是题目源，PracticeRecord 是行为轨迹",
      "Mistake 维护复练状态，UserSetting 保存本地学习偏好",
      "类图说明“生成、练习、错题、统计”为什么能闭环"
    ], 8.45, 1.62, 3.55, C.blue);
    addMiniTable(slide, [["设计对象", "作用"], ["Question", "题目与解析"], ["PracticeRecord", "作答轨迹"], ["Mistake", "复练状态"], ["UserSetting", "学习偏好"]], 8.58, 4.72, [1.35, 2.2], 0.28);
  }

  if (data.kind === "data") {
    const entities = [
      ["Question", "题干 / 选项 / 答案 / 解析 / 标签", 1.0, 1.7, C.green],
      ["PracticeRecord", "每次作答、是否正确、时间", 5.2, 1.7, C.blue],
      ["Mistake", "错题状态、wrongCount、复练", 5.2, 4.05, C.orange],
      ["UserSetting", "默认难度、题量、语速", 9.35, 2.85, C.rose],
    ];
    entities.forEach((e) => {
      addShape(slide, pptx.ShapeType.roundRect, { x: e[2], y: e[3], w: 2.75, h: 0.9, rectRadius: 0.06, fill: { color: C.white }, line: { color: e[4], width: 1.4 } });
      addText(slide, e[0], { x: e[2] + 0.2, y: e[3] + 0.18, w: 2.25, h: 0.16, fontSize: 13.5, bold: true, color: e[4] });
      addText(slide, e[1], { x: e[2] + 0.2, y: e[3] + 0.53, w: 2.25, h: 0.13, fontSize: 8.7, color: C.muted });
    });
    addLine(slide, 3.9, 2.15, 1.0, 0, C.green, 1.7);
    addLine(slide, 6.55, 2.65, 0, 1.18, C.orange, 1.7);
    addLine(slide, 8.1, 4.45, -1.2, 0, C.orange, 1.7);
    addLine(slide, 8.1, 3.32, 0.95, 0, C.rose, 1.7);
    addText(slide, "模型保持简单：不做复杂缓存表，统计从记录和错题聚合得到。", { x: 2.15, y: 5.8, w: 8.8, h: 0.24, fontSize: 15.5, bold: true, color: C.deep, align: "center" });
  }

  if (data.kind === "ai") {
    const steps = ["Prompt 约束", "MaaS 返回", "剥离 JSON", "结构校验", "字段校验", "写入 SQLite"];
    steps.forEach((s, i) => {
      const x = 0.75 + i * 2.0;
      const color = [C.green, C.blue, C.orange, C.rose, C.grape, C.deep][i];
      addShape(slide, pptx.ShapeType.roundRect, { x, y: 2.2, w: 1.5, h: 0.75, rectRadius: 0.07, fill: { color: i === 5 ? C.mint : C.white }, line: { color, width: 1.3 } });
      addText(slide, s, { x: x + 0.12, y: 2.48, w: 1.26, h: 0.13, fontSize: 9.5, bold: true, color: i === 5 ? C.green : C.ink, align: "center" });
      if (i < 5) addLine(slide, x + 1.57, 2.57, 0.36, 0, C.green, 1.5);
    });
    addMiniTable(slide, [["题型", "必需字段", "失败处理"], ["听力", "listeningScript", "缺失则拒绝落库"], ["语法", "grammarPoint", "缺失则返回校验错误"], ["通用", "A/B/C/D、answer、explanation", "非法结构不进入业务"]], 2.0, 4.1, [1.5, 3.5, 4.2], 0.35);
  }

  if (data.kind === "umlSequence") {
    await addScreenshotPanel(slide, umlAssets.sequence, 0.75, 1.5, 7.55, 4.72, "UML 时序图：AI 生成调用链", { mode: "contain", labelColor: C.orange });
    addDenseContentBlock(slide, "交互设计解释", [
      "API Route、MaaS Client、MaaS 服务、SQLite 分工明确",
      "时序图把一次生成请求拆成可检查的消息传递过程",
      "时序图说明对象之间按什么顺序通信，哪里做校验和落库",
      "模型输出只作为候选结果，必须经过解析和字段校验"
    ], 8.52, 1.62, 3.45, C.orange);
    addDenseContentBlock(slide, "边界意识", ["前端只发起请求", "服务端持有 Key 并校验", "数据库只保存合法结构"], 8.52, 4.92, 3.45, C.green);
  }

  if (data.kind === "security") {
    addShape(slide, pptx.ShapeType.actionButtonInformation, { x: 1.05, y: 2.0, w: 1.4, h: 1.4, fill: { color: C.green }, line: { color: C.green } });
    const rules = [
      ["服务端", "读取 MAAS_API_KEY 并调用 MaaS"],
      ["浏览器", "只调用本地 API，不保存完整 Key"],
      ["设置页", "只展示 hasApiKey / Base URL / Model 状态"],
      ["汇报材料", "不展示本地环境文件、真实密钥或敏感日志"],
    ];
    rules.forEach((r, i) => {
      const y = 1.72 + i * 0.85;
      pill(slide, r[0], 3.05, y, 1.15, [C.green, C.blue, C.orange, C.rose][i]);
      addText(slide, r[1], { x: 4.55, y: y + 0.08, w: 6.8, h: 0.13, fontSize: 11.4, color: C.ink });
    });
    await addScreenshotPanel(slide, img.settings, 8.6, 4.65, 3.2, 1.7, "设置页状态", { mode: "contain", labelColor: C.blue });
  }

  if (data.kind === "feature") {
    await addScreenshotPanel(slide, data.image, 0.72, 1.62, 7.18, 4.42, data.title.includes("听力") ? "听力桌面页" : "语法桌面页", { mode: "contain" });
    await addScreenshotPanel(slide, data.mobile, 8.24, 1.58, 1.52, 4.48, "移动端", { mode: "contain", labelColor: C.orange });
    data.callouts.forEach((c, i) => {
      addShape(slide, pptx.ShapeType.roundRect, { x: 10.1, y: 1.72 + i * 1.25, w: 2.55, h: 0.72, rectRadius: 0.06, fill: { color: i === 0 ? C.mint : C.white }, line: { color: [C.green, C.blue, C.orange][i], width: 1.2 } });
      addText(slide, c, { x: 10.28, y: 1.94 + i * 1.25, w: 2.2, h: 0.18, fontSize: 9.6, bold: true, color: C.ink, align: "center" });
    });
    addLine(slide, 7.9, 3.35, 0.32, 0, C.orange, 1.6);
  }

  if (data.kind === "mistakes") {
    await addScreenshotPanel(slide, img.mistakes, 0.72, 1.6, 4.25, 4.55, "错题长图局部", { mode: "cover", labelColor: C.orange });
    await addScreenshotPanel(slide, img.mistakes, 5.25, 1.75, 3.2, 2.1, "列表与状态", { mode: "cover", labelColor: C.green });
    await addScreenshotPanel(slide, img.mistakes, 8.86, 1.75, 3.2, 2.1, "复练入口", { mode: "cover", labelColor: C.blue });
    addDenseContentBlock(slide, "错题状态设计", ["new：首次答错，需要复习", "reviewing：重复答错，优先级提高", "mastered / removed：完成掌握或软移除"], 5.35, 4.62, 6.4, C.orange);
  }

  if (data.kind === "stats") {
    await addScreenshotPanel(slide, img.stats, 0.72, 1.58, 6.5, 4.35, "统计桌面页", { mode: "contain", labelColor: C.green });
    await addScreenshotPanel(slide, img.statsMobile, 7.58, 1.55, 1.7, 4.45, "移动统计", { mode: "contain", labelColor: C.orange });
    addDenseContentBlock(slide, "可行动反馈", ["今日练习与正确率用于短期节奏判断", "7 天趋势帮助观察连续性", "薄弱标签引导下一轮训练重点"], 9.75, 1.75, 2.5, C.green);
    addMascot(slide, 10.85, 5.1, 0.55, "point");
  }

  if (data.kind === "uiIter") {
    const rows = [
      ["V1.1", "真实统计 + 练习工作区 UI 打磨"],
      ["V1.2", "Motion 动效、动态背景、卡通贴纸"],
      ["V1.3", "生成中状态、进度条、完成面板"],
      ["V1.4", "指标卡片对齐与响应式巡检"],
      ["V1.5", "错题重新练习闭环"],
      ["V1.6", "首页 Hero 今日计划卡片"],
      ["V1.7", "统计页卡通仪表盘"],
    ];
    rows.forEach((r, i) => {
      const x = 1.0 + i * 1.6;
      const y = 2.05 + (i % 2) * 0.55;
      const color = [C.green, C.blue, C.orange, C.rose, C.grape, C.cyan, C.deep][i];
      addShape(slide, pptx.ShapeType.ellipse, { x, y, w: 0.64, h: 0.64, fill: { color }, line: { color } });
      addText(slide, r[0], { x: x + 0.1, y: y + 0.23, w: 0.45, h: 0.08, fontSize: 7.5, bold: true, color: C.white, align: "center" });
      if (i < rows.length - 1) addLine(slide, x + 0.7, y + 0.32, 0.72, (i % 2 ? -0.55 : 0.55), C.green, 1.2);
      addText(slide, r[1], { x: x - 0.25, y: y + 0.85, w: 1.25, h: 0.38, fontSize: 7.8, color: C.ink, align: "center" });
    });
    await addScreenshotPanel(slide, img.home, 1.08, 4.62, 3.15, 1.52, "首页", { mode: "contain" });
    await addScreenshotPanel(slide, img.stats, 4.95, 4.62, 3.15, 1.52, "统计页", { mode: "contain", labelColor: C.orange });
    await addScreenshotPanel(slide, img.homeMobile, 8.76, 4.42, 1.02, 1.92, "移动端", { mode: "contain", labelColor: C.blue });
    await addScreenshotPanel(slide, img.statsMobile, 10.05, 4.42, 1.02, 1.92, "移动端", { mode: "contain", labelColor: C.blue });
  }

  if (data.kind === "acceptance") {
    const rows = [
      ["lint", "PASS", "ESLint 通过"],
      ["build", "PASS", "Next.js 生产构建通过"],
      ["browser smoke", "PASS", "6 个核心页面可读"],
      ["MaaS 实题生成", "PASS", "听力 / 语法生成并落库"],
      ["API Key 边界", "PASS", "前端不持有完整 Key"],
      ["acceptance log", "PASS", "规格、功能、安全结果已归档"],
    ];
    addMiniTable(slide, [["验收项", "状态", "课堂说明"], ...rows], 0.95, 1.68, [2.2, 2.0, 6.95], 0.46);
    addText(slide, "验收记录的价值：把“我觉得完成了”变成“证据显示通过”。", { x: 2.08, y: 5.95, w: 9.3, h: 0.28, fontSize: 17.5, bold: true, color: C.deep, align: "center" });
  }

  if (data.kind === "closing") {
    const reflections = [
      ["方法收获", "先写规格，再做设计和任务拆解，能把模糊想法变成可审阅、可执行、可验收的开发链路。"],
      ["建模收获", "用例图、活动图、类图和时序图分别解释需求边界、业务流程、静态结构和对象交互。"],
      ["工程收获", "AI 生成结果必须经过服务端边界、JSON 解析、字段校验和数据库落库检查，不能直接进入业务。"],
      ["产品收获", "学习工具的价值不只在生成题目，更在作答记录、错题复练和统计反馈形成持续学习闭环。"],
      ["不足反思", "当前仍是本地个人版，缺少账号体系、班级管理、多端同步和更丰富的题型数据沉淀。"],
      ["后续扩展", "下一步应继续按 spec-driven 流程扩展：先定义规格，再补设计、任务、验收和实现。"],
    ];
    reflections.forEach((r, i) => {
      const x = 0.82 + (i % 2) * 5.9;
      const y = 1.45 + Math.floor(i / 2) * 1.58;
      const color = [C.green, C.blue, C.orange, C.rose, C.grape, C.deep][i];
      noteLabel(slide, r[0], x, y, color);
      addText(slide, r[1], { x, y: y + 0.45, w: 5.25, h: 0.44, fontSize: 10.6, color: C.ink });
    });
    addText(slide, "最终理解：软件开发不是把页面堆出来，而是把需求、模型、代码和验收连成可解释的系统。", { x: 1.25, y: 6.28, w: 10.85, h: 0.28, fontSize: 16.2, bold: true, color: C.deep, align: "center" });
  }

  if (data.kind === "demo") {
    const steps = [
      ["1", "npm run start:public", "启动本地演示服务"],
      ["2", "打开首页", "说明学习仪表盘和入口"],
      ["3", "语法练习", "生成、答题、解析"],
      ["4", "听力练习", "播放、隐藏选项、提交"],
      ["5", "错题 + 统计", "展示学习闭环"],
      ["6", "npm run tunnel:quick", "需要公网分享时启动"],
    ];
    steps.forEach((s, i) => {
      const y = 1.55 + i * 0.72;
      addShape(slide, pptx.ShapeType.ellipse, { x: 0.92, y, w: 0.38, h: 0.38, fill: { color: C.green }, line: { color: C.green } });
      addText(slide, s[0], { x: 1.03, y: y + 0.1, w: 0.16, h: 0.05, fontSize: 7.2, bold: true, color: C.white, align: "center" });
      addText(slide, s[1], { x: 1.62, y: y + 0.05, w: 3.2, h: 0.12, fontSize: 11.2, bold: true, color: C.deep });
      addText(slide, s[2], { x: 5.2, y: y + 0.05, w: 5.4, h: 0.12, fontSize: 10.8, color: C.ink });
      if (i < steps.length - 1) addShape(slide, pptx.ShapeType.line, { x: 1.11, y: y + 0.43, w: 0, h: 0.28, line: { color: C.line, width: 1.2 } });
    });
    addDenseContentBlock(slide, "备用方案", ["MaaS 网络波动：使用已有题目演示", "公网隧道失败：本机窗口投屏", "讲解卡顿：按备注页逐页推进"], 8.72, 4.95, 3.0, C.orange);
  }

  if (false && data.kind === "closing") {
    const gains = [
      ["方法收获", "规格、设计、任务、验收形成闭环"],
      ["工程收获", "AI 输出必须经过边界与校验"],
      ["产品收获", "学习工具的价值在复盘和反馈"],
      ["后续方向", "账号、多端同步、更多题型、课堂布置"],
    ];
    gains.forEach((g, i) => {
      const x = 1.05 + (i % 2) * 5.35;
      const y = 1.78 + Math.floor(i / 2) * 1.6;
      const color = [C.green, C.blue, C.orange, C.rose][i];
      noteLabel(slide, g[0], x, y, color);
      addText(slide, g[1], { x, y: y + 0.47, w: 4.45, h: 0.28, fontSize: 12.2, color: C.ink });
    });
    addText(slide, "谢谢！", { x: 4.88, y: 5.78, w: 3.4, h: 0.42, fontSize: 30, bold: true, color: C.green, align: "center" });
    addMascot(slide, 9.95, 5.24, 0.72, "book");
  }
}

function svgText(text, x, y, size = 28, color = C.ink, weight = 400, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="Microsoft YaHei, Arial" font-size="${size}" fill="#${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(text)}</text>`;
}

function svgWrap(text, x, y, max, size, color = C.ink, weight = 400) {
  return wrapText(text, max).slice(0, 5).map((line, i) => svgText(line, x, y + i * size * 1.38, size, color, weight)).join("");
}

function svgImage(file, x, y, w, h, mode = "meet") {
  const b64 = fs.readFileSync(file).toString("base64");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fff" stroke="#${C.line}" stroke-width="3"/>
  <image href="data:image/png;base64,${b64}" x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" preserveAspectRatio="xMidYMid ${mode}"/>`;
}

function renderSvgSlide(data, idx) {
  const bg = data.kind === "cover" ? C.cream : C.paper;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${PXW}" height="${PXH}" viewBox="0 0 ${PXW} ${PXH}">
  <rect width="${PXW}" height="${PXH}" fill="#${bg}"/>
  <circle cx="1740" cy="-35" r="260" fill="#${C.mint}" opacity=".85"/>
  <circle cx="-60" cy="1080" r="230" fill="#FFE8B2" opacity=".75"/>`;
  if (data.kind !== "cover") {
    s += svgText("TOEIC Practice Studio", 84, 86, 22, C.green, 700);
    s += svgText(data.title, 84, 155, 47, C.ink, 800);
    s += `<line x1="86" y1="195" x2="242" y2="195" stroke="#${C.orange}" stroke-width="7"/>`;
    s += svgText(String(idx + 1).padStart(2, "0"), 1810, 1018, 22, C.green, 700, "end");
  }
  if (data.kind === "cover") {
    s += svgText("软件基础实验项目汇报", 105, 130, 28, C.green, 700);
    s += svgText(data.title, 105, 260, 82, C.ink, 900);
    s += svgWrap(data.subtitle, 110, 360, 28, 32, C.muted, 500);
    s += svgText(data.takeaway, 112, 505, 30, C.deep, 800);
    s += svgText("软基思想：需求建模 · 过程控制 · 对象抽象 · 验证闭环", 112, 565, 22, C.green, 800);
    s += svgImage(img.home, 930, 118, 850, 630, "meet");
    s += svgText("生成 → 练习 → 错题 → 统计", 280, 835, 36, C.green, 800);
  } else if (data.kind === "goal") {
    s += svgImage(img.home, 115, 240, 760, 560, "meet");
    ["生成原创题目", "完成听力/语法练习", "沉淀错题复练", "查看趋势和薄弱点"].forEach((t, i) => {
      const x = 960 + (i % 2) * 360;
      const y = 275 + Math.floor(i / 2) * 165;
      s += `<circle cx="${x}" cy="${y}" r="48" fill="#${[C.green, C.blue, C.orange, C.rose][i]}"/>`;
      s += svgText(["生成", "练习", "错题", "统计"][i], x, y + 8, 22, C.white, 800, "middle");
      s += svgWrap(t, x + 72, y + 6, 13, 24, C.ink, 800);
    });
    data.notes.slice(0, 3).forEach((n, i) => {
      s += `<rect x="970" y="${640 + i * 78}" width="700" height="54" rx="18" fill="${i % 2 ? "#fff" : `#${C.mint}`}" stroke="#${C.line}" stroke-width="2"/>`;
      s += svgWrap(n, 1000, 674 + i * 78, 31, 19, C.ink, 600);
    });
  } else if (data.kind === "umlUseCase") {
    s += svgImage(umlAssets.useCase, 105, 230, 1040, 630, "meet");
    s += `<rect x="1225" y="240" width="480" height="300" rx="24" fill="#${C.mint}" stroke="#${C.green}" stroke-width="3"/>`;
    ["从学习者目标抽取系统能力", "区分本地系统与外部 MaaS 服务", "用系统边界表达需求范围"].forEach((t, i) => {
      s += svgWrap(t, 1260, 310 + i * 78, 18, 25, C.ink, 800);
    });
  } else if (data.kind === "method") {
    s += svgImage(docAssets.spec, 930, 520, 650, 360, "meet");
    ["需求先行", "边界明确", "小步实现", "可验收记录"].forEach((t, i) => {
      s += `<circle cx="250" cy="${300 + i * 110}" r="34" fill="#${[C.green, C.blue, C.orange, C.rose][i]}"/>`;
      s += svgWrap(t, 315, 310 + i * 110, 20, 27, C.ink, 800);
    });
    s += svgText("Spec-driven coding 把开发过程落实为可检查的文档链路。", 315, 820, 28, C.deep, 800);
  } else if (data.kind === "docs") {
    s += svgImage(docAssets.spec, 115, 230, 420, 285, "meet");
    s += svgImage(docAssets.design, 570, 230, 420, 285, "meet");
    s += svgImage(docAssets.tasks, 1025, 230, 420, 285, "meet");
    s += svgImage(docAssets.acceptance, 1480, 230, 300, 285, "meet");
    ["spec.md 定义范围与验收", "design.md 转换为页面/接口/数据", "tasks.md 拆成 T01-T22", "acceptance.md 记录验收"].forEach((t, i) => {
      s += `<rect x="${160 + i * 405}" y="650" width="340" height="62" rx="18" fill="${i % 2 ? "#fff" : `#${C.mint}`}" stroke="#${[C.green, C.blue, C.orange, C.rose][i]}" stroke-width="3"/>`;
      s += svgWrap(t, 185 + i * 405, 690, 16, 21, C.ink, 800);
    });
    s += svgText("每份文档都有出口条件，下一步才不会凭感觉推进。", 415, 835, 30, C.deep, 900);
  } else if (data.kind === "taskMatrix") {
    s += svgImage(docAssets.tasks, 105, 225, 820, 640, "meet");
    s += svgImage(docAssets.acceptance, 985, 225, 690, 285, "meet");
    ["T06 MaaS Client / Prompt / 校验", "T09-T10 听力与语法主流程", "T12 统计 API 与页面", "T17 Motion 动效与视觉重设计", "T22 统计卡通仪表盘"].forEach((t, i) => {
      s += `<rect x="1015" y="${575 + i * 58}" width="610" height="42" rx="14" fill="${i % 2 ? "#fff" : `#${C.mint}`}" stroke="#${[C.green,C.blue,C.orange,C.rose,C.deep][i]}" stroke-width="2"/>`;
      s += svgWrap(t, 1040, 603 + i * 58, 28, 18, C.ink, 700);
    });
  } else if (data.kind === "architecture") {
    s += svgImage(architectureAsset, 105, 225, 1600, 700, "meet");
  } else if (data.kind === "umlClass") {
    s += svgImage(umlAssets.classModel, 105, 225, 1070, 650, "meet");
    s += `<rect x="1245" y="250" width="480" height="440" rx="24" fill="#fff" stroke="#${C.blue}" stroke-width="3"/>`;
    ["对象边界清晰，职责单一", "数据关系简洁稳定", "支撑统计、错题复练与个性化学习", "为后续题库导入保留扩展空间"].forEach((t, i) => {
      s += svgWrap(t, 1280, 325 + i * 78, 19, 24, C.ink, i === 0 ? 800 : 600);
    });
  } else if (data.kind === "umlSequence") {
    s += svgImage(umlAssets.sequence, 105, 225, 1085, 650, "meet");
    s += `<rect x="1260" y="260" width="455" height="420" rx="24" fill="#${C.cream}" stroke="#${C.orange}" stroke-width="3"/>`;
    ["AI 编程不是直接信任模型", "API Route 持有安全边界", "JSON 解析与字段校验", "合法结构才进入 SQLite"].forEach((t, i) => {
      s += svgWrap(t, 1295, 335 + i * 78, 17, 24, C.ink, i === 0 ? 800 : 600);
    });
  } else if (data.kind === "feature") {
    s += svgImage(data.image, 105, 240, 1030, 640, "meet");
    s += svgImage(data.mobile, 1195, 235, 230, 650, "meet");
    data.callouts.forEach((c, i) => {
      s += `<rect x="1480" y="${260 + i * 175}" width="340" height="100" rx="20" fill="${i === 0 ? `#${C.mint}` : "#fff"}" stroke="#${[C.green, C.blue, C.orange][i]}" stroke-width="3"/>`;
      s += svgWrap(c, 1515, 315 + i * 175, 15, 22, C.ink, 800);
    });
  } else if (data.kind === "mistakes") {
    s += svgImage(img.mistakes, 105, 230, 610, 670, "slice");
    s += svgImage(img.mistakes, 780, 260, 470, 280, "slice");
    s += svgImage(img.mistakes, 1320, 260, 470, 280, "slice");
    s += svgText("错题状态：new → reviewing → mastered / removed", 785, 730, 30, C.orange, 800);
  } else if (data.kind === "stats") {
    s += svgImage(img.stats, 105, 230, 930, 635, "meet");
    s += svgImage(img.statsMobile, 1100, 225, 250, 650, "meet");
    s += svgWrap("统计把练习结果变成可行动反馈：正确率、趋势、薄弱点、当前错题。", 1420, 320, 17, 28, C.ink, 700);
  } else if (data.kind === "uiIter") {
    ["V1.1", "V1.2", "V1.3", "V1.4", "V1.5", "V1.6", "V1.7"].forEach((v, i) => {
      const x = 170 + i * 225;
      const y = 390 + (i % 2) * 80;
      s += `<circle cx="${x}" cy="${y}" r="48" fill="#${[C.green, C.blue, C.orange, C.rose, C.grape, C.cyan, C.deep][i]}"/>`;
      s += svgText(v, x, y + 8, 22, C.white, 800, "middle");
      if (i < 6) s += `<line x1="${x + 60}" y1="${y}" x2="${x + 160}" y2="${390 + ((i + 1) % 2) * 80}" stroke="#${C.green}" stroke-width="5" marker-end="url(#arrow)"/>`;
    });
    s += svgImage(img.home, 180, 660, 470, 230, "meet");
    s += svgImage(img.stats, 740, 660, 470, 230, "meet");
    s += svgImage(img.homeMobile, 1320, 620, 145, 290, "meet");
    s += svgImage(img.statsMobile, 1510, 620, 145, 290, "meet");
  } else if (data.kind === "closing") {
    ["方法收获：规格先行，任务可验收", "建模收获：用图解释需求、流程、对象和交互", "工程收获：AI 输出必须校验后落库", "产品收获：生成只是入口，复盘才形成价值", "不足反思：当前仍是本地个人版", "后续扩展：账号、班级、多端、更多题型"].forEach((t, i) => {
      const x = 150 + (i % 2) * 820;
      const y = 260 + Math.floor(i / 2) * 150;
      s += `<rect x="${x}" y="${y}" width="710" height="92" rx="22" fill="${i % 2 ? "#fff" : `#${C.mint}`}" stroke="#${[C.green, C.blue, C.orange, C.rose, C.grape, C.deep][i]}" stroke-width="3"/>`;
      s += svgWrap(t, x + 35, y + 55, 27, 24, C.ink, 800);
    });
    s += svgText("软件开发不是把页面堆出来，而是把需求、模型、代码和验收连成可解释的系统。", 270, 865, 31, C.deep, 900);
  } else {
    const baseText = (data.items || data.points || data.docs || []).map((v) => Array.isArray(v) ? `${v[0]}：${v[1]}` : v);
    const text = [...baseText, ...(data.notes || [])];
    if (data.kind === "security") s += svgImage(img.settings, 1250, 705, 460, 230, "meet");
    if (data.kind === "agenda") text.push("开发流程 / 技术路线 / 功能成果 / 课堂演示");
    if (data.kind === "flow") text.push("选择题型 → AI 生成 → 作答提交 → 即时解析 → 错题沉淀 → 统计反馈");
    if (data.kind === "method") text.push("先写清楚规格，再进入实现；每一步都能被验收。");
    if (data.kind === "taskMatrix") text.push("T01-T22 全部完成，MVP 主链路与 UI 体验迭代均有记录。");
    if (data.kind === "architecture") text.push("浏览器 UI → API Route → 业务服务层 → Prisma + SQLite → MaaS");
    if (data.kind === "data") text.push("Question、PracticeRecord、Mistake、UserSetting 四张表支撑闭环。");
    if (data.kind === "ai") text.push("Prompt → MaaS → JSON 解析 → 字段校验 → SQLite 落库。");
    if (data.kind === "acceptance") text.push("lint / build / browser smoke / MaaS / public smoke 均通过。");
    if (data.kind === "demo") text.push("start:public → 首页 → 语法 → 听力 → 错题 → 统计 → tunnel:quick");
    if (data.kind === "closing") text.push("方法收获、工程收获、产品收获、后续扩展。");
    text.slice(0, 6).forEach((t, i) => {
      const yy = 260 + i * 100;
      const fill = i % 2 ? "#fff" : `#${C.mint}`;
      s += `<rect x="150" y="${yy}" width="1540" height="76" rx="22" fill="${fill}" stroke="#${C.line}" stroke-width="2"/>`;
      s += `<circle cx="190" cy="${yy + 38}" r="16" fill="#${[C.green, C.blue, C.orange, C.rose, C.grape, C.deep][i % 6]}"/>`;
      s += svgWrap(t, 230, yy + 44, 48, 23, C.ink, i === 0 ? 800 : 560);
    });
  }
  s += `</svg>`;
  return s;
}

async function renderPreviews() {
  for (const file of fs.readdirSync(previewDir)) {
    if (/^slide-\d+\.png$/.test(file)) fs.rmSync(path.join(previewDir, file));
  }
  const previews = [];
  for (let i = 0; i < deckSlides.length; i++) {
    const svg = renderSvgSlide(deckSlides[i], i);
    const out = path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await sharp(Buffer.from(svg)).png().toFile(out);
    previews.push(out);
  }
  const thumbW = 384;
  const thumbH = 216;
  const cols = 4;
  const rows = Math.ceil(previews.length / cols);
  const contact = sharp({
    create: {
      width: cols * thumbW,
      height: rows * thumbH,
      channels: 4,
      background: "#FBFCF4",
    },
  });
  const composite = await Promise.all(previews.map(async (file, i) => ({
    input: await sharp(file).resize(thumbW, thumbH, { fit: "cover" }).png().toBuffer(),
    left: (i % cols) * thumbW,
    top: Math.floor(i / cols) * thumbH,
  })));
  await contact.composite(composite).png().toFile(path.join(previewDir, "contact-sheet.png"));
}

async function patchPptxAnimations(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  for (const name of Object.keys(zip.files).filter((entry) => entry.endsWith(".xml"))) {
    const item = zip.file(name);
    if (!item) continue;
    const xml = await item.async("string");
    if (xml.includes(".env.local")) zip.file(name, xml.replace(/\.env\.local/g, "本地环境文件"));
  }
  const transitions = ["fade", "push", "wipe", "split"];
  let patched = 0;
  for (let i = 1; i <= deckSlides.length; i++) {
    const name = `ppt/slides/slide${i}.xml`;
    const entry = zip.file(name);
    if (!entry) continue;
    let xml = await entry.async("string");
    xml = xml.replace(/<p:transition[\s\S]*?<\/p:transition>/g, "");
    xml = xml.replace(/<p:timing[\s\S]*?<\/p:timing>/g, "");
    const type = transitions[(i - 1) % transitions.length];
    const transition =
      type === "fade" ? '<p:transition spd="med" advClick="1"><p:fade/></p:transition>' :
      type === "push" ? '<p:transition spd="med" advClick="1"><p:push dir="l"/></p:transition>' :
      type === "wipe" ? '<p:transition spd="med" advClick="1"><p:wipe dir="u"/></p:transition>' :
      '<p:transition spd="med" advClick="1"><p:split orient="vert" dir="in"/></p:transition>';
    const timing = '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"/></p:par></p:tnLst><p:bldLst/></p:timing>';
    const anchor = xml.includes("</p:clrMapOvr>") ? "</p:clrMapOvr>" : "</p:cSld>";
    xml = xml.replace(anchor, `${anchor}${transition}${timing}`);
    zip.file(name, xml);
    patched += 1;
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer" }));
  return patched;
}

function writeNotes() {
  const content = [
    "# TOEIC Practice Studio 课堂汇报增强版讲稿备注",
    "",
    "展示时长建议：10-15 分钟。每页备注为课堂讲解辅助，不必逐字照读。",
    "",
    "讲解策略：不要只讲“页面做出来了”，而要把项目对应到需求建模、过程模型、对象模型、系统设计、编码实现、安全边界和测试验收。",
    "展示重点：用真实文档片段证明 spec-driven 推进过程，用 GPT 生成 UML 图和架构图解释设计内容，用验收记录说明项目已形成可复盘证据链。",
    "",
    ...deckSlides.flatMap((s, i) => [
      `## ${i + 1}. ${s.title}`,
      "",
      ...s.notes.map((n) => `- ${n}`),
      "",
    ]),
  ].join("\n");
  fs.writeFileSync(notesPath, content, "utf8");
}

async function main() {
  await buildGeneratedUmlAssets();
  await buildDocAssets();
  await buildArchitectureAsset();
  for (let i = 0; i < deckSlides.length; i++) await buildPptSlide(deckSlides[i], i);
  await pptx.writeFile({ fileName: deckPath });
  const patchedSlides = await patchPptxAnimations(deckPath);
  await renderPreviews();
  writeNotes();
  const manifest = {
    deckPath,
    previewDir,
    notesPath,
    assetDir,
    slideCount: deckSlides.length,
    animationPatch: {
      transitionNodesInjected: patchedSlides,
      timingNodesInjected: patchedSlides,
      note: "PPTX XML includes slide transition/timing nodes; complex object animation playback should be verified in desktop PowerPoint.",
    },
    engineeringEvidence: {
      modelingImages: "UML diagrams are GPT-generated images copied into output/presentation/assets.",
      generatedUmlAssets: Object.values(umlAssets),
      generatedArchitectureAsset: architectureAsset,
      documentEvidenceAssets: Object.values(docAssets),
    },
    imagePolicy: "All screenshots use PowerPoint image sizing contain/cover and keep source aspect ratio.",
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
