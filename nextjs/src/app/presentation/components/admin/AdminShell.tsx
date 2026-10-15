"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type PropsWithChildren } from "react";

import type { AdminSession } from "@/presentation/types/AdminSession";

import { AdminIcon } from "./AdminIcon";
import { AdminSidebar, type AdminNavCounts } from "./AdminSidebar";

interface AdminShellProps extends PropsWithChildren {
  readonly session: AdminSession;
  readonly counts: AdminNavCounts;
}

/** /admin/works/12/edit → ["admin", "works", "edit"] */
function toCrumbs(pathname: string): readonly string[] {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = parts.filter((part) => !/^\d+$/.test(part)).map((part) => (part === "create" ? "new" : part));
  return ["admin", ...crumbs];
}

export function AdminShell({ session, counts, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const crumbs = toCrumbs(pathname);
  const initials = session.name.trim().slice(0, 2).toUpperCase() || "TN";

  return (
    <div className="flex h-dvh overflow-hidden bg-paper text-sm leading-[1.7] text-ink">
      <AdminSidebar counts={counts} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line bg-paper/85 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="メニューを開く"
            aria-controls="admin-sidebar"
            aria-expanded={mobileOpen}
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded border-0 bg-transparent text-ink-body hover:bg-sky-soft hover:text-link md:hidden"
          >
            <AdminIcon name="menu" />
          </button>
          <ol aria-label="現在地" className="m-0 flex min-w-0 flex-1 list-none gap-2 overflow-hidden p-0 font-mono text-xs whitespace-nowrap text-ink-muted">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={`${index}-${crumb}`} aria-current={last ? "page" : undefined} className={`flex gap-2 ${last ? "font-bold text-ink" : ""}`}>
                  <span className="text-sky">{index === 0 ? "~" : "/"}</span>
                  {crumb}
                </li>
              );
            })}
          </ol>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/admin/contacts"
              title="お問い合わせ"
              aria-label={`お問い合わせ（${counts.contacts} 件）`}
              className="relative grid h-11 w-11 place-items-center rounded text-ink-body hover:bg-sky-soft hover:text-link"
            >
              <AdminIcon name="bell" className="h-[19px] w-[19px]" />
              {counts.contacts > 0 ? <span className="absolute top-[11px] right-[11px] h-[7px] w-[7px] rounded-full bg-sky shadow-[0_0_0_2px_var(--paper)]" /> : null}
            </Link>
            <div role="group" aria-label="アカウント" className="hidden h-11 items-center gap-2.5 pr-1.5 pl-2.5 sm:flex">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-ink font-mono text-[11px] font-bold text-white">{initials}</span>
              <div className="max-w-[180px] leading-[1.3]">
                <p className="m-0 truncate text-xs font-bold">{session.name}</p>
                <p className="m-0 truncate font-mono text-[11px] text-ink-muted">{session.email}</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                title="ログアウト"
                aria-label="ログアウト"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded border-0 bg-transparent text-ink-body hover:bg-sky-soft hover:text-link"
              >
                <AdminIcon name="log-out" className="h-[19px] w-[19px]" />
              </button>
            </form>
          </div>
        </header>

        <main className="admin-grid min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
