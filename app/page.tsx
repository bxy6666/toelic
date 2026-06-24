import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Clock3,
  Headphones,
  Sparkles,
  Target,
} from "lucide-react";
import { redirect } from "next/navigation";

import { CartoonSticker } from "@/components/cartoon-sticker";
import { MetricCard } from "@/components/metric-card";
import {
  MotionItem,
  MotionPage,
  MotionStagger,
  MotionSurface,
} from "@/components/motion-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUserFromServer } from "@/lib/auth";
import { getStats } from "@/lib/stats-service";

export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/listening",
    label: "听力练习",
    description: "隐藏选项正文，先听再答",
    icon: Headphones,
  },
  {
    href: "/grammar",
    label: "语法练习",
    description: "围绕语法点生成托业题",
    icon: BookOpenCheck,
  },
  {
    href: "/mistakes",
    label: "错题本",
    description: "回看错因，标记掌握",
    icon: ClipboardList,
  },
  {
    href: "/stats",
    label: "学习统计",
    description: "查看正确率和薄弱标签",
    icon: BarChart3,
  },
];

const planTasks = [
  { label: "听力 Part 2", value: "5 题" },
  { label: "语法专项", value: "8 题" },
  { label: "错题复盘", value: "4 题" },
];

const weakTags = ["时态", "听力细节", "同义替换"];

export default async function Home() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    redirect("/login");
  }

  const stats = await getStats(user.id);
  const statItems = [
    { label: "今日练习", value: stats.todayCount, hint: "题" },
    { label: "今日正确率", value: stats.todayAccuracy, hint: "%" },
    { label: "总练习", value: stats.totalCount, hint: "题" },
    { label: "当前错题", value: stats.activeMistakeCount, hint: "待复习" },
  ];

  return (
    <MotionPage className="space-y-8">
      <section className="relative grid gap-6 overflow-hidden rounded-lg border bg-card/90 p-5 shadow-sm backdrop-blur md:grid-cols-[1.25fr_0.75fr] md:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-300" />
        <div className="space-y-5">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800"
          >
            <Target className="size-3.5" />
            本机个人学习台
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
              TOEIC Practice Studio
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              用 MaaS 生成听力与语法题，记录每次练习，并把错题沉淀成本机复习清单。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <MotionSurface>
              <Button
                className="border-emerald-700 bg-emerald-900 !text-white shadow-sm hover:bg-emerald-800 hover:!text-white [&_svg]:!text-white"
                asChild
              >
                <a href="/listening">
                  <Headphones className="size-4" />
                  开始听力
                </a>
              </Button>
            </MotionSurface>
            <MotionSurface>
              <Button variant="outline" asChild>
                <a href="/grammar">
                  <BookOpenCheck className="size-4" />
                  开始语法
                </a>
              </Button>
            </MotionSurface>
          </div>
          <MotionSurface className="pt-3 sm:pt-5">
            <div className="relative max-w-3xl overflow-hidden rounded-[1.35rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-amber-50/75 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-emerald-200/60 bg-white/45"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute bottom-4 right-5 text-emerald-700/10"
                aria-hidden="true"
              >
                <Headphones className="size-20" strokeWidth={1.5} />
              </div>
              <div className="relative grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-white/75 text-emerald-700 shadow-sm">
                        <Sparkles className="size-4" />
                      </span>
                      <h2 className="text-lg font-semibold tracking-normal text-emerald-950">
                        今日智能练习计划
                      </h2>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-emerald-950/65">
                      根据你的错题情况，为你安排一组轻量练习
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {planTasks.map((task) => (
                      <div
                        key={task.label}
                        className="rounded-2xl border border-white/70 bg-white/60 px-3 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.65)]"
                      >
                        <p className="text-xs text-emerald-950/60">
                          {task.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-950">
                          {task.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-950/70">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/55 px-3 py-0.5">
                      <Clock3 className="size-3.5" />约 18 分钟
                    </span>
                    {weakTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-emerald-100/70 px-3 py-0.5 text-xs font-medium text-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-fit border-emerald-200 bg-white/70 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950"
                  asChild
                >
                  <a href="/grammar">
                    开始今日计划
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </MotionSurface>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr] md:grid-cols-1">
          <CartoonSticker variant="focus" />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-lg border bg-emerald-50/80 p-4">
              <p className="text-sm text-emerald-900/70">今日状态</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-950">
                {stats.todayCount > 0 ? `${stats.todayCount} 题` : "待开始"}
              </p>
            </div>
            <div className="rounded-lg border bg-amber-50/80 p-4">
              <p className="text-sm text-amber-900/70">当前错题</p>
              <p className="mt-2 text-3xl font-semibold text-amber-950">
                {stats.activeMistakeCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <MotionStagger
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        delay={0.08}
      >
        {statItems.map((item) => (
          <MotionItem key={item.label}>
            <MotionSurface>
              <MetricCard
                label={item.label}
                value={item.value}
                unit={item.hint}
              />
            </MotionSurface>
          </MotionItem>
        ))}
      </MotionStagger>

      <MotionStagger className="grid gap-4 lg:grid-cols-4" delay={0.16}>
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <MotionItem key={item.href}>
              <MotionSurface>
                <a
                  href={item.href}
                  className="group block rounded-lg border bg-card/90 p-4 shadow-sm backdrop-blur transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="size-4 text-emerald-700" />
                        {item.label}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              </MotionSurface>
            </MotionItem>
          );
        })}
      </MotionStagger>
    </MotionPage>
  );
}
