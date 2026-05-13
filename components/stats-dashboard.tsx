"use client";

import type { ComponentType } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  Flame,
  Headphones,
  NotebookTabs,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsData = {
  todayCount: number;
  todayAccuracy: number;
  totalCount: number;
  totalAccuracy: number;
  listeningAccuracy: number;
  grammarAccuracy: number;
  activeMistakeCount: number;
  masteredMistakeCount: number;
  last7Days: Array<{
    date: string;
    count: number;
    correct: number;
  }>;
  weakTags: Array<{
    label: string;
    count: number;
  }>;
};

type StatCardTone = "green" | "mint" | "amber" | "sky" | "lime";

type StatCardItem = {
  label: string;
  value: number;
  unit: string;
  helper: string;
  tone: StatCardTone;
  icon: ComponentType<{ className?: string }>;
  progress?: number;
  badge?: string;
};

const toneStyles: Record<
  StatCardTone,
  {
    card: string;
    icon: string;
    accent: string;
    bar: string;
  }
> = {
  green: {
    card: "from-emerald-50 via-teal-50 to-white border-emerald-100",
    icon: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-900",
    bar: "bg-emerald-500",
  },
  mint: {
    card: "from-teal-50 via-cyan-50 to-white border-teal-100",
    icon: "bg-teal-100 text-teal-700",
    accent: "text-teal-900",
    bar: "bg-teal-500",
  },
  amber: {
    card: "from-amber-50 via-orange-50 to-white border-amber-100",
    icon: "bg-amber-100 text-amber-700",
    accent: "text-amber-950",
    bar: "bg-amber-500",
  },
  sky: {
    card: "from-sky-50 via-cyan-50 to-white border-sky-100",
    icon: "bg-sky-100 text-sky-700",
    accent: "text-sky-950",
    bar: "bg-sky-500",
  },
  lime: {
    card: "from-lime-50 via-emerald-50 to-white border-lime-100",
    icon: "bg-lime-100 text-lime-700",
    accent: "text-lime-950",
    bar: "bg-lime-500",
  },
};

function formatDateLabel(date: string) {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

function CircleMeter({ value, tone }: { value: number; tone: StatCardTone }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative size-14">
      <svg className="-rotate-90" viewBox="0 0 52 52" aria-hidden="true">
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.08)"
          strokeWidth="6"
        />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="6"
          className={toneStyles[tone].accent}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-emerald-950">
        {value}%
      </span>
    </div>
  );
}

function StatsMascot() {
  return (
    <div className="stats-float relative h-40 w-full max-w-60 overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 p-4 shadow-sm">
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/55" />
      <div className="absolute bottom-4 right-4 flex h-20 items-end gap-2">
        <span className="h-10 w-5 rounded-t-full bg-emerald-300/75" />
        <span className="h-16 w-5 rounded-t-full bg-teal-300/75" />
        <span className="h-12 w-5 rounded-t-full bg-amber-300/75" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <Badge className="w-fit bg-white/70 text-emerald-950 shadow-sm">
          report
        </Badge>
        <div className="flex items-end justify-between">
          <div className="grid size-24 rotate-[-3deg] place-items-center rounded-[1.7rem] border-4 border-white/85 bg-white shadow-md">
            <div className="space-y-2 text-center">
              <BookOpenCheck className="mx-auto size-8 text-emerald-700" />
              <div className="flex justify-center gap-3">
                <span className="size-2 rounded-full bg-foreground" />
                <span className="size-2 rounded-full bg-foreground" />
              </div>
              <div className="mx-auto h-1.5 w-8 rounded-full bg-rose-300" />
            </div>
          </div>
          <Sparkles className="mb-2 size-6 text-amber-600" />
        </div>
      </div>
    </div>
  );
}

function StatsHero() {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/80 to-amber-50/70 p-5 shadow-sm md:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="absolute -right-16 top-8 size-52 rounded-full border border-emerald-200/70" />
        <div className="absolute bottom-5 left-1/2 size-2 rounded-full bg-amber-300/80 shadow-[36px_-18px_0_rgba(16,185,129,0.18),76px_16px_0_rgba(14,165,233,0.16)]" />
      </div>
      <div className="relative grid min-h-56 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-emerald-200 bg-white/70 text-emerald-800"
          >
            <BarChart3 className="size-3.5" />
            Gate 4 / T12
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-emerald-950 md:text-5xl">
              学习统计
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-950/65">
              统计直接从练习记录和错题记录计算，保持本机数据一致。
            </p>
          </div>
        </div>
        <StatsMascot />
      </div>
    </section>
  );
}

