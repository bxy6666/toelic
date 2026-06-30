import { FilePlus2, UploadCloud } from "lucide-react";
import Link from "next/link";

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
import { listPapers } from "@/lib/paper-service";

export default async function PapersPage() {
  const user = await requireUserFromServer();
  const papers = await listPapers(user.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Paper Domain</p>
          <h1 className="text-3xl font-semibold tracking-normal">试卷</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            管理整卷、版本和发布状态；本阶段通过手工录入或 seed 形成演示数据。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/papers/import">
              <UploadCloud />
              Upload import
            </Link>
          </Button>
        <Button asChild>
          <Link href="/papers/new">
            <FilePlus2 />
            创建 Paper
          </Link>
        </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-2 py-2 text-sm text-muted-foreground">
          <p>
            本地示例试卷可通过 <code>npm run seed:papers</code> 导入。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4" data-testid="papers-list">
        {papers.map((paper) => {
          const publishedCount = paper.versions.filter(
            (version) => version.status === "published",
          ).length;
          return (
            <Card
              key={paper.id}
              data-testid={
                paper.sourceKey ? `paper-card-${paper.sourceKey}` : undefined
              }
            >
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/papers/${paper.id}`}
                    className="hover:underline"
                    data-testid={
                      paper.sourceKey
                        ? `paper-detail-link-${paper.sourceKey}`
                        : undefined
                    }
                  >
                    {paper.title}
                  </a>
                  <Badge variant="secondary">{paper.status}</Badge>
                </CardTitle>
                <CardDescription>
                  {paper.description || "暂无说明"} · {paper.versions.length} 个版本 ·{" "}
                  {publishedCount} 个已发布 · {paper.attemptCount} 次作答
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <a href={`/papers/${paper.id}`}>查看详情</a>
                </Button>
                {paper.versions.slice(0, 3).map((version) => (
                  <Badge key={version.id} variant="outline">
                    {version.versionLabel}: {version.status} · {version.itemCount} 题
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {papers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              还没有试卷。先创建一个 Paper，或运行 seed 导入样例。
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
