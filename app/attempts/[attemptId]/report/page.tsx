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
import { getAttemptReport } from "@/lib/paper-service";

export default async function AttemptReportPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireUserFromServer();
  const { attemptId } = await params;
  const report = await getAttemptReport(user.id, attemptId);
  const totalItems = report.summary?.totalItems ?? report.items.length;
  const answeredItems =
    report.summary?.answeredItems ??
    report.items.filter((item) => item.response).length;
  const correctItems =
    report.summary?.correctItems ??
    report.items.filter((item) => item.response?.isCorrect).length;
  const wrongItems =
    report.summary?.wrongItems ?? Math.max(0, answeredItems - correctItems);
  const unansweredItems = Math.max(0, totalItems - answeredItems);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Attempt Report</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {report.paper.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {report.version.versionLabel} · {report.attempt.status}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/papers/${report.paper.id}`}>返回试卷</a>
        </Button>
      </div>

      <Card
        data-testid="report-summary"
        data-total={totalItems}
        data-correct={correctItems}
        data-wrong={wrongItems}
        data-unanswered={unansweredItems}
      >
        <CardHeader>
          <CardTitle>总结果</CardTitle>
          <CardDescription>
            服务端提交时间：
            {report.attempt.submittedAt
              ? new Date(report.attempt.submittedAt).toLocaleString()
              : "未提交"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <SummaryMetric label="总题数" value={report.summary?.totalItems ?? 0} />
          <SummaryMetric
            label="已答"
            value={answeredItems}
          />
          <SummaryMetric
            label="正确"
            value={correctItems}
          />
          <SummaryMetric label="Wrong" value={wrongItems} />
          <SummaryMetric label="Unanswered" value={unansweredItems} />
          <SummaryMetric
            label="正确率"
            value={`${Math.round((report.summary?.accuracy ?? 0) * 100)}%`}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {report.items.map((item) => {
          const resultTestId = !item.response
            ? "report-item-unanswered"
            : item.response.isCorrect
              ? "report-item-correct"
              : "report-item-wrong";

          return (
          <Card key={item.id} data-testid={resultTestId}>
            <CardHeader>
              <CardTitle>
                {item.questionNo}. {item.stem}
              </CardTitle>
              <CardDescription>
                你的答案：{item.response?.answer.choice ?? "未答"} · 正确答案：
                {item.answer.choice}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Badge
                variant={item.response?.isCorrect ? "default" : "destructive"}
              >
                {item.response?.isCorrect ? "正确" : "错误"}
              </Badge>
              <div className="grid gap-2 text-sm">
                {item.options.map((option) => (
                  <div key={option.id} className="rounded-lg border px-3 py-2">
                    {option.optionKey}. {option.optionText}
                  </div>
                ))}
              </div>
              {item.explanation.zh ? (
                <p className="text-sm text-muted-foreground">
                  解析：{item.explanation.zh}
                </p>
              ) : null}
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
