import type { QuestionGenerationRequest } from "@/lib/question-generation";

export function buildListeningPrompt(request: QuestionGenerationRequest) {
  const isPictureDescription = request.subtype === "picture-description";

  return [
    "请生成原创 TOEIC 听力风格练习题。",
    "不要声称题目来自官方真题。",
    "只返回严格 JSON，不要使用 Markdown，不要添加解释性前后缀。",
    `题型：${request.subtype}`,
    `所有题目的 subtype 字段必须严格等于 "${request.subtype}"，不要改写、概括或替换为其他题型。`,
    `难度：${request.difficulty}`,
    `所有题目的 difficulty 字段必须严格等于 "${request.difficulty}"。`,
    `题量：${request.count}`,
    `标签：${request.tags.length ? request.tags.join(", ") : "general"}`,
    isPictureDescription
      ? "每题必须包含 type、subtype、difficulty、prompt、listeningScript、options、answer、explanationZh、tags、imagePrompt。"
      : "每题必须包含 type、subtype、difficulty、prompt、listeningScript、options、answer、explanationZh、tags。",
    isPictureDescription
      ? "imagePrompt 必须用英文描述一张原创 TOEIC Part 1 风格图片：商务或公共生活场景、无文字、无商标、无真实品牌、构图清晰、适合根据画面选择正确描述。"
      : "",
    isPictureDescription
      ? "正确选项必须准确描述 imagePrompt 对应画面，其他选项必须是合理但与画面不符的干扰项。"
      : "",
    "options 必须且只能包含 A、B、C、D 四项。",
    "answer 必须是 A、B、C、D 中唯一一个。",
    "explanationZh 必须使用中文。",
    "返回结构示例：",
    isPictureDescription
      ? `{"questions":[{"type":"listening","subtype":"${request.subtype}","difficulty":"${request.difficulty}","prompt":"Look at the picture and choose the statement that best describes it.","listeningScript":"Full spoken script","options":{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"},"answer":"A","explanationZh":"中文解析","tags":["business"],"imagePrompt":"A realistic TOEIC Part 1 training photo of an office worker arranging documents on a conference table, no text, no logos"}]}`
      : `{"questions":[{"type":"listening","subtype":"${request.subtype}","difficulty":"${request.difficulty}","prompt":"Question text","listeningScript":"Full spoken script","options":{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"},"answer":"A","explanationZh":"中文解析","tags":["business"]}]}`,
  ]
    .filter(Boolean)
    .join("\n");
}
