"use client";

import { useState, type FormEvent } from "react";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";

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

type AuthMode = "login" | "register";

export function LoginPanel({
  setupRequired,
  registrationEnabled,
  nextPath,
}: {
  setupRequired: boolean;
  registrationEnabled: boolean;
  nextPath: string;
}) {
  const [mode, setMode] = useState<AuthMode>(
    setupRequired ? "register" : "login",
  );
  const [username, setUsername] = useState(setupRequired ? "admin" : "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegisterMode = setupRequired || mode === "register";
  const canRegister = setupRequired || registrationEnabled;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isRegisterMode && !canRegister) {
      setError("当前未开放新用户注册。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        isRegisterMode ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );
      const payload = (await response.json()) as ApiResponse<{
        user: { username: string };
        setupCreated: boolean;
      }>;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      window.location.href = nextPath || "/";
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "认证失败。");
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
            {setupRequired
              ? "首次初始化"
              : isRegisterMode
                ? "新用户注册"
                : "安全登录"}
          </Badge>
          <div>
            <CardTitle className="text-2xl">
              {setupRequired
                ? "创建本机管理员"
                : isRegisterMode
                  ? "注册 TOEIC Practice Studio"
                  : "登录 TOEIC Practice Studio"}
            </CardTitle>
            <CardDescription className="mt-2 leading-6">
              {setupRequired
                ? "先创建第一个管理员账号，之后就可以安全进入练习工作区。"
                : isRegisterMode
                  ? "注册后会自动登录；题目、错题、统计和设置会按账号隔离。"
                  : "登录后才能生成题目、答题、查看统计或清除数据。"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!setupRequired ? (
            <div className="mb-4 grid grid-cols-2 rounded-md bg-muted p-1">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                <LogIn className="size-4" />
                登录
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "ghost"}
                disabled={!registrationEnabled}
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
              >
                <UserPlus className="size-4" />
                注册
              </Button>
            </div>
          ) : null}
          {!setupRequired && !registrationEnabled ? (
            <p className="mb-4 text-sm text-muted-foreground">
              当前未开放公开注册，请使用已有账号登录。
            </p>
          ) : null}
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
                placeholder={setupRequired ? "admin" : "your-name"}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">密码</span>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                minLength={8}
                type="password"
                placeholder="至少 8 位"
              />
            </label>
            <Button
              className="w-full"
              disabled={
                loading ||
                !username ||
                password.length < 8 ||
                (isRegisterMode && !canRegister)
              }
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isRegisterMode ? (
                <UserPlus className="size-4" />
              ) : (
                <LogIn className="size-4" />
              )}
              {setupRequired
                ? "创建并登录"
                : isRegisterMode
                  ? "注册并登录"
                  : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
