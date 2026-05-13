import type { QuestionGenerationRequest } from "@/lib/question-generation";

export function buildGrammarPrompt(request: QuestionGenerationRequest) {
  return [
    "请生成原创 TOEIC Reading 语法练习题。",
    "不要声称题目来自官方真题。",
    "只返回严格 JSON，不要使用 Markdown，不要添加解释性前后缀。",
    `题型：${request.subtype}`,
    `所有题目的 subtype 字段必须严格等于 "${request.subtype}"，不要改写、概括或替换为其他题型。`,
    `难度：${request.difficulty}`,
    `所有题目的 difficulty 字段必须严格等于 "${request.difficulty}"。`,
    `题量：${request.count}`,
    `语法点：${request.grammarPoint || "常见商务英语语法"}`,
    `标签：${request.tags.length ? request.tags.join(", ") : "grammar"}`,
    "每题必须包含 type、subtype、difficulty、prompt、options、answer、explanationZh、grammarPoint、tags。",
    "options 必须且只能包含 A、B、C、D 四项。",
    "answer 必须是 A、B、C、D 中唯一一个。",
    "explanationZh 必须使用中文。",
    "返回结构示例：",
    `{"questions":[{"type":"grammar","subtype":"${request.subtype}","difficulty":"${request.difficulty}","prompt":"The sentence with a blank.","options":{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"},"answer":"C","explanationZh":"中文解析","grammarPoint":"${request.grammarPoint || "时态"}","tags":["tense"]}]}`,
  ].join("\n");
}
