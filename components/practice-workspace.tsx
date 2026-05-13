"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Square,
  Trophy,
} from "lucide-react";

import { CartoonSticker } from "@/components/cartoon-sticker";
import {
  MotionItem,
  MotionPage,
  MotionStagger,
  MotionSurface,
} from "@/components/motion-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PracticeType = "listening" | "grammar";
type Difficulty = "easy" | "medium" | "hard";
type Answer = "A" | "B" | "C" | "D";

type GeneratedQuestion = {
  id: string;
  type: PracticeType;
  subtype: string;
  difficulty: Difficulty;
  prompt: string;
  options: Record<Answer, string>;
  answer: Answer;
  explanationZh: string;
  tags: string[];
  listeningScript?: string | null;
  grammarPoint?: string | null;
  imageUrl?: string | null;
  imagePrompt?: string | null;
};

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type PracticeWorkspaceProps = {
  practiceType: PracticeType;
};

const answers: Answer[] = ["A", "B", "C", "D"];

const listeningSubtypes = [
  { value: "picture-description", label: "图片描述风格" },
  { value: "question-response", label: "问答题风格" },
  { value: "short-conversation", label: "简短对话" },
  { value: "short-talk", label: "简短讲话" },
];

const grammarSubtypes = [
  { value: "sentence-completion", label: "单句填空" },
  { value: "part-of-speech", label: "词性选择" },
  { value: "tense-voice", label: "时态 / 语态" },
  { value: "preposition-conjunction", label: "介词 / 连词" },
  { value: "business-context", label: "商务语境" },
];

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export function PracticeWorkspace({ practiceType }: PracticeWorkspaceProps) {
  const isListening = practiceType === "listening";
  const subtypes = isListening ? listeningSubtypes : grammarSubtypes;
  const [subtype, setSubtype] = useState(subtypes[0].value);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(isListening ? 3 : 5);
  const [tags, setTags] = useState("");
  const [grammarPoint, setGrammarPoint] = useState("时态");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: Answer;
    explanationZh: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const submitted = Boolean(result);
  const subtypeLabel =
    subtypes.find((item) => item.value === subtype)?.label || subtype;
  const answeredCount = questions.length
    ? currentIndex + (submitted ? 1 : 0)
    : 0;
  const progressPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;
  const isComplete =
    Boolean(result) && questions.length > 0 && currentIndex === questions.length - 1;

  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  async function generateQuestions() {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setResult(null);
    setSelectedAnswer(null);

    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceType,
          subtype,
          difficulty,
          count,
          tags: parsedTags,
          grammarPoint: isListening ? undefined : grammarPoint,
        }),
      });
      const payload = (await response.json()) as ApiResponse<{
        questions: GeneratedQuestion[];
      }>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setQuestions(payload.data.questions);
      setCurrentIndex(0);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "生成题目失败。",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/practice-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: selectedAnswer,
          timeSpentSeconds: 0,
        }),
      });
      const payload = (await response.json()) as ApiResponse<{
        result: {
          isCorrect: boolean;
          correctAnswer: Answer;
          explanationZh: string;
        };
      }>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setResult(payload.data.result);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "提交答案失败。",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setResult(null);
    setSelectedAnswer(null);
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function replay() {
    if (!currentQuestion || !("speechSynthesis" in window)) {
      setError("当前浏览器不支持语音朗读。");
      return;
    }

    window.speechSynthesis.cancel();
    const spoken = [
      currentQuestion.listeningScript,
      ...answers.map((answer) => `Option ${answer}. ${currentQuestion.options[answer]}`),
    ]
      .filter(Boolean)
      .join(" ");
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function optionClass(answer: Answer) {
    if (!submitted) {
      return selectedAnswer === answer
        ? "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm"
        : "hover:border-emerald-200 hover:bg-emerald-50/40";
    }

    if (answer === result?.correctAnswer) {
      return "border-emerald-400 bg-emerald-50 text-emerald-950";
    }

    if (answer === selectedAnswer) {
      return "border-rose-300 bg-rose-50 text-rose-950";
    }

    return "opacity-70";
  }

  return (
    <MotionPage
      className={cn(
        "practice-scene relative space-y-6 overflow-hidden rounded-lg",
        isListening ? "practice-scene-listening" : "practice-scene-grammar",
      )}
    >
      <div className="practice-scene-layer" aria-hidden="true" />
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="gap-1.5">
            {isListening ? (
              <Headphones className="size-3.5" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            {isListening ? "听力练习" : "语法练习"}
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
              {isListening ? "听力练习" : "语法练习"}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {isListening
                ? "答题前只显示 A/B/C/D，英文选项由浏览器朗读。"
                : "选择语法点并生成托业阅读风格练习题。"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border bg-card/90 p-3 text-center shadow-sm backdrop-blur md:min-w-80">
          <div>
            <p className="text-xs text-muted-foreground">队列</p>
            <p className="mt-1 font-semibold">
              {questions.length ? `${currentIndex + 1}/${questions.length}` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">已提交</p>
            <p className="mt-1 font-semibold">{answeredCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">难度</p>
            <p className="mt-1 font-semibold">{difficultyLabels[difficulty]}</p>
          </div>
        </div>
      </section>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Alert variant="destructive">
            <AlertTitle>操作失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <MotionItem>
        <Card className="border-emerald-100/80 bg-card/90 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>生成设置</CardTitle>
                <CardDescription>
                  前端只请求本地 API，API Key 只在服务端读取。
                </CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit">
                {subtypeLabel} · {difficultyLabels[difficulty]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">题型</span>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subtypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">难度</span>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as Difficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">题量</span>
              <Input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">标签</span>
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="business, meeting"
              />
            </label>
            {!isListening ? (
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">语法点</span>
                <Input
                  value={grammarPoint}
                  onChange={(event) => setGrammarPoint(event.target.value)}
                />
              </label>
            ) : null}
            <div className="flex items-end md:col-span-3">
              <MotionSurface>
                <Button onClick={generateQuestions} disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  {loading ? "生成中" : "生成题目"}
                </Button>
              </MotionSurface>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {questions.length > 0 ? (
        <motion.div
          className="rounded-lg border bg-card/90 p-4 shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">练习进度</span>
            <span className="text-muted-foreground">
              {answeredCount} / {questions.length} · {progressPercent}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 to-amber-400"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait">
        {loading && !currentQuestion ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Card className="bg-card/90 backdrop-blur">
              <CardHeader>
                <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      正在生成题目
                    </CardTitle>
                    <CardDescription>
                      MaaS 正在根据题型、难度和标签生成练习题，完成后会自动进入第一题。
                    </CardDescription>
                  </div>
                  <CartoonSticker
                    variant={isListening ? "listening" : "grammar"}
                    className="max-w-44"
                  />
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ) : currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Card className="overflow-hidden bg-card/95 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>
                        第 {currentIndex + 1} / {questions.length} 题
                      </CardTitle>
                      <Badge variant="outline">{subtypeLabel}</Badge>
                      <Badge variant="secondary">
                        {difficultyLabels[currentQuestion.difficulty]}
                      </Badge>
                    </div>
                    <CardDescription className="text-base leading-7">
                      {currentQuestion.prompt}
                    </CardDescription>
                  </div>
                  {isListening ? (
                    <div className="flex gap-2">
                      <MotionSurface>
                        <Button variant="outline" onClick={replay}>
                          <Play className="size-4" />
                          {speaking ? "重播" : "播放"}
                        </Button>
                      </MotionSurface>
                      <Button variant="ghost" onClick={stopSpeech}>
                        <Square className="size-4" />
                        停止
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {currentQuestion.imageUrl ? (
                  <div className="overflow-hidden rounded-lg border bg-muted/40">
                    <Image
                      src={currentQuestion.imageUrl}
                      alt={currentQuestion.imagePrompt || currentQuestion.prompt}
                      width={1024}
                      height={1024}
                      unoptimized
                      className="aspect-square w-full object-cover sm:aspect-[4/3] lg:max-h-[480px]"
                    />
                  </div>
                ) : null}
                <MotionStagger className="grid gap-3 sm:grid-cols-2">
                  {answers.map((answer) => (
                    <MotionItem key={answer}>
                      <MotionSurface>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-auto min-h-20 w-full justify-start gap-3 py-4 text-left transition-colors",
                            optionClass(answer),
                          )}
                          onClick={() => setSelectedAnswer(answer)}
                          disabled={submitted}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background font-semibold">
                            {answer}
                          </span>
                          <span className="whitespace-normal leading-6">
                            {isListening && !submitted
                              ? "提交后显示英文选项正文"
                              : currentQuestion.options[answer]}
                          </span>
                        </Button>
                      </MotionSurface>
                    </MotionItem>
                  ))}
                </MotionStagger>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedAnswer ? `已选择 ${selectedAnswer}` : "请选择答案"}
                  </p>
                  <MotionSurface>
                    <Button
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || submitted || submitting}
                    >
                      {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      提交答案
                    </Button>
                  </MotionSurface>
                </div>
                <AnimatePresence>
                  {result ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                    >
                      <Separator />
                      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                        <Alert
                          className={cn(
                            result.isCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                              : "border-rose-200 bg-rose-50 text-rose-950",
                          )}
                        >
                          <AlertTitle>
                            {result.isCorrect ? "回答正确" : "回答错误"}
                          </AlertTitle>
                          <AlertDescription>
                            正确答案：{result.correctAnswer}。
                            {result.explanationZh}
                          </AlertDescription>
                        </Alert>
                        <CartoonSticker
                          variant={result.isCorrect ? "success" : practiceType}
                          className="hidden max-w-44 lg:block"
                        />
                      </div>
                      {currentIndex < questions.length - 1 ? (
                        <MotionSurface className="w-fit">
                          <Button variant="outline" onClick={nextQuestion}>
                            下一题
                          </Button>
                        </MotionSurface>
                      ) : null}
                      {isComplete ? (
                        <motion.div
                          className="rounded-lg border bg-card p-4 shadow-sm"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                        >
                          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                            <div className="space-y-2">
                              <Badge variant="outline" className="gap-1.5">
                                <Trophy className="size-3.5" />
                                本组完成
                              </Badge>
                              <h2 className="text-xl font-semibold tracking-normal">
                                已完成 {questions.length} 道练习
                              </h2>
                              <p className="text-sm leading-6 text-muted-foreground">
                                答题记录已保存。答错的题会自动进入错题本，统计页会随记录更新。
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                              <MotionSurface>
                                <Button onClick={generateQuestions} disabled={loading}>
                                  <RotateCcw className="size-4" />
                                  再来一组
                                </Button>
                              </MotionSurface>
                              <Button variant="outline" asChild>
                                <a href="/mistakes">
                                  <ClipboardList className="size-4" />
                                  查看错题
                                </a>
                              </Button>
                              <Button variant="ghost" asChild>
                                <a href="/stats">
                                  <BarChart3 className="size-4" />
                                  学习统计
                                </a>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Card className="bg-card/90 backdrop-blur">
              <CardHeader>
                <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-center">
                  <div>
                    <CardTitle>等待生成</CardTitle>
                    <CardDescription>
                      {isListening
                        ? "生成后会先隐藏英文选项正文，只展示 A/B/C/D。"
                        : "生成后可直接答题并查看中文解析。"}
                    </CardDescription>
                  </div>
                  <CartoonSticker
                    variant={isListening ? "listening" : "grammar"}
                    className="max-w-44"
                  />
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionPage>
  );
}
