"use client";

import { useState, type FormEvent } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";

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
import { Input } from "@/components/ui/input";

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function LoginPanel({
  setupRequired,
  nextPath,
}: {
  setupRequired: boolean;
  nextPath: string;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as ApiResponse<{
        user: { username: string };
        setupCreated: boolean;
      }>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      window.location.href = nextPath || "/";
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[65vh] max-w-md place-items-center">
      <Card className="w-full border-emerald-100 bg-card/95 shadow-sm">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit gap-1.5">
            <ShieldCheck className="size-3.5" />
            {setupRequired ? "首次初始化" : "安全登录"}
          </Badge>
          <div>
            <CardTitle className="text-2xl">
              {setupRequired ? "创建本机管理员" : "登录 TOEIC Practice Studio"}
            </CardTitle>
            <CardDescription className="mt-2 leading-6">
              {setupRequired
                ? "首次公网分享前先创建管理员账号；之后会关闭公开注册。"
                : "登录后才能生成题目、答题、查看统计或清除数据。"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>认证失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form className="space-y-4" onSubmit={submit}>
            <label className="space-y-2">
              <span className="text-sm font-medium">用户名</span>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="admin"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">密码</span>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  setupRequired ? "new-password" : "current-password"
                }
                minLength={8}
                type="password"
                placeholder="至少 8 位"
              />
            </label>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {setupRequired ? "创建并登录" : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
