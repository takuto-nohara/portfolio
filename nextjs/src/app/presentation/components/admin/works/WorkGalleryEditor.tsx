/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";

import type { Work } from "@/application/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

import { AdminIcon } from "../AdminIcon";
import { adminDangerIconButton, adminIconButton } from "../adminStyles";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";

interface WorkGalleryEditorProps {
  readonly work?: Work;
  /** 新しい画像の <input type="file"> を所属させる作品フォームの id */
  readonly workFormId: string;
}

/**
 * ギャラリー画像の一覧（キャプション編集・削除）と追加アップロード。
 * 既存画像の操作は作品フォームとは別の <form> に送るため、form 属性で関連付ける。
 */
export function WorkGalleryEditor({ work, workFormId }: WorkGalleryEditorProps) {
  const images = work?.images ?? [];
  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="m-0 text-[13px] font-bold">
          ギャラリー <span className="font-mono font-normal text-ink-muted">{images.length}</span>
        </p>
        <label className="inline-flex min-h-8 cursor-pointer items-center gap-1 text-xs font-bold text-link focus-within:underline">
          <AdminIcon name="plus" className="h-3.5 w-3.5" />
          画像を追加
          <input
            form={workFormId}
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={(event) => setSelectedCount(event.target.files?.length ?? 0)}
            className="sr-only"
          />
        </label>
      </div>
      {selectedCount > 0 ? (
        <p role="status" className="mt-0 mb-2 rounded border border-sky-pale bg-sky-soft/50 px-3 py-2 text-xs text-link-hover">
          {`${selectedCount} 枚を選択中です。保存すると追加されます。`}
        </p>
      ) : null}

      {images.length > 0 && work?.id != null ? (
        <div className="border-t border-line">
          {images.map((image, index) => {
            const imageUrl = resolveWorkAssetUrl(image.imagePath);
            const captionFormId = `caption-${image.id}`;
            const deleteFormId = `delete-image-${image.id}`;

            return (
              <div key={image.id ?? image.imagePath} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-2.5 sm:grid-cols-[88px_minmax(0,1fr)_auto]">
                <span className="relative block aspect-[16/10] overflow-hidden rounded-[2px] bg-sky-soft">
                  {imageUrl ? <img src={imageUrl} alt={`画像 ${index + 1}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : null}
                </span>
                <input
                  form={captionFormId}
                  name="caption"
                  aria-label={`画像 ${index + 1} の説明`}
                  defaultValue={image.caption ?? ""}
                  placeholder="画像の説明"
                  className="h-[38px] min-w-0 rounded border border-line bg-white px-3 text-[13px] outline-none focus:border-link"
                />
                <div className="flex">
                  <button form={captionFormId} type="submit" title="説明を保存" aria-label={`画像 ${index + 1} の説明を保存`} className={adminIconButton}>
                    <AdminIcon name="check" className="h-4 w-4" />
                  </button>
                  <ConfirmSubmitButton
                    formId={deleteFormId}
                    ariaLabel={`画像 ${index + 1} を削除`}
                    title="この画像を削除しますか？"
                    body="公開サイトのギャラリーからも消えます。この操作は取り消せません。"
                    className={adminDangerIconButton}
                  >
                    <AdminIcon name="trash" className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="m-0 border-t border-line py-3 text-xs text-ink-muted">まだ画像はありません。「画像を追加」から複数枚まとめて選べます。</p>
      )}
    </div>
  );
}

/** 既存画像の操作用フォーム。作品フォームの外（兄弟要素）に置く */
export function WorkGalleryForms({ work }: { readonly work?: Work }) {
  if (!work || work.id === null) {
    return null;
  }

  return (
    <>
      {work.images.map((image) => (
        <div key={image.id ?? image.imagePath} hidden>
          <form id={`caption-${image.id}`} action={`/api/admin/works/${work.id}/images/${image.id}`} method="post">
            <input type="hidden" name="intent" value="update-caption" />
          </form>
          <form id={`delete-image-${image.id}`} action={`/api/admin/works/${work.id}/images/${image.id}`} method="post">
            <input type="hidden" name="intent" value="delete-image" />
          </form>
        </div>
      ))}
    </>
  );
}
