"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

interface FormValues {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

type FieldName = keyof FormValues;

interface ContactFormProps {
  readonly sentMessage: string;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
};

const fields: readonly {
  readonly name: FieldName;
  readonly label: string;
  readonly type: "text" | "email" | "textarea";
  readonly placeholder: string;
  readonly autoComplete?: string;
}[] = [
  { name: "name", label: "お名前", type: "text", placeholder: "例: 山田 太郎", autoComplete: "name" },
  { name: "email", label: "メールアドレス", type: "email", placeholder: "例: you@example.com", autoComplete: "email" },
  { name: "message", label: "内容", type: "textarea", placeholder: "ご用件・ご相談内容をご記入ください" },
];

function validate(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (values.name.trim().length === 0) {
    errors.name = "お名前を入力してください。";
  }

  if (values.email.trim().length === 0) {
    errors.email = "メールアドレスを入力してください。";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "メールアドレスの形式を確認してください。";
  }

  if (values.message.trim().length === 0) {
    errors.message = "内容を入力してください。";
  }

  return errors;
}

/** ターミナル風のお問い合わせフォーム */
export function ContactForm({ sentMessage }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isPending, startTransition] = useTransition();

  const updateField = (field: FieldName, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setIsSent(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSent(false);
    setErrorMessage(null);

    const nextErrors = validate(values);
    setFieldErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name]);

    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid.name}`)?.focus();
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          setErrorMessage(payload.error ?? "送信に失敗しました。時間を置いて再度お試しください。");
          return;
        }

        setValues(initialValues);
        setFieldErrors({});
        setIsSent(true);
      } catch {
        setErrorMessage("通信に失敗しました。接続状況を確認して再度お試しください。");
      }
    });
  };

  return (
    <form
      data-reveal
      onSubmit={submit}
      noValidate
      aria-labelledby="contact-form-title"
      className="w-full max-w-[600px] overflow-hidden rounded-lg bg-ink shadow-[0_24px_60px_-30px_rgba(12,31,46,0.55),0_0_0_1px_rgba(14,165,233,0.25)]"
    >
      <div className="flex items-center gap-2 border-b border-sky-pale/15 bg-[#0a1824] px-4 py-3">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
        <p id="contact-form-title" className="ml-2 font-mono text-xs text-sky-pale">
          ~/contact — お問い合わせフォーム
        </p>
      </div>
      <p className="px-4 py-4 font-mono sm:px-5 text-[13px] leading-[1.7] text-sky-pale">
        <span className="text-[#38bdf8]">$</span> ./send-message <span className="text-[#7dd3fc]">{"// 3つの項目を入力して送信してください"}</span>
      </p>

      {isSent ? (
        <p role="status" className="mx-4 mb-4 rounded border border-[#34d399] sm:mx-5 bg-[#34d399]/8 px-3.5 py-3 text-[15px] leading-[1.7] text-[#d1fae5]">
          <span aria-hidden="true" className="font-mono text-[#34d399]">
            ✓ 200 OK&nbsp;&nbsp;
          </span>
          {sentMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="mx-4 mb-4 rounded border border-[#f87171] sm:mx-5 bg-[#f87171]/8 px-3.5 py-3 text-[15px] leading-[1.7] text-[#fecaca]">
          <span aria-hidden="true" className="font-mono text-[#f87171]">
            ✗ error&nbsp;&nbsp;
          </span>
          {errorMessage}
        </p>
      ) : null}

      {fields.map((field, index) => {
        const id = `contact-${field.name}`;
        const errorId = `${id}-error`;
        const error = fieldErrors[field.name];
        const inputClassName = "min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-[#f0f9ff] caret-[#38bdf8] outline-none focus-visible:outline-none";

        return (
          <div key={field.name} className="border-t border-sky-pale/15 px-4 pt-4 pb-3 sm:px-5">
            <label htmlFor={id} className="flex items-baseline gap-2.5 text-sm leading-normal font-medium text-sky-soft">
              <span aria-hidden="true" className="font-mono text-[13px] text-[#38bdf8]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{field.label}</span>
              <span className="ml-auto font-mono text-[11px] text-[#7dd3fc]">必須</span>
            </label>
            <div
              className={`mt-2 flex items-start gap-2.5 rounded border bg-[#0b2233] px-3.5 transition-[border-color,box-shadow] focus-within:border-[#38bdf8] focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.25)] ${error ? "border-[#f87171]" : "border-sky-pale/30"}`}
            >
              <span aria-hidden="true" className={`font-mono text-base text-[#38bdf8] ${field.type === "textarea" ? "pt-3 leading-[1.8]" : "leading-[48px]"}`}>
                &gt;
              </span>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  name={field.name}
                  rows={6}
                  required
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={errorId}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className={`${inputClassName} resize-y py-3 leading-[1.8]`}
                />
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.type}
                  required
                  autoComplete={field.autoComplete}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={errorId}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className={`${inputClassName} h-12`}
                />
              )}
            </div>
            <p id={errorId} role="alert" className="mt-1.5 min-h-[1.6em] font-mono text-[13px] leading-[1.6] text-[#fca5a5]">
              {error ?? ""}
            </p>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sky-pale/15 px-4 pt-4 pb-5 sm:px-5">
        <p className="font-mono text-xs leading-[1.6] text-[#7dd3fc]">Enter で改行 / ボタンで送信</p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 cursor-pointer items-center gap-3 rounded border-0 bg-sky px-6 font-mono text-[15px] font-medium text-[#04121c] transition-[background-color,box-shadow] hover:bg-[#38bdf8] hover:shadow-[0_0_0_4px_rgba(56,189,248,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isPending ? "送信中…" : "送信する"}</span>
          <span aria-hidden="true">⏎</span>
        </button>
      </div>
    </form>
  );
}
