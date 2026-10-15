import type { Metadata } from "next";
import { JetBrains_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// 日本語フォントは unicode-range で分割配信されるため preload しない
const shipporiMincho = Shippori_Mincho_B1({
  variable: "--font-shippori",
  weight: ["500", "600", "700"],
  preload: false,
  display: "swap",
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "野原 拓人 | ポートフォリオ",
    template: "%s | 野原 拓人",
  },
  description: "野原拓人のポートフォリオサイト。何を解決したか・何を担当したかを先に示しながら、作品と経歴を紹介しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${jetbrainsMono.variable} ${shipporiMincho.variable} ${zenKakuGothic.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
