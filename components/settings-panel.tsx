"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Database,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type SettingsData = {
  hasApiKey: boolean;
  maasBaseUrl: string;
  maasModel: string;
  defaultDifficulty: "easy" | "medium" | "hard";
  defaultQuestionCount: number;
  speechRate: number;
};

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export function SettingsPanel({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [defaultDifficulty, setDefaultDifficulty] =
    useState<SettingsData["defaultDifficulty"]>(
      initialSettings.defaultDifficulty,
    );
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(
    initialSettings.defaultQuestionCount,
  );
  const [speechRate, setSpeechRate] = useState(initialSettings.speechRate);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    return (
      settings.defaultDifficulty !== defaultDifficulty ||
      settings.defaultQuestionCount !== defaultQuestionCount ||
      settings.speechRate !== speechRate
    );
  }, [defaultDifficulty, defaultQuestionCount, settings, speechRate]);

  async function loadSettings() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<SettingsData>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setSettings(payload.data);
      setDefaultDifficulty(payload.data.defaultDifficulty);
      setDefaultQuestionCount(payload.data.defaultQuestionCount);
      setSpeechRate(payload.data.speechRate);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "读取设置失败。",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultDifficulty,
          defaultQuestionCount,
          speechRate,
        }),
      });
      const payload = (await response.json()) as ApiResponse<SettingsData>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setSettings(payload.data);
      setMessage("设置已保存。");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "保存设置失败。",
      );
    } finally {
      setSaving(false);
    }
  }

  async function clearData() {
    setClearing(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: clearConfirmText }),
      });
      const payload = (await response.json()) as ApiResponse<{ cleared: true }>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setMessage("本地学习数据已清除。");
      setClearConfirmText("");
    } catch (clearError) {
      setError(
        clearError instanceof Error ? clearError.message : "清除数据失败。",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Gate 4 / T05
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
              设置
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              查看 MaaS 本地配置状态，调整练习偏好，并管理本机学习数据。
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadSettings} disabled={loading}>
          <RefreshCw className="size-4" />
          刷新
        </Button>
      </section>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>操作失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>已完成</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              MaaS 配置
            </CardTitle>
            <CardDescription>
              API Key 只在服务端读取，浏览器只知道是否已配置。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-3">
              <span className="text-sm text-muted-foreground">API Key</span>
              <Badge variant={settings?.hasApiKey ? "default" : "secondary"}>
                {loading ? "检查中" : settings.hasApiKey ? "已配置" : "未配置"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">MaaS Base URL</p>
              <p className="break-all rounded-lg border bg-muted/40 p-3 text-sm">
                {settings.maasBaseUrl}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">MaaS Model</p>
              <p className="rounded-lg border bg-muted/40 p-3 text-sm">
                {settings.maasModel}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>练习偏好</CardTitle>
            <CardDescription>
              保存后会作为后续生成题目和播放听力的默认值。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">默认难度</span>
                <Select
                  value={defaultDifficulty}
                  onValueChange={(value) =>
                    setDefaultDifficulty(value as SettingsData["defaultDifficulty"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficultyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">默认题量</span>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={defaultQuestionCount}
                  onChange={(event) =>
                    setDefaultQuestionCount(Number(event.target.value))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">听力语速</span>
                <Input
                  type="number"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={speechRate}
                  onChange={(event) => setSpeechRate(Number(event.target.value))}
                />
              </label>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {dirty ? "有未保存的修改。" : "当前偏好已同步。"}
              </p>
              <Button onClick={saveSettings} disabled={!dirty || saving}>
                <Save className="size-4" />
                {saving ? "保存中" : "保存设置"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            本地数据
          </CardTitle>
          <CardDescription>
            清除题目、练习记录和错题记录；学习偏好会保留。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            这个操作不可撤销，执行前需要二次确认。
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="size-4" />
                清除学习数据
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认清除本地学习数据？</DialogTitle>
                <DialogDescription>
                  将删除已生成题目、练习记录和错题记录。输入 CLEAR 后才能继续。
                </DialogDescription>
              </DialogHeader>
              <Input
                value={clearConfirmText}
                onChange={(event) => setClearConfirmText(event.target.value)}
                placeholder="CLEAR"
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={clearData}
                    disabled={clearing || clearConfirmText !== "CLEAR"}
                  >
                    {clearing ? "清除中" : "确认清除"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
