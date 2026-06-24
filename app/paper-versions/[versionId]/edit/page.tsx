import { PaperVersionEditor, PublishVersionButton } from "@/components/paper-domain-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserFromServer } from "@/lib/auth";
import { getPaperVersionDetail } from "@/lib/paper-service";

export default async function EditPaperVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const user = await requireUserFromServer();
  const { versionId } = await params;
  const version = await getPaperVersionDetail(user.id, versionId);
  const versionView = {
    id: version.id,
    paperId: version.paperId,
    versionLabel: version.versionLabel,
    status: version.status,
    defaultDurationSeconds: version.defaultDurationSeconds,
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Paper Version</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {version.paper.title} · {version.versionLabel}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{version.status}</Badge>
            <Badge variant="outline">
              {Math.round(version.defaultDurationSeconds / 60)} 分钟
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`/papers/${version.paperId}`}>返回 Paper</a>
          </Button>
          {version.status === "published" ? (
            <Button asChild>
              <a href={`/paper-versions/${version.id}/take`}>开始作答</a>
            </Button>
          ) : null}
        </div>
      </div>

      {version.status === "draft" ? (
        <Card>
          <CardHeader>
            <CardTitle>发布</CardTitle>
            <CardDescription>发布前会校验题目和 A-D 选项完整性。</CardDescription>
          </CardHeader>
          <CardContent>
            <PublishVersionButton versionId={version.id} />
          </CardContent>
        </Card>
      ) : null}

      <PaperVersionEditor version={versionView} />
    </div>
  );
}
