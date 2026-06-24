import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperVersionCreateForm } from "@/components/paper-domain-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserFromServer } from "@/lib/auth";
import { getPaperDetail } from "@/lib/paper-service";

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const user = await requireUserFromServer();
  const { paperId } = await params;
  const paper = await getPaperDetail(user.id, paperId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Paper</p>
          <h1 className="text-3xl font-semibold tracking-normal">{paper.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {paper.description || "暂无说明"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/papers">返回列表</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新建版本</CardTitle>
          <CardDescription>版本发布后才能进入整卷练习。</CardDescription>
        </CardHeader>
        <CardContent>
          <PaperVersionCreateForm paperId={paper.id} />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {paper.versions.map((version) => (
          <Card key={version.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {version.versionLabel}
                <Badge
                  variant={version.status === "published" ? "default" : "secondary"}
                  data-testid={
                    version.status === "published"
                      ? "version-status-published"
                      : undefined
                  }
                  data-version-id={version.id}
                >
                  {version.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {version.sections.length} 个分区 · {version.items.length} 题 ·{" "}
                {version._count.attempts} 次作答
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href={`/paper-versions/${version.id}/edit`}>编辑版本</a>
              </Button>
              {version.status === "published" ? (
                <Button
                  asChild
                  data-testid="version-take-link"
                  data-version-id={version.id}
                >
                  <a href={`/paper-versions/${version.id}/take`}>开始作答</a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
