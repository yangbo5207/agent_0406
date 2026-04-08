import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即刻造梦 · 管理后台",
  description: "即刻造梦管理后台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
