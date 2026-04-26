import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Inter 폰트 설정
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Focus App",
  description: "타임 영수증과 함께하는 몰입 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
