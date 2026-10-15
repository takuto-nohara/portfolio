"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { AdminIcon } from "./AdminIcon";
import { adminInput, adminPrimaryButton } from "./adminStyles";

interface LoginState {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
}

const initialState: LoginState = {
  email: "",
  password: "",
  remember: false,
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<LoginState>(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          redirectTo: searchParams.get("redirectTo") ?? "/admin/works",
        }),
      });

      const payload = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "ログインに失敗しました。");
        return;
      }

      router.push(payload.redirectTo ?? "/admin/works");
      router.refresh();
    });
  };

  return (
    <section className="relative w-full max-w-[420px] animate-[rise_0.5s_var(--ease-out)_both] rounded border border-line bg-white px-6 pt-10 pb-8 shadow-[0_30px_80px_rgba(12,31,46,0.08)] sm:px-9">
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 -left-3 h-24 w-24 border-b border-l border-sky" />
      <span aria-hidden="true" className="pointer-events-none absolute -top-3 -right-3 h-24 w-24 border-t border-r border-sky" />

      <div className="flex items-center font-mono text-[17px] font-medium tracking-[0.02em]">
        <span className="text-sky">&gt;</span>
        <span className="ml-1.5">TN</span>
        <span aria-hidden="true" className="cursor-blink mb-1.5 ml-[3px] inline-block h-0.5 w-[0.6em] self-end bg-sky" />
        <span className="ml-2.5 rounded-full border border-line-strong px-2 text-[11px] leading-5 text-ink-muted">admin</span>
      </div>
      <p className="mt-7 mb-0 font-mono text-[13px] tracking-[0.06em] text-link">
        <span className="text-sky">$</span> sudo login
      </p>
      <h1 className="mt-2 mb-0 font-serif text-[28px] leading-[1.35] font-semibold tracking-[0.05em]">管理画面にログイン</h1>
      <p className="mt-2.5 mb-0 text-[13px] leading-[1.9] text-ink-body">作品・お問い合わせ・サイト設定を管理します。</p>

      {errorMessage ? (
        <p role="alert" className="mt-5 mb-0 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-800">
          <AdminIcon name="circle-alert" className="h-4 w-4" />
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-7 grid gap-[18px]">
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            required
            autoComplete="username"
            className={`${adminInput} h-[46px] px-3.5`}
            placeholder="admin@example.com"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            required
            autoComplete="current-password"
            className={`${adminInput} h-[46px] px-3.5`}
            placeholder="••••••••"
          />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[13px] text-ink-body">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(event) => setValues((current) => ({ ...current, remember: event.target.checked }))}
            className="m-0 h-[18px] w-[18px] accent-link"
          />
          ログイン状態を保持する
        </label>

        <button type="submit" disabled={isPending} className={`${adminPrimaryButton} h-12 w-full text-[15px] tracking-[0.04em]`}>
          {isPending ? "ログイン中…" : "ログイン"}
          <AdminIcon name="arrow-right" />
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <Link href="/" className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-body hover:text-link">
          ← 公開サイトへ戻る
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <AdminIcon name="lock" className="h-3.5 w-3.5" />
          管理者のみ
        </span>
      </div>
    </section>
  );
}
