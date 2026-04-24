import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TN_ Portfolio",
    template: "%s | TN_ Portfolio",
  },
  description: "Rendering Ideas into Reality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface-primary text-foreground-primary font-mono">
        {children}
      </body>
    </html>
  );
}
