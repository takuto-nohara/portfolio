import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { PublicSettings } from "@/domain/publicApi";
import { siteNavigationItems, siteProfile } from "@/presentation/content/siteContent";

import { ExternalLink } from "./ExternalLink";
import { ScrollProgress } from "./ScrollProgress";
import { SiteEffects } from "./SiteEffects";

interface SiteShellProps extends PropsWithChildren {
  readonly settings: PublicSettings;
  readonly currentPath?: string;
}

function isCurrentPath(currentPath: string | undefined, href: string) {
  if (!currentPath) {
    return false;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteShell({ settings, currentPath, children }: SiteShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="site-grid flex min-h-screen flex-col">
      <a href="#main-content" className="absolute -top-24 left-4 z-[100] rounded bg-ink px-4 py-2.5 text-white focus:top-4">
        本文へ移動
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
        <ScrollProgress />
        <div className="site-container flex min-h-16 items-center justify-between gap-3 sm:min-h-18 sm:gap-6">
          <Link href="/" aria-label="トップへ" className="inline-flex min-h-11 shrink-0 items-center px-1 font-mono whitespace-nowrap text-[17px] font-medium tracking-[0.02em] text-ink">
            <span className="text-sky">&gt;</span>
            <span className="ml-1.5">TN</span>
            <span aria-hidden="true" className="cursor-blink mb-[11px] ml-[3px] inline-block h-0.5 w-[0.6em] self-end bg-sky" />
          </Link>

          <nav aria-label="主要ナビゲーション" className="flex items-center gap-0.5 sm:gap-[clamp(4px,2vw,20px)]">
            {siteNavigationItems.map((item) => {
              const active = isCurrentPath(currentPath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap transition-colors sm:px-2.5 sm:text-[15px] hover:text-link ${active ? "text-ink" : "text-ink-body"}`}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-2 bottom-2 h-0.5 sm:inset-x-2.5 origin-left bg-sky transition-transform duration-300 ease-out-expo ${active ? "scale-x-100" : "scale-x-0"}`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main-content" data-site-main="true" className="flex-1">
        {children}
      </main>

      <footer role="contentinfo" className="border-t border-line bg-paper/80">
        <div className="site-container flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="font-mono text-sm font-medium">
              <span className="text-sky">&gt;</span> TN_
            </span>
            <nav aria-label="フッターナビゲーション" className="flex flex-wrap gap-x-2 gap-y-1">
              {siteNavigationItems.map((item) => (
                <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center px-2 text-sm text-ink-body hover:text-link">
                  {item.label}
                </Link>
              ))}
              {settings.githubUrl ? (
                <ExternalLink href={settings.githubUrl} className="inline-flex min-h-11 items-center px-2 text-sm text-ink-body hover:text-link">
                  GitHub
                </ExternalLink>
              ) : null}
            </nav>
          </div>
          <p className="font-mono text-xs text-ink-muted">{`© ${currentYear} ${siteProfile.nameEn}`}</p>
        </div>
      </footer>

      <SiteEffects />
    </div>
  );
}
