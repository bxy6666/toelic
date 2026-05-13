import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Practice Studio",
  description: "本机个人版托业听力与语法练习应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="font-sans">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
