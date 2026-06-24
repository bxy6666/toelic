import { PaperTakeWorkspace } from "@/components/paper-domain-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserFromServer } from "@/lib/auth";
import { getAttemptReport, getPaperVersionDetail } from "@/lib/paper-service";

export default async function TakePaperVersionPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const user = await requireUserFromServer();
  const { versionId } = await params;
  const { attemptId } = await searchParams;
  const version = await getPaperVersionDetail(user.id, versionId);
  const versionView = {
    id: version.id,
    paperId: version.paperId,
    versionLabel: version.versionLabel,
    status: version.status,
    defaultDurationSeconds: version.defaultDurationSeconds,
    paper: { title: version.paper.title },
    sections: version.sections.map((section) => ({
      id: section.id,
      sectionCode: section.sectionCode,
      title: section.title,
      instructions: section.instructions,
      orderIndex: section.orderIndex,
    })),
    items: version.items.map((item) => ({
      id: item.id,
      sectionId: item.sectionId,
      questionNo: item.questionNo,
      stem: item.stem,
      answer: item.answer,
      explanation: item.explanation,
      difficulty: item.difficulty,
      orderIndex: item.orderIndex,
      options: item.options,
    })),
  };

  if (version.status !== "published") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>版本未发布</CardTitle>
          <CardDescription>只有 published 版本可以创建 Attempt。</CardDescription>
        </CardHeader>
        <CardContent>
          <a className="text-sm underline" href={`/paper-versions/${version.id}/edit`}>
            返回编辑
          </a>
        </CardContent>
      </Card>
    );
  }

  const report = attemptId ? await getAttemptReport(user.id, attemptId) : null;
  const initialAnswers = Object.fromEntries(
    report?.items
      .filter((item) => item.response?.answer.choice)
      .map((item) => [item.id, item.response?.answer.choice ?? ""]) ?? [],
  );
  const initialAttempt = report
    ? {
        id: report.attempt.id,
        status: report.attempt.status,
        expiresAt: report.attempt.expiresAt.toISOString(),
      }
    : null;

  return (
    <PaperTakeWorkspace
      version={versionView}
      initialAttempt={initialAttempt}
      initialAnswers={initialAnswers}
    />
  );
}
