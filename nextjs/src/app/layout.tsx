import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
    <html lang="ja" className={`${jetbrainsMono.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full bg-surface-primary text-foreground-primary font-mono">
        <Script id="transition-arrival-style" strategy="beforeInteractive">{`try{if(sessionStorage.getItem('portfolio-transition-active')){var s=document.createElement('style');s.id='portfolio-transition-arrival-style';s.textContent='#transition-overlay{opacity:1!important;pointer-events:auto!important;transition:none!important}main[data-site-main="true"]{opacity:0!important}';document.head.appendChild(s)}}catch(e){}`}</Script>
        <div id="transition-overlay" aria-hidden="true">
          <span id="transition-text" />
        </div>
        {children}
      </body>
    </html>
  );
}
