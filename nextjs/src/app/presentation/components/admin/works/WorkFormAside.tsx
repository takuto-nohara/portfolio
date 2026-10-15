/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";

import { categories, getMediumCategoryDefinition, type Category, type ThumbnailFit, type Work } from "@/application/publicApi";

import { AdminIcon } from "../AdminIcon";
import { adminPrimaryButton } from "../adminStyles";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";

interface WorkFormAsideProps {
  readonly formId: string;
  readonly work?: Work;
  readonly title: string;
  readonly lead: string;
  readonly category: string;
  readonly year: string;
  readonly stack: readonly string[];
  readonly fit: ThumbnailFit;
  readonly thumbnailPreview: string | null;
}

function mediumName(value: string): string {
  return categories.includes(value as Category) ? getMediumCategoryDefinition(value as Category).nameJa : value;
}

/** 作品一覧での見え方のプレビューと、保存・削除の操作 */
export function WorkFormAside({ formId, work, title, lead, category, year, stack, fit, thumbnailPreview }: WorkFormAsideProps) {
  const isEditing = work !== undefined && work.id !== null;
  const deleteFormId = `delete-work-${work?.id ?? "new"}`;

  return (
    <aside className="grid max-w-[420px] min-w-0 flex-[1_1_300px] gap-4 pt-7 lg:sticky lg:top-5">
      <p className="m-0 font-mono text-xs tracking-[0.06em] text-link">
        <span className="text-sky">{"//"}</span> preview — 作品一覧での見え方
      </p>
      <div className="rounded border border-line bg-white p-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] bg-[repeating-linear-gradient(135deg,#e0f2fe_0_8px,#eef7fd_8px_16px)]">
          {thumbnailPreview ? (
            <img src={thumbnailPreview} alt="" className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-ink-muted">thumbnail</span>
          )}
        </div>
        <p className="mt-3 mb-0 font-mono text-[11px] tracking-[0.06em] text-ink-muted">{`${mediumName(category)}  ${year}`}</p>
        <p className="mt-1.5 mb-0 font-serif text-lg leading-[1.45] font-semibold tracking-[0.03em]">{title || "タイトル未入力"}</p>
        <p className="mt-1.5 mb-0 text-[13px] leading-[1.8] text-ink-body">{lead || "一行リードがここに表示されます。"}</p>
        {stack.length > 0 ? <p className="mt-2 mb-0 font-mono text-[11px] text-ink-muted">{stack.join(" / ")}</p> : null}
      </div>
      <div className="grid gap-2 border-t border-line pt-4">
        <button type="submit" form={formId} className={`${adminPrimaryButton} h-12 w-full text-[15px]`}>
          <AdminIcon name="check" />
          {isEditing ? "変更を保存" : "作品を公開"}
        </button>
        <div className="flex items-center justify-between">
          <Link href="/admin/works" className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-body hover:text-link">
            キャンセル
          </Link>
          {isEditing ? (
            <>
              <ConfirmSubmitButton
                formId={deleteFormId}
                title={`「${work.title}」を削除しますか？`}
                body={`公開サイトから即座に消え、ギャラリー画像 ${work.images.length} 枚も削除されます。この操作は取り消せません。`}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-bold text-red-700"
              >
                <AdminIcon name="trash" className="h-[15px] w-[15px]" />
                この作品を削除
              </ConfirmSubmitButton>
              <form id={deleteFormId} action={`/api/admin/works/${work.id}`} method="post" hidden>
                <input type="hidden" name="intent" value="delete" />
              </form>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
