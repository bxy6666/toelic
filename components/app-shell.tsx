/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation is more reliable over temporary public tunnels than RSC client routing. */
"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Headphones,
  Home,
  Settings,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/listening", label: "听力练习", icon: Headphones },
  { href: "/grammar", label: "语法练习", icon: BookOpenCheck },
  { href: "/mistakes", label: "错题本", icon: ClipboardList },
  { href: "/stats", label: "学习统计", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-muted/30 text-foreground">
      <div className="app-animated-bg" aria-hidden="true">
        <span className="app-bg-ribbon app-bg-ribbon-a" />
        <span className="app-bg-ribbon app-bg-ribbon-b" />
        <span className="app-bg-grid" />
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <a href="/" className="min-w-0">
            <p className="truncate text-base font-semibold tracking-normal">
              TOEIC Practice Studio
            </p>
            <p className="text-xs text-muted-foreground">本机个人版托业练习</p>
          </a>
          {!isLoginPage ? (
            <nav
              className="flex flex-wrap gap-2 md:flex-nowrap md:overflow-x-auto md:pb-1"
              aria-label="主导航"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Button
                    key={item.href}
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className={cn(
                      "shrink-0 transition-colors",
                      active &&
                        "border border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-50",
                    )}
                  >
                    <a href={item.href} aria-current={active ? "page" : undefined}>
                      <Icon className="size-4" />
                      {item.label}
                    </a>
                  </Button>
                );
              })}
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="size-4" />
                退出
              </Button>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
