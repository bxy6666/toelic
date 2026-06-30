"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FilePlus2,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

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

type ApiPayload<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type PaperSectionView = {
  id: string;
  sectionCode: string | null;
  title: string;
  instructions: string | null;
  orderIndex: number;
};

type QuestionOptionView = {
  id: string;
  optionKey: string;
  optionText: string;
  orderIndex: number;
};

type QuestionItemView = {
  id: string;
  sectionId: string | null;
  questionNo: string;
  stem: string;
  answer: { choice?: string };
  explanation: { zh?: string };
  difficulty: string | null;
  orderIndex: number;
  options: QuestionOptionView[];
};

type PaperVersionView = {
  id: string;
  paperId: string;
  versionLabel: string;
  status: string;
  defaultDurationSeconds: number;
  sections: PaperSectionView[];
  items: QuestionItemView[];
};

type AttemptView = {
  id: string;
  expiresAt: string;
  status: string;
};

type ImportedItemView = {
  questionNo: string;
  stem: string;
  answerChoice?: string;
  answerSource: "document" | "ai" | "missing";
  options: { optionKey: string; optionText: string }[];
};

type PaperImportJobView = {
  id: string;
  status: string;
  progress: number;
  error: { code: string; message: string } | null;
  result: {
    title: string;
    versionLabel: string;
    missingAnswerCount: number;
    parserName: string;
    confidence: number;
    items: ImportedItemView[];
  } | null;
  paperId: string | null;
  paperVersionId: string | null;
  completedAt: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedFile: {
    originalName: string;
    extension: string;
    sizeBytes: number;
    status: string;
  } | null;
};

async function requestJson<T>(
  url: string,
  init: RequestInit & { body?: BodyInit | null } = {},
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const payload = (await response.json()) as ApiPayload<T>;

  if (!payload.ok) {
    throw new Error(payload.error.message || payload.error.code);
  }

  return payload.data;
}

function readForm(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

export function PaperCreateForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const value = readForm(event.currentTarget);
      const paper = await requestJson<{ id: string }>("/api/papers", {
        method: "POST",
        body: JSON.stringify({
          title: value.title,
          description: value.description,
          sourceKey: value.sourceKey,
        }),
      });
      window.location.href = `/papers/${paper.id}`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "创建失败");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        试卷标题
        <Input name="title" required placeholder="TOEIC Practice Set" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        来源标识
        <Input name="sourceKey" placeholder="manual-paper-001" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        说明
        <Input name="description" placeholder="本地手工维护试卷" />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <FilePlus2 />}
        创建 Paper
      </Button>
    </form>
  );
}

