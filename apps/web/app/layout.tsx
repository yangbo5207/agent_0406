import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即刻造梦",
  description: "多模态创意工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
