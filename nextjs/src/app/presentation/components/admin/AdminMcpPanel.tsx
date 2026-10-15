"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminIcon } from "./AdminIcon";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { adminDangerIconButton, adminInput, adminPrimaryButton, adminSecondaryButton } from "./adminStyles";

export interface McpTokenItem {
  readonly id: string;
  readonly kind: "personal" | "oauth";
  readonly label: string;
  readonly prefix: string;
  readonly scope: string;
  readonly createdAt: string;
  readonly lastUsedAt: string | null;
}

interface AdminMcpPanelProps {
  /** MCP エンドポイントの URL（https://…/api/mcp） */
  readonly endpoint: string;
  readonly tokens: readonly McpTokenItem[];
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" }) : "未使用";
}

function CopyButton({ value, label }: { readonly value: string; readonly label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={adminSecondaryButton}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      <AdminIcon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? "コピーしました" : label}
    </button>
  );
}

/** AI ツール（ChatGPT・Claude・dots など）から MCP で操作するための接続情報とトークン管理 */
export function AdminMcpPanel({ endpoint, tokens }: AdminMcpPanelProps) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const issue = async () => {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/mcp-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const body = (await response.json()) as { token?: { token: string }; error?: string };

      if (!response.ok || !body.token) {
        setError(body.error ?? "トークンを発行できませんでした。");
        return;
      }

      setIssued(body.token.token);
      setLabel("");
      router.refresh();
    } catch {
      setError("トークンを発行できませんでした。");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-10 border-t border-line-strong pt-7">
      <h2 className="m-0 text-[15px] font-bold">MCP 連携</h2>
      <p className="mt-1 mb-0 text-xs leading-[1.7] text-ink-muted">
        ChatGPT・Claude などのコネクタには下の URL を登録し、OAuth でログインします。Claude Code や dots など URL とトークンで接続するツールには、個人トークンを発行してください。
      </p>

      <div className="mt-5 grid gap-1.5">
        <span className="text-[13px] font-bold">MCP サーバー URL</span>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex h-11 min-w-0 flex-1 items-center truncate rounded border border-line bg-panel px-3 font-mono text-[13px]">{endpoint}</code>
          <CopyButton value={endpoint} label="URL をコピー" />
        </div>
      </div>

      <div className="mt-6 grid gap-1.5">
        <label htmlFor="mcp_token_label" className="text-[13px] font-bold">
          個人トークンを発行
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="mcp_token_label"
            type="text"
            maxLength={60}
            placeholder="例: Claude Code"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className={`${adminInput} min-w-0 flex-1`}
          />
          <button type="button" disabled={pending} onClick={() => void issue()} className={adminPrimaryButton}>
            発行する
          </button>
        </div>
        {error ? <p className="m-0 text-xs text-red-700">{error}</p> : null}
        {issued ? (
          <div className="mt-2 grid gap-2 rounded border border-amber-200 bg-amber-50 p-4">
            <p className="m-0 text-[13px] font-bold text-amber-900">このトークンは今しか表示されません。コピーして安全な場所に保管してください。</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 rounded border border-amber-200 bg-white px-3 py-2.5 font-mono text-[13px] break-all">{issued}</code>
              <CopyButton value={issued} label="トークンをコピー" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="m-0 text-[13px] font-bold">接続中のトークン</p>
        {tokens.length === 0 ? (
          <p className="mt-2 mb-0 text-xs text-ink-muted">まだありません。</p>
        ) : (
          <ul className="mt-2 mb-0 grid list-none gap-2 p-0">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center gap-3 rounded border border-line bg-white px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="m-0 flex items-center gap-2 text-sm font-bold">
                    <span className="truncate">{token.label}</span>
                    <span className="rounded-full border border-line-strong px-2 text-[11px] font-bold text-ink-body">{token.kind === "oauth" ? "OAuth" : "個人"}</span>
                  </p>
                  <p className="m-0 truncate font-mono text-xs text-ink-muted">
                    {token.prefix}… · {token.scope} · 発行 {formatDate(token.createdAt)} · 最終利用 {formatDate(token.lastUsedAt)}
                  </p>
                </div>
                <form id={`revoke-${token.id}`} action={`/api/admin/mcp-tokens/${token.id}`} method="post" className="contents" />
                <ConfirmSubmitButton
                  formId={`revoke-${token.id}`}
                  title="トークンを失効しますか？"
                  body={`「${token.label}」からは MCP で操作できなくなります。`}
                  confirmLabel="失効する"
                  ariaLabel="失効する"
                  className={adminDangerIconButton}
                >
                  <AdminIcon name="trash" className="h-4 w-4" />
                </ConfirmSubmitButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
