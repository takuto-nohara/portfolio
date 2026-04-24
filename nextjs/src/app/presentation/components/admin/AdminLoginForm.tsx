"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

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
    <section className="flex w-full max-w-110 flex-col items-center gap-8 rounded-2xl border border-border-subtle bg-surface-primary px-10 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <p className="text-[36px] font-bold leading-[1.333] tracking-[0.12em] text-accent-primary font-['Playfair_Display',serif]">
        TN
      </p>

      <div className="space-y-3 text-center">
        <h1 className="text-[22px] font-semibold leading-8 text-foreground-primary">管理画面ログイン</h1>
        <p className="text-sm leading-6 text-foreground-secondary">メールアドレスとパスワードを入力してください</p>
      </div>

      {errorMessage ? (
        <div className="w-full rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      <form onSubmit={submit} className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-foreground-primary">
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
            className="h-11 rounded border border-border-subtle bg-surface-primary px-3.5 text-sm text-foreground-primary outline-none transition-colors focus:border-accent-primary"
            placeholder="admin@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-foreground-primary">
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
            className="h-11 rounded border border-border-subtle bg-surface-primary px-3.5 text-sm text-foreground-primary outline-none transition-colors focus:border-accent-primary"
            placeholder="••••••••"
          />
        </div>

        <label className="flex w-full items-center gap-2 text-[13px] text-foreground-secondary">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(event) => setValues((current) => ({ ...current, remember: event.target.checked }))}
            className="h-4.5 w-4.5 rounded border border-border-subtle bg-surface-primary text-accent-primary focus:ring-accent-primary"
          />
          <span>ログイン状態を保持する</span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center rounded bg-accent-primary text-[15px] font-semibold text-surface-primary transition-colors hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <Link href="/" className="text-[13px] text-accent-primary transition-colors hover:text-accent-secondary">
        ← サイトに戻る
      </Link>
    </section>
  );
}