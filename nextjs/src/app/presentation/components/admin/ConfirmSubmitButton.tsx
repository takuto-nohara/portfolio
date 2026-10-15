"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AdminIcon } from "./AdminIcon";

interface ConfirmSubmitButtonProps {
  /** 確定時に送信する <form> の id（ボタンの外に置いたフォームも送信できる） */
  readonly formId: string;
  readonly title: string;
  readonly body: string;
  readonly confirmLabel?: string;
  readonly className: string;
  readonly children: ReactNode;
  readonly ariaLabel?: string;
  readonly role?: "menuitem";
}

/** 破壊的な操作の前に確認ダイアログを出し、確定したらフォームを送信する */
export function ConfirmSubmitButton({ formId, title, body, confirmLabel = "削除する", className, children, ariaLabel, role }: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const confirm = () => {
    const form = document.getElementById(formId);
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
    setOpen(false);
  };

  return (
    <>
      <button type="button" role={role} aria-label={ariaLabel} title={ariaLabel} onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-6" onClick={() => setOpen(false)}>
              <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`${formId}-confirm-title`}
                aria-describedby={`${formId}-confirm-body`}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-[440px] animate-[rise_0.25s_both] rounded border border-line bg-white px-6 pt-6 pb-5 text-ink shadow-[0_30px_80px_rgba(12,31,46,0.3)]"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
                    <AdminIcon name="alert" className="h-5 w-5" />
                  </span>
                  <div>
                    <p id={`${formId}-confirm-title`} className="m-0 text-[17px] leading-normal font-bold">
                      {title}
                    </p>
                    <p id={`${formId}-confirm-body`} className="mt-1.5 mb-0 text-[13px] leading-[1.8] text-ink-body">
                      {body}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    ref={cancelRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11 cursor-pointer rounded border-0 bg-transparent px-4 text-sm font-medium text-ink-body hover:bg-panel"
                  >
                    キャンセル
                  </button>
                  <button type="button" onClick={confirm} className="h-11 cursor-pointer rounded border-0 bg-red-700 px-[18px] text-sm font-bold text-white hover:bg-red-800">
                    {confirmLabel}
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
