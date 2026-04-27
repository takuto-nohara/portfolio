"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

interface FormValues {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};

    if (values.name.trim().length === 0) {
      nextErrors.name = "お名前を入力してください。";
    }

    if (values.email.trim().length === 0) {
      nextErrors.email = "メールアドレスを入力してください。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "メールアドレスの形式を確認してください。";
    }

    if (values.message.trim().length === 0) {
      nextErrors.message = "お問い合わせ内容を入力してください。";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          setErrorMessage(payload.error ?? "送信に失敗しました。時間を置いて再度お試しください。");
          return;
        }

        setValues(initialValues);
        setFieldErrors({});
        setSuccessMessage("お問い合わせを送信しました。ありがとうございます。");
      } catch {
        setErrorMessage("通信に失敗しました。接続状況を確認して再度お試しください。");
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {successMessage ? (
        <div role="status" aria-live="polite" className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground-primary">
          お名前 / Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
          autoComplete="name"
          aria-invalid={fieldErrors.name ? "true" : "false"}
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          className={`w-full rounded border bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary ${fieldErrors.name ? "border-red-400" : "border-border-subtle"}`}
          placeholder="例: 野原 拓人"
        />
        {fieldErrors.name ? (
          <p id="contact-name-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground-primary">
          メールアドレス / Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          autoComplete="email"
          aria-invalid={fieldErrors.email ? "true" : "false"}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
          className={`w-full rounded border bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary ${fieldErrors.email ? "border-red-400" : "border-border-subtle"}`}
          placeholder="例: example@example.com"
        />
        {fieldErrors.email ? (
          <p id="contact-email-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground-primary">
          お問い合わせ内容 / Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          required
          aria-invalid={fieldErrors.message ? "true" : "false"}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className={`w-full resize-none rounded border bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary ${fieldErrors.message ? "border-red-400" : "border-border-subtle"}`}
          placeholder="ご相談内容やご用件を入力してください。"
        />
        {fieldErrors.message ? (
          <p id="contact-message-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-accent-primary py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "送信中... / Sending" : "送信する / Send"}
      </button>
    </form>
  );
}