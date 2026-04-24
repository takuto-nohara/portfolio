import Link from "next/link";

import type { OAuthToken, PublicSettings } from "@/domain/publicApi";

interface AdminSettingsFormProps {
  readonly settings: PublicSettings;
  readonly token: OAuthToken | null;
  readonly status?: string;
}

export function AdminSettingsForm({ settings, token, status }: AdminSettingsFormProps) {
  return (
    <>
      {status === "saved" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">設定を保存しました。</div>
      ) : null}

      {status === "oauth-success" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Google アカウントの連携が完了しました。</div>
      ) : null}

      {status === "oauth-error" ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Google アカウントの連携に失敗しました。</div>
      ) : null}

      <form action="/api/admin/settings" method="post">
        <div className="max-w-2xl space-y-8 rounded-lg border border-border-subtle bg-surface-primary p-8">
          <div>
            <label htmlFor="github_url" className="mb-2 block text-sm font-medium text-foreground-primary">{"> github_url"}</label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              defaultValue={settings.githubUrl ?? ""}
              placeholder="https://github.com/yourname"
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-2.5 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-foreground-muted">フッターの github リンク先として使用されます。</p>
          </div>

          <div>
            <label htmlFor="contact_email" className="mb-2 block text-sm font-medium text-foreground-primary">{"> contact_email"}</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              defaultValue={settings.contactEmail ?? ""}
              placeholder="you@example.com"
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-2.5 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-foreground-muted">お問い合わせメールの送信先として使用されます。フッターの email リンク先にもなります。</p>
          </div>

          <div className="rounded border border-border-subtle bg-surface-secondary p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-foreground-primary">{"> google_oauth"}</h2>
                <p className="mt-1 text-xs text-foreground-muted">
                  {token?.email ? `連携中: ${token.email}` : "Gmail API を使うため Google アカウントを連携してください。"}
                </p>
              </div>
              <Link
                href="/api/auth/google/start"
                className="inline-flex items-center justify-center rounded border border-accent-primary px-4 py-2 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
              >
                {token?.email ? "Google アカウントを再連携" : "Google アカウントを連携"}
              </Link>
            </div>
          </div>

          <div className="flex justify-end border-t border-border-subtle pt-4">
            <button type="submit" className="rounded bg-accent-primary px-8 py-2 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary">
              {"> save_settings"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}