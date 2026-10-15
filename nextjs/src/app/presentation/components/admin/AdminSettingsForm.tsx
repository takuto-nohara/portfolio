"use client";

import { useRef, useState, type ReactNode } from "react";

import { AdminIcon } from "./AdminIcon";
import { adminInput, adminMonoInput, adminPrimaryButton } from "./adminStyles";

interface AdminSettingsFormProps {
  readonly values: Readonly<Record<SettingKey, string>>;
  /** 連携中の Google アカウント（未連携なら null） */
  readonly connectedEmail: string | null;
}

type SettingKey = "github_url" | "contact_email" | "gmail_from_email" | "gmail_sender_name" | "gmail_subject_prefix";

function SettingsSection({ title, description, last = false, children }: { readonly title: string; readonly description: string; readonly last?: boolean; readonly children: ReactNode }) {
  return (
    <div className={`flex flex-wrap gap-x-8 gap-y-3 py-7 ${last ? "" : "border-b border-line"}`}>
      <div className="max-w-[240px] flex-[1_1_180px]">
        <h2 className="m-0 text-[15px] font-bold">{title}</h2>
        <p className="mt-1 mb-0 text-xs leading-[1.7] text-ink-muted">{description}</p>
      </div>
      <div className="grid min-w-0 flex-[999_1_320px] gap-[18px]">{children}</div>
    </div>
  );
}

function LockedValue({ value }: { readonly value: string }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded border border-line bg-panel px-3 font-mono text-[13px] text-ink-body">
      <AdminIcon name="lock" className="h-3.5 w-3.5 text-ink-muted" />
      <span className="truncate">{value}</span>
    </div>
  );
}

export function AdminSettingsForm({ values, connectedEmail }: AdminSettingsFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState(values);
  const dirty = (Object.keys(values) as SettingKey[]).some((key) => current[key] !== values[key]);

  const bind = (key: SettingKey) => ({
    name: key,
    id: key,
    value: current[key],
    onChange: (event: { target: { value: string } }) => setCurrent((state) => ({ ...state, [key]: event.target.value })),
  });

  const fromAddress = connectedEmail ?? (current.gmail_from_email || "you@gmail.com");
  const senderLine = current.gmail_sender_name ? `${current.gmail_sender_name} <${fromAddress}>` : fromAddress;
  const subjectLine = `${current.gmail_subject_prefix ? `${current.gmail_subject_prefix} ` : ""}お問い合わせ: 山田 太郎 様`;

  return (
    <form ref={formRef} action="/api/admin/settings" method="post">
      <SettingsSection title="Google 連携" description="Gmail API でお問い合わせを送信するために必要です。">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-white p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${connectedEmail ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <AdminIcon name={connectedEmail ? "shield-check" : "alert"} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="m-0 flex items-center gap-2 text-sm font-bold">
                {connectedEmail ? "連携中" : "未連携"}
                <span
                  className={`rounded-full border px-2 text-[11px] font-bold ${connectedEmail ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
                >
                  {connectedEmail ? "有効" : "要設定"}
                </span>
              </p>
              <p className="m-0 truncate font-mono text-xs text-ink-body">{connectedEmail ?? "お問い合わせメールを送るには連携してください。"}</p>
            </div>
          </div>
          <a
            href="/api/auth/google/start"
            className="inline-flex h-10 items-center rounded border border-line-strong bg-white px-3.5 text-[13px] font-bold text-link hover:border-sky hover:bg-[#f5fbff]"
          >
            {connectedEmail ? "再連携する" : "Google アカウントを連携"}
          </a>
        </div>
      </SettingsSection>

      <SettingsSection title="サイトリンク" description="公開サイトのフッターと連絡ページに表示されます。">
        <div className="grid gap-1.5">
          <label htmlFor="github_url" className="text-[13px] font-bold">
            GitHub URL
          </label>
          <input type="url" placeholder="https://github.com/yourname" className={adminMonoInput} {...bind("github_url")} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={connectedEmail ? undefined : "contact_email"} className="text-[13px] font-bold">
            お問い合わせの受信アドレス
          </label>
          {connectedEmail ? (
            <>
              <input type="hidden" name="contact_email" value={connectedEmail} />
              <LockedValue value={connectedEmail} />
            </>
          ) : (
            <input type="email" placeholder="you@example.com" className={adminMonoInput} {...bind("contact_email")} />
          )}
          <p className="m-0 text-xs text-ink-muted">
            {connectedEmail ? "Google 連携中は連携アカウントを自動で使います。" : "お問い合わせメールの送信先です。"}フッターの email リンクにもなります。
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Gmail 送信" description="届くメールの差出人と件名。" last>
        {connectedEmail ? (
          <input type="hidden" name="gmail_from_email" value={connectedEmail} />
        ) : (
          <div className="grid gap-1.5">
            <label htmlFor="gmail_from_email" className="text-[13px] font-bold">
              送信元アドレス
            </label>
            <input type="email" placeholder="your-gmail@gmail.com" className={adminMonoInput} {...bind("gmail_from_email")} />
            <p className="m-0 text-xs text-ink-muted">連携する Google アカウントのアドレスを入力します。</p>
          </div>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[18px]">
          <div className="grid gap-1.5">
            <label htmlFor="gmail_sender_name" className="text-[13px] font-bold">
              送信者名 <span className="font-normal text-ink-muted">任意</span>
            </label>
            <input type="text" placeholder="Your Name" className={adminInput} {...bind("gmail_sender_name")} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="gmail_subject_prefix" className="text-[13px] font-bold">
              件名プレフィックス <span className="font-normal text-ink-muted">任意</span>
            </label>
            <input type="text" placeholder="[portfolio]" className={adminMonoInput} {...bind("gmail_subject_prefix")} />
          </div>
        </div>
        <div className="border-l-2 border-sky py-1 pl-3.5">
          <p className="m-0 font-mono text-[11px] tracking-[0.06em] text-ink-muted">受信トレイでの見え方</p>
          <p className="mt-1 mb-0 text-[13px] font-bold break-all">{senderLine}</p>
          <p className="m-0 text-[13px] text-ink-body">{subjectLine}</p>
        </div>
      </SettingsSection>

      <div
        className={`sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-line-strong bg-paper/95 px-4 py-3 backdrop-blur-md sm:-mx-[clamp(16px,3vw,32px)] sm:px-[clamp(16px,3vw,32px)] ${dirty ? "animate-[rise_0.25s_both]" : ""}`}
      >
        <span className="mr-auto inline-flex items-center gap-2 text-[13px] text-ink-body">
          <span className={`h-[7px] w-[7px] rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
          {dirty ? "保存していない変更があります" : "変更はありません"}
        </span>
        {dirty ? (
          <button type="button" onClick={() => setCurrent(values)} className="min-h-11 cursor-pointer border-0 bg-transparent px-3 text-[13px] font-medium text-ink-body">
            元に戻す
          </button>
        ) : null}
        <button type="submit" disabled={!dirty} className={`${adminPrimaryButton} px-[22px]`}>
          設定を保存
        </button>
      </div>
    </form>
  );
}
