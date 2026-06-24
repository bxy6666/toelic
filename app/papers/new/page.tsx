import { PaperCreateForm } from "@/components/paper-domain-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserFromServer } from "@/lib/auth";

export default async function NewPaperPage() {
  await requireUserFromServer();

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <p className="text-sm text-muted-foreground">New Paper</p>
        <h1 className="text-3xl font-semibold tracking-normal">创建 Paper</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
          <CardDescription>创建后可继续添加版本和题目。</CardDescription>
        </CardHeader>
        <CardContent>
          <PaperCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
