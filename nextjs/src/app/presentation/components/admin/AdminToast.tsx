"use client";

import { useEffect, useState } from "react";

import { AdminIcon } from "./AdminIcon";

export interface AdminToastMessage {
  readonly message: string;
  readonly tone?: "success" | "info" | "error";
}

interface AdminToastProps {
  /** API がリダイレクト時に付与する ?status= の値 */
  readonly status?: string;
  readonly messages: Readonly<Record<string, AdminToastMessage>>;
}

const DISMISS_MS = 4000;

const toneClassName = {
  success: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
  info: "border-line-strong bg-white/95 text-ink",
  error: "border-red-200 bg-red-50/95 text-red-800",
} as const;

const toneIcon = { success: "circle-check", info: "info", error: "circle-alert" } as const;

/** 保存・削除などの結果を右上に一時表示する（?status= はアドレスバーから取り除く） */
export function AdminToast({ status, messages }: AdminToastProps) {
  const toast = status ? messages[status] : undefined;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    window.history.replaceState(window.history.state, "", url);

    // エラーは読み終えるまで残す
    if (toast.tone === "error") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setVisible(false), DISMISS_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  if (!toast || !visible) {
    return null;
  }

  const tone = toast.tone ?? "success";

  return (
    <div aria-live="polite" className="pointer-events-none fixed top-[72px] right-5 z-[90] grid w-[min(360px,calc(100vw-40px))] gap-2">
      <div
        role={tone === "error" ? "alert" : "status"}
        className={`pointer-events-auto flex animate-[rise_0.3s_both] items-center gap-2.5 rounded border py-2.5 pr-2 pl-3.5 text-[13px] shadow-[0_18px_44px_rgba(12,31,46,0.14)] ${toneClassName[tone]}`}
      >
        <AdminIcon name={toneIcon[tone]} className="h-4 w-4" />
        <p className="m-0 flex-1 leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="通知を閉じる"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded border-0 bg-transparent text-current"
        >
          <AdminIcon name="x" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