function StatCard({ item }: { item: StatCardItem }) {
  const Icon = item.icon;
  const tone = toneStyles[item.tone];

  return (
    <Card
      className={cn(
        "group relative min-h-40 overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        tone.card,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/45" />
      <CardHeader className="relative space-y-0 p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription className="font-medium text-foreground/65">
              {item.label}
            </CardDescription>
            <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
          </div>
          <span
            className={cn(
              "stats-icon-breathe grid size-10 place-items-center rounded-2xl shadow-sm",
              tone.icon,
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative flex items-end justify-between gap-3 p-4 pt-1">
        <div>
          {item.badge ? (
            <Badge className="mb-2 bg-white/70 text-amber-900 shadow-sm">
              {item.badge}
            </Badge>
          ) : null}
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-4xl font-semibold tracking-normal tabular-nums text-foreground">
              {item.value}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {item.unit}
            </span>
          </div>
        </div>
        {typeof item.progress === "number" ? (
          <CircleMeter value={item.progress} tone={item.tone} />
        ) : (
          <div className="h-2 w-20 overflow-hidden rounded-full bg-white/65">
            <div className={cn("h-full rounded-full", tone.bar)} style={{ width: "72%" }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WeeklyTrendCard({ data }: { data: StatsData["last7Days"] }) {
  const chartData = data.map((day) => ({
    ...day,
    label: formatDateLabel(day.date),
  }));

  return (
    <Card className="overflow-hidden rounded-[1.5rem] border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-sky-50/50 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-emerald-950">
            <TrendingUp className="size-5 text-emerald-700" />
            最近7天
          </CardTitle>
          <CardDescription>每日练习题数和正确数</CardDescription>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            练习题数
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            正确题数
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 4 }}>
            <defs>
              <linearGradient id="countGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="correctGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(15, 118, 110, 0.12)" strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(16, 185, 129, 0.18)",
                borderRadius: 16,
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
              formatter={(value, name) => [
                `${value} 题`,
                name === "count" ? "练习题数" : "正确题数",
              ]}
            />
            <Legend
              formatter={(value) => (value === "count" ? "练习题数" : "正确题数")}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#059669"
              strokeWidth={3}
              fill="url(#countGradient)"
              dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="correct"
              stroke="#d97706"
              strokeWidth={3}
              fill="url(#correctGradient)"
              dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function WeakTagsMascot() {
  return (
    <div className="relative grid size-20 shrink-0 place-items-center rounded-[1.4rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-emerald-50 shadow-sm">
      <div className="grid size-12 rotate-[-3deg] place-items-center rounded-2xl bg-white shadow-sm">
        <NotebookTabs className="size-7 text-emerald-700" />
      </div>
      <Sparkles className="absolute right-3.5 top-3.5 size-4 text-amber-500" />
    </div>
  );
}

function WeakTagsCard({ tags }: { tags: StatsData["weakTags"] }) {
  const maxCount = Math.max(...tags.map((tag) => tag.count), 1);

  return (
    <Card className="rounded-[1.5rem] border-amber-100 bg-gradient-to-br from-white via-amber-50/55 to-emerald-50/55 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-emerald-950">薄弱标签</CardTitle>
          <CardDescription>按当前错题聚合</CardDescription>
        </div>
        <WeakTagsMascot />
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/60 p-5 text-sm text-muted-foreground">
            暂无薄弱标签。完成更多练习后，这里会自动聚合错题方向。
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              const weight = tag.count / maxCount;
              const isTop = index < 3;

              return (
                <span
                  key={tag.label}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5",
                    isTop
                      ? "border-emerald-200 bg-emerald-100 text-emerald-900"
                      : "border-white/70 bg-white/70 text-foreground/75",
                  )}
                  style={{ fontSize: `${0.82 + weight * 0.16}rem` }}
                >
                  {tag.label} · {tag.count}
                </span>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsDashboard({ stats }: { stats: StatsData }) {
  const summary: StatCardItem[] = [
    {
      label: "今日练习",
      value: stats.todayCount,
      unit: "题",
      helper: "今日已完成",
      tone: "green",
      icon: Flame,
    },
    {
      label: "总练习",
      value: stats.totalCount,
      unit: "题",
      helper: "累计完成",
      tone: "mint",
      icon: NotebookTabs,
    },
    {
      label: "总正确率",
      value: stats.totalAccuracy,
      unit: "%",
      helper: "表现概览",
      tone: "sky",
      icon: Target,
      progress: stats.totalAccuracy,
    },
    {
      label: "当前错题",
      value: stats.activeMistakeCount,
      unit: "待复习",
      helper: "需要回看",
      tone: "amber",
      icon: BookOpenCheck,
      badge: "待复习",
    },
    {
      label: "听力正确率",
      value: stats.listeningAccuracy,
      unit: "%",
      helper: "听音辨义",
      tone: "sky",
      icon: Headphones,
      progress: stats.listeningAccuracy,
    },
    {
      label: "语法正确率",
      value: stats.grammarAccuracy,
      unit: "%",
      helper: "结构判断",
      tone: "mint",
      icon: BookOpenCheck,
      progress: stats.grammarAccuracy,
    },
    {
      label: "已掌握错题",
      value: stats.masteredMistakeCount,
      unit: "题",
      helper: "正反馈",
      tone: "lime",
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <StatsHero />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <WeeklyTrendCard data={stats.last7Days} />
        <WeakTagsCard tags={stats.weakTags} />
      </div>
    </div>
  );
}
