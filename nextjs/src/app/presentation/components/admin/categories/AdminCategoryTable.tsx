"use client";

import { useState } from "react";

import type { WorkContextCategory } from "@/application/publicApi";

import { AdminIcon } from "../AdminIcon";
import { AdminPageHeader } from "../AdminPageHeader";
import { adminDangerIconButton, adminIconButton, adminPrimaryButton } from "../adminStyles";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";

interface CategoryRow {
  readonly category: WorkContextCategory;
  readonly workCount: number;
}

interface AdminCategoryTableProps {
  readonly rows: readonly CategoryRow[];
  readonly nextSortOrder: number;
  readonly unassignedCount: number;
}

const gridColumns = "md:grid-cols-[56px_minmax(7rem,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_56px_88px]";
const cellInput = "h-[38px] w-full min-w-0 rounded border border-line-strong bg-white px-2.5 text-sm outline-none focus:border-link";
const saveButton = `${adminPrimaryButton} h-10 w-10 px-0`;

function EditableFields({ category, sortOrder }: { readonly category?: WorkContextCategory; readonly sortOrder: number }) {
  return (
    <>
      <label className="grid gap-1 md:contents">
        <span className="text-xs text-ink-muted md:sr-only">表示順</span>
        <input name="sort_order" type="number" defaultValue={category?.sortOrder ?? sortOrder} aria-label="表示順" className={`${cellInput} px-2 font-mono text-[13px]`} />
      </label>
      <label className="grid gap-1 md:contents">
        <span className="text-xs text-ink-muted md:sr-only">日本語ラベル</span>
        <input name="name_ja" required defaultValue={category?.nameJa} placeholder="個人制作" aria-label="日本語ラベル" className={cellInput} />
      </label>
      <label className="grid gap-1 md:contents">
        <span className="text-xs text-ink-muted md:sr-only">英語ラベル</span>
        <input name="name_en" required defaultValue={category?.nameEn} placeholder="Personal Project" aria-label="英語ラベル" className={`${cellInput} text-[13px]`} />
      </label>
      <label className="grid gap-1 md:contents">
        <span className="text-xs text-ink-muted md:sr-only">slug</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={category?.slug}
          placeholder="personal-project"
          aria-label="slug"
          className={`${cellInput} font-mono text-xs`}
        />
      </label>
    </>
  );
}

function RowActions({ submitLabel, onCancel }: { readonly submitLabel: string; readonly onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button type="submit" title={submitLabel} aria-label={submitLabel} className={saveButton}>
        <AdminIcon name="check" className="h-4 w-4" />
      </button>
      <button type="button" onClick={onCancel} title="キャンセル" aria-label="キャンセル" className={adminIconButton}>
        <AdminIcon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdminCategoryTable({ rows, nextSortOrder, unassignedCount }: AdminCategoryTableProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <>
      <AdminPageHeader
        command="ls categories"
        title="文脈カテゴリ"
        description="所属やプロジェクトなど、作品の背景ごとにまとめる単位です。"
        actions={
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            className={adminPrimaryButton}
          >
            <AdminIcon name="plus" />
            カテゴリを追加
          </button>
        }
      />

      <div className={`mt-2 hidden gap-4 border-b border-line px-3 py-2.5 font-mono text-[11px] tracking-[0.06em] text-ink-muted md:grid ${gridColumns}`}>
        <span>sort</span>
        <span>日本語</span>
        <span>English</span>
        <span>slug</span>
        <span>作品</span>
        <span />
      </div>

      {adding ? (
        <div className="border-b border-line">
          <form
            action="/api/admin/categories"
            method="post"
            className={`grid animate-[rise_0.3s_both] grid-cols-1 items-center gap-3 bg-white p-3 shadow-[inset_0_0_0_1px_var(--sky-pale)] md:gap-4 ${gridColumns}`}
          >
            <EditableFields sortOrder={nextSortOrder} />
            <span className="hidden font-mono text-xs text-ink-muted md:block">—</span>
            <RowActions submitLabel="追加" onCancel={() => setAdding(false)} />
          </form>
          <p className="m-0 px-3 py-2 text-xs text-ink-muted">slug は URL クエリでも使うため、半角英小文字・数字とハイフンで入力します。</p>
        </div>
      ) : null}

      {rows.map(({ category, workCount }) => {
        const editing = editingId === category.id;
        const deleteFormId = `delete-category-${category.id}`;

        return (
          <div key={category.id} className="border-b border-line">
            {editing ? (
              <form
                action={`/api/admin/categories/${category.id}`}
                method="post"
                className={`grid grid-cols-1 items-center gap-3 bg-white p-3 shadow-[inset_0_0_0_1px_var(--sky-pale)] md:gap-4 ${gridColumns}`}
              >
                <input type="hidden" name="intent" value="update" />
                <EditableFields category={category} sortOrder={category.sortOrder} />
                <span className="hidden font-mono text-xs text-ink-muted md:block">{`${workCount} 件`}</span>
                <RowActions submitLabel="保存" onCancel={() => setEditingId(null)} />
              </form>
            ) : (
              <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 py-3.5 hover:bg-sky-soft/45 ${gridColumns}`}>
                <span className="hidden font-mono text-xs text-ink-muted md:block">{category.sortOrder}</span>
                <span className="min-w-0 font-serif text-base font-semibold tracking-[0.03em]">
                  {category.nameJa}
                  <span className="ml-2 font-sans text-xs font-normal text-ink-muted md:hidden">{category.nameEn}</span>
                </span>
                <span className="hidden text-[13px] text-ink-body md:block">{category.nameEn}</span>
                <span className="order-3 col-span-full flex items-center gap-3 md:order-none md:col-span-1">
                  <span className="rounded-full bg-panel px-2.5 py-0.5 font-mono text-[11.5px] text-ink-body">{category.slug}</span>
                  <span className="font-mono text-xs md:hidden">{`作品 ${workCount} 件`}</span>
                </span>
                <span className="hidden font-mono text-xs md:block">{`${workCount} 件`}</span>
                <div className="flex justify-end gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(category.id);
                      setAdding(false);
                    }}
                    title="編集"
                    aria-label={`${category.nameJa} を編集`}
                    className={adminIconButton}
                  >
                    <AdminIcon name="pencil" className="h-4 w-4" />
                  </button>
                  <ConfirmSubmitButton
                    formId={deleteFormId}
                    ariaLabel={`${category.nameJa} を削除`}
                    title={`「${category.nameJa}」を削除しますか？`}
                    body={workCount > 0 ? `紐づく作品 ${workCount} 件は「未分類」に戻ります。作品自体は削除されません。` : "このカテゴリに紐づく作品はありません。"}
                    className={adminDangerIconButton}
                  >
                    <AdminIcon name="trash" className="h-4 w-4" />
                  </ConfirmSubmitButton>
                  <form id={deleteFormId} action={`/api/admin/categories/${category.id}`} method="post" hidden>
                    <input type="hidden" name="intent" value="delete" />
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {rows.length === 0 && !adding ? (
        <div className="border-b border-line py-12 text-center">
          <p className="m-0 text-sm text-ink-body">文脈カテゴリはまだありません。</p>
          <p className="mt-1 mb-0 text-xs text-ink-muted">所属やプロジェクトごとに作品をまとめたいときに追加します。</p>
        </div>
      ) : null}

      <p className="mt-4 mb-0 text-xs text-ink-muted">
        未分類の作品は公開サイトの末尾「未分類」にまとまります。現在 <span className="font-mono text-ink">{unassignedCount}</span> 件。
      </p>
    </>
  );
}
