import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FindAwardTicket — 哩程機票搜尋工具",
  description: "登入你的哩程計畫帳號，查詢特定航線/日期的可兌換獎勵機票",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen text-slate-900 antialiased">{children}</body>
    </html>
  );
}
