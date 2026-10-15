"use client";

import { useCallback, useState } from "react";

import { AdminDrawer, DrawerFacts } from "../AdminDrawer";
import { AdminIcon } from "../AdminIcon";
import { AdminPageHeader } from "../AdminPageHeader";
import { adminPrimaryButton, adminRow, adminSecondaryButton } from "../adminStyles";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";

export interface AdminContactItem {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly message: string;
  /** JST で整形済みの受信日時 */
  readonly receivedAt: string;
  readonly group: "今週" | "それ以前";
}

interface AdminContactListProps {
  readonly contacts: readonly AdminContactItem[];
}

export function AdminContactList({ contacts }: AdminContactListProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const closeDrawer = useCallback(() => {
    setSelectedId(null);
    setCopied(false);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = contacts.filter((contact) => !normalizedQuery || `${contact.name} ${contact.email} ${contact.message}`.toLowerCase().includes(normalizedQuery));
  const groups = (["今週", "それ以前"] as const)
    .map((label) => ({ label, items: filtered.filter((contact) => contact.group === label) }))
    .filter((group) => group.items.length > 0);
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null;

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        command="mail --inbox"
        title="お問い合わせ"
        description="フォームから届いたメッセージ。返信はメールで行います。"
        actions={
          <label className="flex h-11 w-full items-center gap-2 rounded-full border border-line-strong bg-white px-3.5 text-link sm:w-[260px]">
            <AdminIcon name="search" className="h-[15px] w-[15px]" />
            <span className="sr-only">お問い合わせを検索</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="名前・メール・本文で検索"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none"
            />
          </label>
        }
      />

      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-[2] border-b border-line bg-paper/92 py-2 font-mono text-xs tracking-[0.06em] text-ink-muted backdrop-blur-sm">
            <span className="text-sky">{"//"}</span> {group.label}
          </div>
          {group.items.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelectedId(contact.id)}
              aria-label={`${contact.name} からのお問い合わせを開く`}
              className={`${adminRow(selectedId === contact.id)} grid w-[calc(100%+24px)] grid-cols-[minmax(0,1fr)_16px] items-center gap-x-[clamp(10px,2vw,24px)] gap-y-1 border-0 border-b border-line bg-transparent py-4 text-left text-ink md:grid-cols-[minmax(9rem,14rem)_minmax(10rem,1fr)_auto_16px]`}
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-bold">{contact.name}</span>
                <span className="block truncate font-mono text-xs text-ink-muted">{contact.email}</span>
              </span>
              <span className="order-3 col-span-full line-clamp-2 text-[13px] leading-[1.7] text-ink-body md:order-none md:col-span-1">{contact.message}</span>
              <span className="order-4 col-span-full font-mono text-xs text-ink-body md:order-none md:col-span-1 md:text-right">{contact.receivedAt}</span>
              <AdminIcon name="chevron-right" className="h-4 w-4 text-ink-muted" />
            </button>
          ))}
        </div>
      ))}

      {groups.length === 0 ? (
        <div className="border-b border-line py-14 text-center">
          <p className="m-0 font-serif text-lg font-semibold">{contacts.length === 0 ? "お問い合わせはまだありません。" : "条件に一致するお問い合わせがありません。"}</p>
          <p className="mt-1.5 mb-0 text-[13px] text-ink-muted">
            {contacts.length === 0 ? "公開サイトの「連絡」ページのフォームから届くと、ここに表示されます。" : "検索語を変えてお試しください。"}
          </p>
        </div>
      ) : null}

      {selected ? (
        <AdminDrawer
          kicker={`message #${selected.id}`}
          title={selected.name}
          onClose={closeDrawer}
          toolbar={
            <>
              <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: お問い合わせ")}`} className={`${adminPrimaryButton} h-10 px-4 text-[13px]`}>
                <AdminIcon name="reply" className="h-[15px] w-[15px]" />
                メールで返信
              </a>
              <button type="button" onClick={() => void copyEmail(selected.email)} className={adminSecondaryButton}>
                <AdminIcon name={copied ? "check" : "copy"} className="h-[15px] w-[15px]" />
                {copied ? "コピーしました" : "アドレスをコピー"}
              </button>
              <ConfirmSubmitButton
                formId={`delete-contact-${selected.id}`}
                title={`${selected.name} さんのお問い合わせを削除しますか？`}
                body="削除したメッセージは管理画面から復元できません。必要ならメールで返信してから削除してください。"
                className="ml-auto inline-flex h-10 cursor-pointer items-center gap-1.5 rounded border-0 bg-red-50 px-3.5 text-[13px] font-bold text-red-800 hover:bg-red-100"
              >
                <AdminIcon name="trash" className="h-[15px] w-[15px]" />
                削除
              </ConfirmSubmitButton>
              <form id={`delete-contact-${selected.id}`} action={`/api/admin/contacts/${selected.id}`} method="post" hidden />
            </>
          }
        >
          <DrawerFacts
            labelWidth="80px"
            facts={[
              { label: "差出人", value: <span className="text-sm font-bold">{selected.name}</span> },
              { label: "メール", value: selected.email, mono: true },
              { label: "受信", value: selected.receivedAt, mono: true },
            ]}
          />
          <p className="m-0 text-[15px] leading-loose whitespace-pre-wrap">{selected.message}</p>
        </AdminDrawer>
      ) : null}
    </>
  );
}
