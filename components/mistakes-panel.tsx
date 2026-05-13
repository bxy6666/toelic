"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Filter, RefreshCw, Send, Trash2 } from "lucide-react";

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

type MistakeItem = {
  id: string;
  wrongCount: number;
  status: string;
  note: string | null;
  question: {
    id: string;
    type: string;
    subtype: string;
    prompt: string;
    answer: string;
    explanationZh: string;
    options: Record<string, string>;
    tags: string[];
    listeningScript: string | null;
    grammarPoint: string | null;
  };
};

type Answer = "A" | "B" | "C" | "D";

type RetryState = {
  selectedAnswer: Answer | null;
  submitting: boolean;
  result: {
    isCorrect: boolean;
    correctAnswer: Answer;
    explanationZh: string;
  } | null;
};

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } };

export function MistakesPanel({
  initialMistakes,
}: {
  initialMistakes: MistakeItem[];
}) {
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("active");
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryStates, setRetryStates] = useState<Record<string, RetryState>>({});

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (type !== "all") {
      params.set("type", type);
    }

    if (status !== "active") {
      params.set("status", status);
    }

    if (tag.trim()) {
      params.set("tag", tag.trim());
    }

    return params.toString();
  }, [status, tag, type]);

  async function loadMistakes() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mistakes${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse<MistakeItem[]>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setMistakes(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "读取错题失败。");
    } finally {
      setLoading(false);
    }
  }

  async function patchMistake(id: string, action: string, note?: string) {
    const response = await fetch(`/api/mistakes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const payload = (await response.json()) as ApiResponse<unknown>;

    if (!payload.ok) {
      setError(payload.error.message);
      return;
    }

    await loadMistakes();
  }

  function startRetry(id: string) {
    setRetryStates((current) => ({
      ...current,
      [id]: {
        selectedAnswer: null,
        submitting: false,
        result: null,
      },
    }));
  }

  function selectRetryAnswer(id: string, selectedAnswer: Answer) {
    setRetryStates((current) => ({
      ...current,
      [id]: {
        selectedAnswer,
        submitting: false,
        result: current[id]?.result ?? null,
      },
    }));
  }

  async function submitRetry(mistake: MistakeItem) {
    const retryState = retryStates[mistake.id];

    if (!retryState?.selectedAnswer) {
      return;
    }

    setRetryStates((current) => ({
      ...current,
      [mistake.id]: {
        ...retryState,
        submitting: true,
      },
    }));
    setError(null);

    try {
      const response = await fetch("/api/practice-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: mistake.question.id,
          userAnswer: retryState.selectedAnswer,
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

      setRetryStates((current) => ({
        ...current,
        [mistake.id]: {
          selectedAnswer: retryState.selectedAnswer,
          submitting: false,
          result: payload.data.result,
        },
      }));
      await loadMistakes();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "重新练习提交失败。",
      );
      setRetryStates((current) => ({
        ...current,
        [mistake.id]: {
          ...retryState,
          submitting: false,
        },
      }));
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Badge variant="outline" className="gap-1.5">
          <Filter className="size-3.5" />
          Gate 4 / T11
        </Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
            错题本
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            查看错误次数、答案解析和薄弱标签，逐步把错题标记为已掌握。
          </p>
        </div>
      </section>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>读取失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部题型</SelectItem>
              <SelectItem value="listening">听力</SelectItem>
              <SelectItem value="grammar">语法</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">默认错题</SelectItem>
              <SelectItem value="new">新错题</SelectItem>
              <SelectItem value="reviewing">复习中</SelectItem>
              <SelectItem value="mastered">已掌握</SelectItem>
              <SelectItem value="removed">已移除</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="按标签筛选"
          />
          <Button variant="outline" onClick={loadMistakes} disabled={loading}>
            <RefreshCw className="size-4" />
            应用筛选
          </Button>
        </CardContent>
      </Card>

      {mistakes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>暂无错题</CardTitle>
            <CardDescription>
              答错题目后会自动进入这里。当前筛选条件下没有记录。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mistakes.map((mistake) => (
            <Card key={mistake.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{mistake.question.type}</Badge>
                      <Badge variant="outline">{mistake.status}</Badge>
                      <Badge variant="outline">
                        错误 {mistake.wrongCount} 次
                      </Badge>
                    </div>
                    <CardTitle>{mistake.question.prompt}</CardTitle>
                    <CardDescription>
                      正确答案：{mistake.question.answer}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => startRetry(mistake.id)}
                    >
                      <RefreshCw className="size-4" />
                      重新练习
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => patchMistake(mistake.id, "mark-mastered")}
                    >
                      <CheckCircle2 className="size-4" />
                      已掌握
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => patchMistake(mistake.id, "remove")}
                    >
                      <Trash2 className="size-4" />
                      移除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(mistake.question.options).map(([key, value]) => (
                    <div key={key} className="rounded-lg border bg-muted/30 p-3">
                      <span className="font-semibold">{key}. </span>
                      {value}
                    </div>
                  ))}
                </div>
                <Separator />
                <p className="text-sm leading-6 text-muted-foreground">
                  {mistake.question.explanationZh}
                </p>
                {mistake.question.listeningScript ? (
                  <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
                    {mistake.question.listeningScript}
                  </div>
                ) : null}
                {retryStates[mistake.id] ? (
                  <div className="space-y-3 rounded-lg border bg-background p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">重新练习</p>
                        <p className="text-sm text-muted-foreground">
                          选择答案后提交，会写入新的练习记录。
                        </p>
                      </div>
                      <Badge variant="outline">
                        {retryStates[mistake.id].selectedAnswer
                          ? `已选择 ${retryStates[mistake.id].selectedAnswer}`
                          : "未选择"}
                      </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["A", "B", "C", "D"] as Answer[]).map((answer) => (
                        <Button
                          key={answer}
                          variant="outline"
                          className={
                            retryStates[mistake.id].selectedAnswer === answer
                              ? "justify-start border-emerald-300 bg-emerald-50 text-emerald-950"
                              : "justify-start"
                          }
                          onClick={() => selectRetryAnswer(mistake.id, answer)}
                          disabled={retryStates[mistake.id].submitting}
                        >
                          <span className="font-semibold">{answer}. </span>
                          <span className="truncate">
                            {mistake.question.options[answer]}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {retryStates[mistake.id].result ? (
                        <Alert
                          className={
                            retryStates[mistake.id].result?.isCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                              : "border-rose-200 bg-rose-50 text-rose-950"
                          }
                        >
                          <AlertTitle>
                            {retryStates[mistake.id].result?.isCorrect
                              ? "回答正确"
                              : "回答错误"}
                          </AlertTitle>
                          <AlertDescription>
                            正确答案：
                            {retryStates[mistake.id].result?.correctAnswer}。
                            {retryStates[mistake.id].result?.explanationZh}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          复练结果会同步进入练习记录；再次答错会更新错题次数。
                        </p>
                      )}
                      <Button
                        onClick={() => submitRetry(mistake)}
                        disabled={
                          !retryStates[mistake.id].selectedAnswer ||
                          retryStates[mistake.id].submitting
                        }
                      >
                        <Send className="size-4" />
                        {retryStates[mistake.id].submitting
                          ? "提交中"
                          : "提交复练"}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <Input
                  defaultValue={mistake.note || ""}
                  placeholder="添加复习笔记后回车保存"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void patchMistake(
                        mistake.id,
                        "update-note",
                        event.currentTarget.value,
                      );
                    }
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
