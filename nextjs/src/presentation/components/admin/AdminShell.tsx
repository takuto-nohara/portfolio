import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { AdminSession } from "@/lib/auth/session";

interface AdminShellProps extends PropsWithChildren {
  readonly session: AdminSession;
  readonly title: string;
  readonly activePath: "works" | "contacts" | "settings";
}

export function AdminShell({ session, title, activePath, children }: AdminShellProps) {
  const navItems = [
    { href: "/admin/works", label: "> 制作物管理", key: "works" },
    { href: "/admin/contacts", label: "> お問い合わせ", key: "contacts" },
    { href: "/admin/settings", label: "> サイト設定", key: "settings" },
  ] as const;

  return (
    <div className="flex min-h-screen bg-surface-secondary text-foreground-primary">
      <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-foreground-primary px-6 py-8">
        <Link href="/" className="mb-12 text-lg font-medium tracking-wide text-surface-primary">
          {"> TN_"}
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded px-3 py-2 text-sm transition-colors ${activePath === item.key ? "bg-surface-primary/10 text-surface-primary" : "text-surface-primary/70 hover:bg-surface-primary/10 hover:text-surface-primary"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mb-4 px-3 text-xs text-surface-primary/50">{session.email}</div>

        <form action="/api/auth/logout" method="post">
          <button type="submit" className="px-3 py-2 text-left text-xs text-surface-primary/50 transition-colors hover:text-surface-primary">
            {"> logout"}
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-surface-primary px-8">
          <h1 className="text-base font-semibold text-foreground-primary">{title}</h1>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}