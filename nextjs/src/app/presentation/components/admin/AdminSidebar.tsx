"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminIcon, type AdminIconName } from "./AdminIcon";

export interface AdminNavCounts {
  readonly works: number;
  readonly categories: number;
  readonly contacts: number;
}

interface AdminSidebarProps {
  readonly counts: AdminNavCounts;
  readonly mobileOpen: boolean;
  readonly onCloseMobile: () => void;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: AdminIconName;
  readonly count?: number;
}

const COLLAPSE_STORAGE_KEY = "admin-sidebar-collapsed";

export function AdminSidebar({ counts, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1") {
        const frameId = window.requestAnimationFrame(() => setCollapsed(true));
        return () => window.cancelAnimationFrame(frameId);
      }
    } catch {
      // ストレージが使えない環境では展開状態のまま
    }
    return undefined;
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, current ? "0" : "1");
      } catch {
        // 保存できなくても表示の切り替えは行う
      }
      return !current;
    });
  };

  const groups: readonly { readonly label: string; readonly items: readonly NavItem[] }[] = [
    {
      label: "contents",
      items: [
        { href: "/admin/works", label: "作品", icon: "layout-grid", count: counts.works },
        { href: "/admin/categories", label: "文脈カテゴリ", icon: "tags", count: counts.categories },
      ],
    },
    { label: "inbox", items: [{ href: "/admin/contacts", label: "お問い合わせ", icon: "inbox", count: counts.contacts }] },
    { label: "site", items: [{ href: "/admin/settings", label: "サイト設定", icon: "sliders" }] },
  ];

  // モバイルのドロワー表示中は常に展開して見せる
  const expanded = !collapsed || mobileOpen;
  const justify = expanded ? "justify-start" : "justify-center";

  return (
    <>
      {mobileOpen ? <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/30 md:hidden" onClick={onCloseMobile} /> : null}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-60 min-w-0 flex-col overflow-hidden border-r border-line bg-[#f1f5f8] transition-[transform,width] duration-300 ease-out-expo md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${expanded ? "md:w-60" : "md:w-[72px]"}`}
      >
        <div className={`flex h-[60px] shrink-0 items-center gap-2 px-5 ${justify}`}>
          <Link href="/" aria-label="公開サイトのトップへ" className="inline-flex min-h-11 items-center font-mono text-[17px] font-medium tracking-[0.02em] whitespace-nowrap text-ink">
            <span className="text-sky">&gt;</span>
            <span className="ml-1.5">TN</span>
            <span aria-hidden="true" className="cursor-blink mb-1.5 ml-[3px] inline-block h-0.5 w-[0.6em] self-end bg-sky" />
          </Link>
          {expanded ? <span className="rounded-full border border-line-strong px-2 font-mono text-[11px] leading-5 text-ink-muted">admin</span> : null}
        </div>

        <nav aria-label="管理ナビゲーション" className="grid min-h-0 flex-1 content-start gap-[18px] overflow-y-auto px-3 py-2">
          {groups.map((group) => (
            <div key={group.label} className="grid gap-0.5">
              {expanded ? (
                <p className="mb-1 px-2.5 font-mono text-[11px] tracking-[0.08em] text-ink-muted">
                  <span className="text-sky">{"//"}</span> {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-current={active ? "page" : undefined}
                    title={item.label}
                    className={`flex h-11 w-full items-center gap-2.5 rounded-md px-3 text-sm transition-colors hover:bg-white hover:text-link ${justify} ${
                      active ? "bg-white font-bold text-link shadow-[0_1px_0_rgba(12,74,110,0.06),0_2px_10px_rgba(14,165,233,0.14)]" : "font-medium text-ink-body"
                    }`}
                  >
                    <AdminIcon name={item.icon} />
                    {expanded ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                    {expanded && item.count !== undefined ? <span className="font-mono text-[11px] font-normal text-ink-muted">{item.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="grid shrink-0 gap-0.5 border-t border-line px-3 pt-2.5 pb-3.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="公開サイトを開く"
            className={`flex h-11 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium text-ink-body transition-colors hover:bg-white hover:text-link ${justify}`}
          >
            <AdminIcon name="external-link" />
            <span className={expanded ? "" : "sr-only"}>公開サイトを開く</span>
          </a>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar"
            title={collapsed ? "サイドバーを展開する" : "サイドバーを折りたたむ"}
            className={`hidden h-11 w-full cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent px-3 text-[13px] font-medium text-ink-body transition-colors hover:bg-white hover:text-link md:flex ${justify}`}
          >
            <AdminIcon name={collapsed ? "panel-left-open" : "panel-left-close"} />
            <span className={expanded ? "" : "sr-only"}>{collapsed ? "サイドバーを展開する" : "サイドバーを折りたたむ"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
