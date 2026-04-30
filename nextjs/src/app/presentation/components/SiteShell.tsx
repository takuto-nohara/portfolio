import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { PublicSettings } from "@/domain/publicApi";
import { siteNavigationItems, siteProfile } from "@/presentation/content/siteProfile";

import { MobileNav } from "./MobileNav";
import { SiteEffects } from "./SiteEffects";

interface SiteShellProps extends PropsWithChildren {
  readonly settings: PublicSettings;
  readonly currentPath?: string;
}

function isCurrentPath(currentPath: string | undefined, href: string) {
  if (!currentPath) {
    return false;
  }

  return currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));
}

export function SiteShell({ settings, currentPath, children }: SiteShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface-primary focus:px-4 focus:py-2 focus:text-sm focus:text-foreground-primary">
        本文へ移動
      </a>

      <header className="sticky top-0 z-50 border-b border-border-subtle/60 bg-surface-primary/92 px-6 backdrop-blur-sm sm:px-20">
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" className="group inline-flex flex-col transition-colors hover:text-accent-primary">
            <span className="text-[22px] font-semibold tracking-wide text-foreground-primary group-hover:text-accent-primary">{"> TN_"}</span>
            <span className="text-[11px] text-foreground-muted" lang="en">
              {siteProfile.nameEn}
            </span>
          </Link>

          <nav aria-label="主要ナビゲーション" className="hidden items-center gap-3 sm:flex sm:gap-5">
            {siteNavigationItems.map((item) => {
              const active = isCurrentPath(currentPath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm transition-colors ${active ? "bg-surface-secondary text-accent-primary" : "text-foreground-secondary hover:text-accent-primary"}`}
                >
                  <span className="font-medium">{item.labelJa}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-current/70" lang="en">
                    {item.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>

          <MobileNav />
        </div>
      </header>

      <main id="main-content" data-site-main="true" className="flex-1 page-enter">
        {children}
      </main>

      <footer role="contentinfo" className="bg-surface-secondary px-6 py-14 sm:px-20 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-border-subtle/60 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* プロフィール — 左端 */}
          <section>
            <h2 className="text-sm font-semibold text-foreground-primary">プロフィール</h2>
            <p className="mt-4 text-lg font-semibold text-foreground-primary">{siteProfile.nameJa}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent-primary" lang="en">
              {siteProfile.nameEn}
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground-secondary">{siteProfile.summary}</p>
          </section>

          {/* お問い合わせ — 中央 */}
          <section>
            <h2 className="text-sm font-semibold text-foreground-primary">お問い合わせ</h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground-secondary">
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 transition-colors hover:text-accent-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  お問い合わせフォーム
                </Link>
              </li>
              <li>
                <a
                  href={settings.contactEmail ? `mailto:${settings.contactEmail}` : "#"}
                  className="inline-flex items-center gap-2 transition-colors hover:text-accent-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  メール
                </a>
              </li>
              <li>
                <a
                  href={settings.githubUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-accent-primary"
                >
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </li>
            </ul>
          </section>

          {/* サイトマップ — 右端 */}
          <section>
            <h2 className="text-sm font-semibold text-foreground-primary">サイトマップ</h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground-secondary">
              <li>
                <Link href="/" className="transition-colors hover:text-accent-primary">
                  Top / トップ
                </Link>
              </li>
              {siteNavigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-accent-primary">
                    {item.labelJa}
                    <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-foreground-muted" lang="en">
                      {item.labelEn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mx-auto mt-6 max-w-6xl text-xs text-foreground-muted">
          <p>{`© ${currentYear} ${siteProfile.nameEn}`}</p>
        </div>
      </footer>

      <SiteEffects />
    </>
  );
}