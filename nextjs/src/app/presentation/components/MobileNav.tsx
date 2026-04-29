"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { siteNavigationItems, siteProfile } from "@/presentation/content/siteProfile";

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// SSR では false、CSR では true を返す。setState-in-effect を使わずに済む
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Derived state パターン: pathname 変化時に open をリセット（effect 不要）
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useMounted();

  // Escape key closes drawer
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Prevent body scroll — スクロールバー幅を補填してレイアウトずれを防ぐ
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // Focus drawer when opened
  useEffect(() => {
    if (open) {
      drawerRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring sm:hidden"
      >
        <span aria-hidden="true" className="relative flex h-5 w-5 flex-col justify-between">
          <span
            className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${open ? "translate-y-2.25 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${open ? "-translate-y-2.25 -rotate-45" : ""}`}
          />
        </span>
      </button>

      {/* Overlay と Drawer を document.body に Portal する
          — header の backdrop-filter による stacking context の影響を回避 */}
      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-40 bg-foreground-primary/30 transition-opacity duration-300 sm:hidden ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Drawer */}
            <div
              id="mobile-nav-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="ナビゲーション"
              aria-hidden={!open}
              tabIndex={-1}
              className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col shadow-2xl outline-none transition-transform duration-300 ease-in-out sm:hidden ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ backgroundColor: "var(--surface-primary)" }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border-subtle/60 px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-wide text-foreground-primary">{"> TN_"}</span>
                  <span className="text-[11px] text-foreground-muted" lang="en">
                    {siteProfile.nameEn}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="メニューを閉じる"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav aria-label="モバイルナビゲーション" className="flex flex-col gap-1 px-4 py-6">
                {siteNavigationItems.map((item) => {
                  const active = isCurrentPath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                        active
                          ? "bg-surface-secondary text-accent-primary"
                          : "text-foreground-secondary hover:bg-surface-secondary hover:text-accent-primary"
                      }`}
                    >
                      <span className="font-medium">{item.labelJa}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-current/60" lang="en">
                        {item.labelEn}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
