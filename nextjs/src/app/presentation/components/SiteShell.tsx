import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { PublicSettings } from "@/domain/publicApi";

import { SiteEffects } from "./SiteEffects";

interface SiteShellProps extends PropsWithChildren {
  readonly settings: PublicSettings;
}

export function SiteShell({ settings, children }: SiteShellProps) {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border-subtle/0 bg-surface-primary px-6 backdrop-blur-sm sm:px-20">
        <Link
          href="/"
          className="text-[22px] font-medium tracking-wide text-foreground-primary transition-colors hover:text-accent-primary"
        >
          {"> TN_"}
        </Link>
        <nav className="flex items-center gap-10">
          <Link href="/works" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            works()
          </Link>
          <Link href="/about" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            about()
          </Link>
          <Link href="/contact" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            contact()
          </Link>
        </nav>
      </header>

      <main data-site-main="true" className="flex-1">
        {children}
      </main>

      <footer className="flex flex-col items-center gap-6 bg-surface-secondary px-6 py-15 sm:px-20">
        <span className="text-lg font-medium text-foreground-primary">{"> TN_"}</span>
        <div className="flex items-center gap-8">
          <a
            href={settings.githubUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground-muted transition-colors hover:text-accent-primary"
          >
            github
          </a>
          <a
            href={settings.contactEmail ? `mailto:${settings.contactEmail}` : "#"}
            className="text-xs text-foreground-muted transition-colors hover:text-accent-primary"
          >
            email
          </a>
        </div>
        <p className="text-[11px] text-foreground-muted">&copy; 2025 Takuto Nohara. All rights reserved.</p>
      </footer>

      <div id="transition-overlay" aria-hidden="true">
        <span id="transition-text" />
      </div>

      <SiteEffects />
    </>
  );
}