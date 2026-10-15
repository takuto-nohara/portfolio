"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AdminIcon } from "./AdminIcon";
import { adminIconButton } from "./adminStyles";

interface AdminDrawerProps {
  readonly kicker: string;
  readonly title: string;
  readonly onClose: () => void;
  readonly toolbar: ReactNode;
  readonly children: ReactNode;
}

/** 一覧の行を選んだときに右から出す「選択内容の詳細」 */
export function AdminDrawer({ kicker, title, onClose, toolbar, children }: AdminDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      // 確認ダイアログが開いている間はダイアログ側で Escape を処理する
      if (event.key === "Escape" && !document.querySelector("[role=alertdialog]")) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-ink/30" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="選択内容の詳細"
        className="fixed inset-y-0 right-0 z-50 flex w-[min(640px,100vw)] animate-[drawer-in_0.3s_var(--ease-out)_both] flex-col border-l border-line bg-white/97 text-sm text-ink shadow-[-30px_0_70px_rgba(12,31,46,0.18)] backdrop-blur-xl sm:w-[min(640px,92vw)]"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-[18px] sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-ink-muted">
              <span className="text-sky">{"//"}</span> {kicker}
            </p>
            <h2 className="mt-1.5 mb-0 font-serif text-[22px] leading-[1.4] font-semibold tracking-[0.04em]">{title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} title="閉じる" aria-label="閉じる" className={`${adminIconButton} h-11 w-11`}>
            <AdminIcon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 sm:px-6">{toolbar}</div>
        <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-5 pt-5 pb-8 sm:px-6">{children}</div>
      </aside>
    </>,
    document.body,
  );
}

interface DrawerFactsProps {
  readonly facts: readonly { readonly label: string; readonly value: ReactNode; readonly mono?: boolean }[];
  readonly labelWidth?: string;
}

/** ドロワー内の「項目名 — 値」の一覧 */
export function DrawerFacts({ facts, labelWidth = "120px" }: DrawerFactsProps) {
  return (
    <dl className="m-0 grid border-t border-line" style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr)` }}>
      {facts.map((fact) => (
        <div key={fact.label} className="contents">
          <dt className="border-b border-line py-2.5 text-xs text-ink-muted">{fact.label}</dt>
          <dd className={`m-0 border-b border-line py-2.5 text-[13px] break-all ${fact.mono ? "font-mono" : ""}`}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
