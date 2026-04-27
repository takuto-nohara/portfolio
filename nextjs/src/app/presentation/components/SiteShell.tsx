import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { PublicSettings } from "@/domain/publicApi";
import { siteNavigationItems, siteProfile } from "@/presentation/content/siteProfile";

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

          <nav aria-label="主要ナビゲーション" className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
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
        </div>
      </header>

      <main id="main-content" data-site-main="true" className="flex-1 page-enter">
        {children}
      </main>

      <footer role="contentinfo" className="bg-surface-secondary px-6 py-14 sm:px-20 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-border-subtle/60 pb-10 sm:grid-cols-2 lg:grid-cols-3">
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

          <section>
            <h2 className="text-sm font-semibold text-foreground-primary">プロフィール</h2>
            <p className="mt-4 text-lg font-semibold text-foreground-primary">{siteProfile.nameJa}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent-primary" lang="en">
              {siteProfile.nameEn}
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground-secondary">{siteProfile.summary}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground-primary">Connect</h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground-secondary">
              <li>
                <a
                  href={settings.githubUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent-primary"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={settings.contactEmail ? `mailto:${settings.contactEmail}` : "#"}
                  className="transition-colors hover:text-accent-primary"
                >
                  Email
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-2 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{`© ${currentYear} ${siteProfile.nameEn}`}</p>
          <p>日本語を主とし、英語を補助的に併記しています。</p>
        </div>
      </footer>

      <SiteEffects />
    </>
  );
}