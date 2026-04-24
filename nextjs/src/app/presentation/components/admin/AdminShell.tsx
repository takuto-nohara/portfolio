import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { AdminSession } from "@/presentation/types/AdminSession";

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
      <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-foreground-primary px-6 py-8 text-white">
        <Link href="/" className="mb-12 text-lg font-medium tracking-wide" style={{ color: "white" }}>
          {"> TN_"}
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded px-3 py-2 text-sm transition-colors ${activePath === item.key ? "bg-white/10" : "bg-white/0 hover:bg-white/10"}`}
              style={{ color: activePath === item.key ? "white" : "rgba(255,255,255,0.7)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mb-4 px-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{session.email}</div>

        <form action="/api/auth/logout" method="post">
          <button type="submit" className="px-3 py-2 text-left text-xs transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
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