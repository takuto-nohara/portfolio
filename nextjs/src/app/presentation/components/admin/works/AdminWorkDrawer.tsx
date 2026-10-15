/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useState } from "react";

import { getMediumCategoryDefinition, type Work } from "@/application/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

import { AdminDrawer, DrawerFacts } from "../AdminDrawer";
import { AdminIcon } from "../AdminIcon";
import { adminPrimaryButton, adminSecondaryButton } from "../adminStyles";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";

interface AdminWorkDrawerProps {
  readonly work: Work;
  readonly onClose: () => void;
}

const menuItemClassName = "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[3px] border-0 bg-transparent px-2.5 text-left text-[13px]";

export function AdminWorkDrawer({ work, onClose }: AdminWorkDrawerProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const thumbnailUrl = resolveWorkAssetUrl(work.thumbnail);
  const techStack = work.techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
  const deleteFormId = `delete-work-${work.id}`;

  return (
    <AdminDrawer
      kicker={`work #${work.id}`}
      title={work.title}
      onClose={onClose}
      toolbar={
        <>
          <Link href={`/admin/works/${work.id}/edit`} className={`${adminPrimaryButton} h-10 px-4 text-[13px]`}>
            <AdminIcon name="pencil" className="h-[15px] w-[15px]" />
            編集する
          </Link>
          <a href={`/works/${work.id}`} target="_blank" rel="noopener noreferrer" className={adminSecondaryButton}>
            <AdminIcon name="eye" className="h-[15px] w-[15px]" />
            公開ページを見る
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMoreOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={`${adminSecondaryButton} px-3 text-ink-body`}
            >
              <AdminIcon name="ellipsis" className="h-[15px] w-[15px]" />
              その他
            </button>
            {moreOpen ? (
              <div role="menu" className="absolute top-11 right-0 z-[5] min-w-[200px] rounded border border-line bg-white p-1 shadow-[0_16px_40px_rgba(12,31,46,0.14)]">
                <form action={`/api/admin/works/${work.id}`} method="post">
                  <input type="hidden" name="intent" value="toggle-featured" />
                  <button type="submit" role="menuitem" className={`${menuItemClassName} font-medium text-ink hover:bg-[#f1f5f8]`}>
                    <AdminIcon name="star" className="h-[15px] w-[15px]" />
                    {work.isFeatured ? "トップ掲載を外す" : "トップに掲載する"}
                  </button>
                </form>
                <ConfirmSubmitButton
                  formId={deleteFormId}
                  role="menuitem"
                  title={`「${work.title}」を削除しますか？`}
                  body={`公開サイトから即座に消え、ギャラリー画像 ${work.images.length} 枚も削除されます。この操作は取り消せません。`}
                  className={`${menuItemClassName} font-bold text-red-800 hover:bg-red-50`}
                >
                  <AdminIcon name="trash" className="h-[15px] w-[15px]" />
                  作品を削除
                </ConfirmSubmitButton>
              </div>
            ) : null}
            <form id={deleteFormId} action={`/api/admin/works/${work.id}`} method="post" hidden>
              <input type="hidden" name="intent" value="delete" />
            </form>
          </div>
        </>
      }
    >
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-[2px] bg-[repeating-linear-gradient(135deg,#e0f2fe_0_8px,#eef7fd_8px_16px)] font-mono text-[11px] text-ink-muted">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={`${work.title} のサムネイル`} className={`absolute inset-0 h-full w-full ${work.thumbnailFit === "cover" ? "object-cover" : "object-contain"}`} />
        ) : (
          "thumbnail 未設定"
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-bold text-link-hover">{getMediumCategoryDefinition(work.category).nameJa}</span>
        <span className="rounded-full bg-[#f1f5f8] px-2.5 py-0.5 text-xs font-bold text-ink-body">{work.contextCategoryNameJa ?? "未分類"}</span>
        {work.isFeatured ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-pale bg-white px-2.5 py-px text-xs font-bold text-link">
            <AdminIcon name="star" filled className="h-3 w-3 text-sky" />
            トップ掲載
          </span>
        ) : null}
      </div>
      <p className="m-0 text-[15px] leading-[1.9]">{work.lead ?? <span className="text-ink-muted">一行リードは未設定です。</span>}</p>
      <DrawerFacts
        facts={[
          { label: "担当範囲", value: work.role ?? "—" },
          { label: "技術", value: techStack.join(" · ") || "—", mono: true },
          { label: "公開日", value: work.publishedAt ?? "—", mono: true },
          { label: "表示順", value: `#${work.sortOrder}`, mono: true },
          { label: "サムネイル", value: work.thumbnailFit, mono: true },
          { label: "公開 URL", value: work.url ?? "—", mono: true },
          { label: "GitHub", value: work.githubUrl ?? "—", mono: true },
          { label: "ギャラリー", value: `${work.images.length} 枚` },
        ]}
      />
    </AdminDrawer>
  );
}