export function PaperImportWorkspace({
  initialJobs = [],
}: {
  initialJobs?: PaperImportJobView[];
}) {
  const [job, setJob] = useState<PaperImportJobView | null>(null);
  const [jobs, setJobs] = useState<PaperImportJobView[]>(initialJobs);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"upload" | "answers" | "apply" | "">("");

  function rememberJob(nextJob: PaperImportJobView) {
    setJob(nextJob);
    setJobs((current) => [
      nextJob,
      ...current.filter((item) => item.id !== nextJob.id),
    ]);
  }

  async function selectJob(jobId: string) {
    setError("");
    try {
      const selected = await requestJson<PaperImportJobView>(
        `/api/paper-imports/${jobId}`,
      );
      rememberJob(selected);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Import load failed");
    }
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending("upload");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/paper-imports", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as ApiPayload<PaperImportJobView>;
      if (!payload.ok) {
        throw new Error(payload.error.message || payload.error.code);
      }
      rememberJob(payload.data);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setPending("");
    }
  }

  async function completeAnswers() {
    if (!job) {
      return;
    }

    setError("");
    setPending("answers");
    try {
      const updated = await requestJson<PaperImportJobView>(
        `/api/paper-imports/${job.id}/complete-answers`,
        { method: "POST" },
      );
      rememberJob(updated);
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "AI answer completion failed",
      );
    } finally {
      setPending("");
    }
  }

  async function applyImport() {
    if (!job) {
      return;
    }

    setError("");
    setPending("apply");
    try {
      const applied = await requestJson<{ editUrl: string }>(
        `/api/paper-imports/${job.id}/apply`,
        { method: "POST" },
      );
      window.location.href = applied.editUrl;
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Apply failed");
      setPending("");
    }
  }

  const missingAnswerCount = job?.result?.missingAnswerCount ?? 0;
  const canApply = job?.status === "ready" && missingAnswerCount === 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="grid gap-4 rounded-lg border border-cyan-200 bg-cyan-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Import lab</h2>
              <p className="text-sm text-muted-foreground">
                Upload, parse, review answers, then create a draft version.
              </p>
            </div>
            <Badge variant="secondary">PDF / DOCX</Badge>
          </div>
          <div className="grid gap-2 text-sm md:grid-cols-3">
            {["1 Upload", "2 Review", "3 Draft"].map((step) => (
              <div
                key={step}
                className="rounded-lg border bg-background px-3 py-2 font-medium"
              >
                {step}
              </div>
            ))}
          </div>
          <form
            onSubmit={upload}
            className="grid gap-3"
            data-testid="paper-import-upload"
          >
            <Input name="file" type="file" accept=".pdf,.docx" required />
            <div className="grid gap-3 md:grid-cols-3">
              <Input name="title" placeholder="Paper title" />
              <Input name="sourceKey" placeholder="source-key" />
              <Input name="versionLabel" placeholder="v1" />
            </div>
            <Button type="submit" disabled={pending === "upload"}>
              {pending === "upload" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud />
              )}
              Upload and parse
            </Button>
          </form>
        </div>

        <Card data-testid="paper-import-history">
          <CardHeader>
            <CardTitle>Recent imports</CardTitle>
            <CardDescription>Resume a previous import without re-uploading.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No imports yet.</p>
            ) : null}
            {jobs.map((item) => (
              <div
                key={item.id}
                className={`grid gap-2 rounded-lg border px-3 py-2 text-sm ${
                  job?.id === item.id ? "border-primary bg-secondary" : "bg-background"
                }`}
              >
                <span className="flex items-center justify-between gap-2 font-medium">
                  <span className="truncate">
                    {item.uploadedFile?.originalName ?? item.id}
                  </span>
                  <Badge variant={item.status === "ready" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.result?.items.length ?? 0} questions - updated{" "}
                  {new Date(item.updatedAt).toLocaleString()}
                </span>
                <span className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => selectJob(item.id)}
                  >
                    Load
                  </Button>
                  {item.paperVersionId ? (
                    <a
                      href={`/paper-versions/${item.paperVersionId}/edit`}
                      className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-primary hover:underline"
                    >
                      Open draft
                    </a>
                  ) : null}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {job ? (
        <Card data-testid="paper-import-result">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              Import job
              <Badge variant={job.status === "ready" ? "default" : "secondary"}>
                {job.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              {job.uploadedFile?.originalName ?? "Uploaded file"} · {job.progress}%
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {job.error ? (
              <p className="text-sm text-destructive">
                {job.error.code}: {job.error.message}
              </p>
            ) : null}

            {job.result ? (
              <>
                <div
                  className="grid gap-2 rounded-lg border bg-background p-3 text-sm"
                  data-testid="paper-import-summary"
                  data-missing={missingAnswerCount}
                >
                  <div className="font-medium">{job.result.title}</div>
                  <div className="text-muted-foreground">
                    {job.result.items.length} questions · {missingAnswerCount} missing
                    answers · {job.result.parserName}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending === "answers" || missingAnswerCount === 0}
                    onClick={completeAnswers}
                  >
                    {pending === "answers" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 />
                    )}
                    AI complete answers
                  </Button>
                  <Button
                    type="button"
                    disabled={!canApply || pending === "apply"}
                    onClick={applyImport}
                  >
                    {pending === "apply" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FilePlus2 />
                    )}
                    Create draft version
                  </Button>
                </div>

                <div className="grid gap-3">
                  {job.result.items.map((item) => (
                    <div
                      key={item.questionNo}
                      className="grid gap-2 rounded-lg border bg-background p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 font-medium">
                        {item.questionNo}. {item.stem}
                        <Badge
                          variant={
                            item.answerSource === "missing"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {item.answerChoice
                            ? `${item.answerChoice} · ${item.answerSource}`
                            : "missing answer"}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-muted-foreground">
                        {item.options.map((option) => (
                          <div key={option.optionKey}>
                            {option.optionKey}. {option.optionText}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function PaperVersionCreateForm({ paperId }: { paperId: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const value = readForm(event.currentTarget);
      const version = await requestJson<{ id: string }>(
        `/api/papers/${paperId}/versions`,
        {
          method: "POST",
          body: JSON.stringify({
            versionLabel: value.versionLabel,
            defaultDurationSeconds: Number(value.defaultDurationSeconds) || 7200,
          }),
        },
      );
      window.location.href = `/paper-versions/${version.id}/edit`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "创建失败");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
      <Input name="versionLabel" required placeholder="v1" />
      <Input
        name="defaultDurationSeconds"
        type="number"
        min={60}
        defaultValue={7200}
      />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <FilePlus2 />}
        新建版本
      </Button>
      {error ? (
        <p className="text-sm text-destructive md:col-span-3">{error}</p>
      ) : null}
    </form>
  );
}

export function PublishVersionButton({ versionId }: { versionId: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function publish() {
    setPending(true);
    setError("");

    try {
      await requestJson(`/api/paper-versions/${versionId}/publish`, {
        method: "POST",
      });
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "发布失败");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        onClick={publish}
        disabled={pending}
        data-testid="publish-version-button"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 />}
        发布版本
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function PaperVersionEditor({ version }: { version: PaperVersionView }) {
  const isDraft = version.status === "draft";
  const [error, setError] = useState("");
  const sectionsById = useMemo(
    () => new Map(version.sections.map((section) => [section.id, section])),
    [version.sections],
  );

  async function submitSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const value = readForm(event.currentTarget);

    try {
      await requestJson(`/api/paper-versions/${version.id}/sections`, {
        method: "POST",
        body: JSON.stringify({
          title: value.title,
          sectionCode: value.sectionCode,
          instructions: value.instructions,
          orderIndex: Number(value.orderIndex) || undefined,
        }),
      });
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    }
  }

  async function submitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const value = readForm(event.currentTarget);
    const options = ["A", "B", "C", "D"].map((optionKey, index) => ({
      optionKey,
      optionText: String(value[`option${optionKey}`] ?? ""),
      orderIndex: index + 1,
    }));

    try {
      await requestJson(`/api/paper-versions/${version.id}/items`, {
        method: "POST",
        body: JSON.stringify({
          sectionId: value.sectionId || null,
          questionNo: value.questionNo,
          stem: value.stem,
          difficulty: value.difficulty,
          answerChoice: value.answerChoice,
          explanationZh: value.explanationZh,
          orderIndex: Number(value.orderIndex) || undefined,
          options,
        }),
      });
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    }
  }

  async function deleteResource(url: string) {
    setError("");
    try {
      await requestJson(url, { method: "DELETE" });
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "删除失败");
    }
  }

  async function updateItem(
    event: React.FormEvent<HTMLFormElement>,
    itemId: string,
  ) {
    event.preventDefault();
    setError("");
    const value = readForm(event.currentTarget);
    const options = ["A", "B", "C", "D"].map((optionKey, index) => ({
      optionKey,
      optionText: String(value[`option${optionKey}`] ?? ""),
      orderIndex: index + 1,
    }));

    try {
      await requestJson(`/api/question-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({
          sectionId: value.sectionId || null,
          questionNo: value.questionNo,
          stem: value.stem,
          difficulty: value.difficulty,
          answerChoice: value.answerChoice,
          explanationZh: value.explanationZh,
          orderIndex: Number(value.orderIndex) || undefined,
          options,
        }),
      });
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "更新失败");
    }
  }

  return (
    <div className="grid gap-6">
      {!isDraft ? (
        <Card data-testid="version-readonly-notice">
          <CardContent className="py-2 text-sm text-muted-foreground">
            当前版本为 {version.status}，题目、选项和分区只读。
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>分区</CardTitle>
          <CardDescription>按显示顺序组织试卷内容。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isDraft ? (
            <form
              onSubmit={submitSection}
              className="grid gap-3 md:grid-cols-4"
              data-testid="add-section-form"
            >
              <Input name="title" required placeholder="Part 5" />
              <Input name="sectionCode" placeholder="part5" />
              <Input name="orderIndex" type="number" placeholder="1" />
              <Button type="submit">添加分区</Button>
              <Input
                name="instructions"
                className="md:col-span-4"
                placeholder="分区说明"
              />
            </form>
          ) : null}
          <div className="grid gap-2">
            {version.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <span>
                  {section.orderIndex}. {section.title}
                  {section.sectionCode ? (
                    <span className="ml-2 text-muted-foreground">
                      {section.sectionCode}
                    </span>
                  ) : null}
                </span>
                {isDraft ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      deleteResource(`/api/paper-sections/${section.id}`)
                    }
                    aria-label="删除分区"
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isDraft ? (
        <Card>
          <CardHeader>
            <CardTitle>新增题目</CardTitle>
            <CardDescription>首版仅支持 single_choice。</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionItemForm sections={version.sections} onSubmit={submitItem} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {version.items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                {item.questionNo} · {item.stem}
              </CardTitle>
              <CardDescription>
                {sectionsById.get(item.sectionId ?? "")?.title ?? "未分区"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <QuestionItemForm
                item={item}
                sections={version.sections}
                disabled={!isDraft}
                onSubmit={(event) => updateItem(event, item.id)}
              />
              {isDraft ? (
                <div className="flex flex-wrap gap-2">
                  {item.options.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        deleteResource(`/api/question-options/${option.id}`)
                      }
                    >
                      <Trash2 />
                      删除 {option.optionKey}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteResource(`/api/question-items/${item.id}`)}
                  >
                    <Trash2 />
                    删除题目
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionItemForm({
  item,
  sections,
  disabled = false,
  onSubmit,
}: {
  item?: QuestionItemView;
  sections: PaperSectionView[];
  disabled?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const optionValue = (key: string) =>
    item?.options.find((option) => option.optionKey === key)?.optionText ?? "";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3"
      data-testid={item ? "edit-item-form" : "add-item-form"}
    >
      <div className="grid gap-3 md:grid-cols-[120px_1fr_130px_110px]">
        <Input
          name="questionNo"
          required
          disabled={disabled}
          defaultValue={item?.questionNo}
          placeholder="101"
        />
        <Input
          name="stem"
          required
          disabled={disabled}
          defaultValue={item?.stem}
          placeholder="题干"
        />
        <Input
          name="difficulty"
          disabled={disabled}
          defaultValue={item?.difficulty ?? ""}
          placeholder="medium"
        />
        <Input
          name="orderIndex"
          type="number"
          disabled={disabled}
          defaultValue={item?.orderIndex}
          placeholder="1"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_120px]">
        <select
          name="sectionId"
          disabled={disabled}
          defaultValue={item?.sectionId ?? ""}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
        >
          <option value="">未分区</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
        <select
          name="answerChoice"
          disabled={disabled}
          defaultValue={item?.answer.choice ?? "A"}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
        >
          {["A", "B", "C", "D"].map((key) => (
            <option key={key} value={key}>
              答案 {key}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {["A", "B", "C", "D"].map((key) => (
          <Input
            key={key}
            name={`option${key}`}
            required
            disabled={disabled}
            defaultValue={optionValue(key)}
            placeholder={`${key} 选项`}
          />
        ))}
      </div>
      <Input
        name="explanationZh"
        disabled={disabled}
        defaultValue={item?.explanation.zh ?? ""}
        placeholder="中文解析"
      />
      {!disabled ? <Button type="submit">保存题目</Button> : null}
    </form>
  );
}

export function PaperTakeWorkspace({
  version,
  initialAttempt = null,
  initialAnswers = {},
}: {
  version: PaperVersionView & { paper: { title: string } };
  initialAttempt?: AttemptView | null;
  initialAnswers?: Record<string, string>;
}) {
  const [attempt, setAttempt] = useState<AttemptView | null>(initialAttempt);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [autosaveStatus, setAutosaveStatus] = useState(
    Object.keys(initialAnswers).length > 0 ? "saved" : "idle",
  );
  const [error, setError] = useState("");
  const [savingItemId, setSavingItemId] = useState("");

  async function startAttempt() {
    setError("");
    setAutosaveStatus("idle");
    try {
      const created = await requestJson<AttemptView>(`/api/paper-versions/${version.id}/attempts`, {
        method: "POST",
        body: JSON.stringify({
          durationSeconds: version.defaultDurationSeconds,
          forceNew: true,
        }),
      });
      setAttempt(created);
      setAnswers({});
      window.history.replaceState(
        null,
        "",
        `/paper-versions/${version.id}/take?attemptId=${created.id}`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "开始失败");
    }
  }

  async function saveAnswer(itemId: string, choice: string) {
    if (!attempt) {
      return;
    }

    setAnswers((current) => ({ ...current, [itemId]: choice }));
    setSavingItemId(itemId);
    setAutosaveStatus("saving");
    setError("");

    try {
      await requestJson(`/api/attempts/${attempt.id}/responses/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ choice }),
      });
      setAutosaveStatus("saved");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
      setAutosaveStatus("error");
    } finally {
      setSavingItemId("");
    }
  }

  async function submitAttempt() {
    if (!attempt) {
      return;
    }

    setError("");
    try {
      await requestJson(`/api/attempts/${attempt.id}/submit`, { method: "POST" });
      window.location.href = `/attempts/${attempt.id}/report`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败");
    }
  }

  return (
    <div
      className="grid gap-6"
      data-testid="paper-take-workspace"
      data-attempt-id={attempt?.id ?? ""}
    >
      <Card>
        <CardHeader>
          <CardTitle>{version.paper.title}</CardTitle>
          <CardDescription>
            {version.versionLabel} · {version.items.length} 题 ·{" "}
            {Math.round(version.defaultDurationSeconds / 60)} 分钟
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {attempt ? (
            <>
              <Badge variant="secondary">
                <Clock className="size-3" />
                <span className="sr-only">
                  {autosaveStatus}
                </span>
                截止 {new Date(attempt.expiresAt).toLocaleTimeString()}
              </Badge>
              <a
                href={`/attempts/${attempt.id}/submit-redirect`}
                data-testid="submit-attempt-button"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
              >
                Submit
              </a>
              <span
                className="text-sm text-muted-foreground"
                data-testid="autosave-status"
                data-status={autosaveStatus}
              >
                Autosave: {autosaveStatus}
              </span>
              <Button onClick={submitAttempt}>提交批改</Button>
            </>
          ) : (
            <>
              <a
                href={`/paper-versions/${version.id}/take/start`}
                data-testid="start-attempt-button"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
              >
                Start attempt
              </a>
            <Button onClick={startAttempt}>开始 / 恢复作答</Button>
            </>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {attempt
        ? version.items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>
                  {item.questionNo}. {item.stem}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {item.options.map((option) => {
                  const active = answers[item.id] === option.optionKey;
                  return (
                    <div key={option.id} className="grid">
                    <a
                      href={`/attempts/${attempt.id}/responses/${item.id}/choices/${option.optionKey}`}
                      role="button"
                      aria-pressed={active}
                      data-testid={`answer-${item.questionNo}-${option.optionKey}`}
                      className={`inline-flex min-h-8 items-center justify-start rounded-lg border px-2.5 py-1.5 text-sm ${
                        active ? "bg-secondary text-secondary-foreground" : "bg-background"
                      }`}
                    >
                      {option.optionKey}. {option.optionText}
                    </a>
                    <Button
                      key={option.id}
                      type="button"
                      variant={active ? "secondary" : "outline"}
                      className="hidden"
                      onClick={() => saveAnswer(item.id, option.optionKey)}
                      aria-pressed={active}
                    >
                      {savingItemId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      {option.optionKey}. {option.optionText}
                    </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        : null}
    </div>
  );
}
