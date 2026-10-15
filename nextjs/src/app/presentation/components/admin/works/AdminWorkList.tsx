/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { categories, getMediumCategoryDefinition, type Category, type Work, type WorkContextCategory } from "@/application/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

import { AdminIcon } from "../AdminIcon";
import { adminPill, adminRow } from "../adminStyles";
import { AdminWorkDrawer } from "./AdminWorkDrawer";

interface AdminWorkListProps {
  readonly works: readonly Work[];
  readonly contextCategories: readonly WorkContextCategory[];
}

function matchesQuery(work: Work, query: string): boolean {
  return `${work.title} ${work.techStack} ${work.lead ?? ""}`.toLowerCase().includes(query);
}

export function AdminWorkList({ works, contextCategories }: AdminWorkListProps) {
  const [medium, setMedium] = useState<Category | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const closeDrawer = useCallback(() => setSelectedId(null), []);

  const normalizedQuery = query.trim().toLowerCase();
  const base = useMemo(
    () => works.filter((work) => (!featuredOnly || work.isFeatured) && (!normalizedQuery || matchesQuery(work, normalizedQuery))),
    [works, featuredOnly, normalizedQuery],
  );
  const filtered = base.filter((work) => medium === "all" || work.category === medium);

  const tabs = [
    { key: "all" as const, label: "すべて", count: base.length },
    ...categories.map((category) => ({
      key: category,
      label: getMediumCategoryDefinition(category).nameJa,
      count: base.filter((work) => work.category === category).length,
    })),
  ];

  const groups = [
    ...[...contextCategories].sort((a, b) => a.sortOrder - b.sortOrder).map((category) => ({ id: category.id, title: category.nameJa })),
    { id: null, title: "未分類" },
  ]
    .map((group) => ({ ...group, works: filtered.filter((work) => work.contextCategoryId === group.id) }))
    .filter((group) => group.works.length > 0);

  const selected = works.find((work) => work.id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 py-4" role="group" aria-label="媒体で絞り込む">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" aria-pressed={medium === tab.key} onClick={() => setMedium(tab.key)} className={`${adminPill(medium === tab.key)} h-9`}>
            {tab.label}
            <span className="font-mono text-[11px] font-normal opacity-80">{tab.count}</span>
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-line-strong" />
        <button type="button" aria-pressed={featuredOnly} onClick={() => setFeaturedOnly((current) => !current)} className={`${adminPill(featuredOnly)} h-9`}>
          <AdminIcon name="star" className="h-3.5 w-3.5" />
          トップ掲載のみ
        </button>
        <label className="ml-auto flex h-11 w-full items-center gap-2 rounded-full border border-line-strong bg-white px-3.5 text-link sm:w-60">
          <AdminIcon name="search" className="h-[15px] w-[15px]" />
          <span className="sr-only">作品を検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="タイトル・技術で検索"
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none"
          />
        </label>
      </div>

      {groups.map((group, groupIndex) => (
        <div key={group.id ?? "unassigned"} className="mt-3">
          <div className="sticky top-0 z-[2] flex items-baseline gap-3 border-b border-line bg-paper/92 py-2.5 backdrop-blur-sm">
            <span className="font-mono text-xs tracking-[0.06em] text-link">{String(groupIndex + 1).padStart(2, "0")}</span>
            <h2 className="m-0 font-serif text-[17px] font-semibold tracking-[0.04em]">{group.title}</h2>
            <span className="text-xs text-ink-muted">{`${group.works.length} 件`}</span>
          </div>
          <ul className="m-0 list-none p-0">
            {group.works.map((work) => {
              const thumbnailUrl = resolveWorkAssetUrl(work.thumbnail);

              return (
                <li key={work.id ?? work.title} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setSelectedId(work.id)}
                    aria-label={`${work.title} の詳細を開く`}
                    className={`${adminRow(selectedId === work.id)} grid w-[calc(100%+24px)] grid-cols-[clamp(64px,10vw,104px)_minmax(0,1fr)_16px] items-center gap-[clamp(10px,1.6vw,20px)] border-0 bg-transparent py-4 text-left text-ink sm:grid-cols-[clamp(64px,10vw,104px)_minmax(10rem,1fr)_auto_16px]`}
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-[2px] bg-[repeating-linear-gradient(135deg,#e0f2fe_0_6px,#eef7fd_6px_12px)]">
                      {thumbnailUrl ? <img src={thumbnailUrl} alt="" loading="lazy" className={`absolute inset-0 h-full w-full ${work.thumbnailFit === "cover" ? "object-cover" : "object-contain"}`} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] leading-normal font-bold">{work.title}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] leading-relaxed text-ink-muted">{work.lead ?? "一行リード未設定"}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
                        <WorkMeta work={work} />
                      </span>
                    </span>
                    <span className="hidden max-w-[260px] flex-wrap items-center justify-end gap-x-3.5 gap-y-1.5 sm:flex">
                      <WorkMeta work={work} />
                    </span>
                    <AdminIcon name="chevron-right" className="h-4 w-4 text-ink-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {groups.length === 0 ? (
        <div className="border-b border-line py-12 text-center">
          <p className="m-0 text-sm text-ink-body">{works.length === 0 ? "まだ作品がありません。" : "条件に一致する作品がありません。"}</p>
          {works.length === 0 ? (
            <Link href="/admin/works/create" className="mt-2.5 inline-flex min-h-11 items-center border-b border-line-underline text-[13px] font-bold text-link">
              最初の作品を追加する
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMedium("all");
                setFeaturedOnly(false);
                setQuery("");
              }}
              className="mt-2.5 min-h-11 cursor-pointer border-0 border-b border-line-underline bg-transparent text-[13px] font-bold text-link"
            >
              絞り込みを解除
            </button>
          )}
        </div>
      ) : null}

      {selected ? <AdminWorkDrawer work={selected} onClose={closeDrawer} /> : null}
    </>
  );
}

function WorkMeta({ work }: { readonly work: Work }) {
  return (
    <>
      <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-[11.5px] font-bold whitespace-nowrap text-link-hover">{getMediumCategoryDefinition(work.category).nameJa}</span>
      {work.publishedAt ? <span className="font-mono text-xs text-ink-body">{work.publishedAt}</span> : null}
      <span title="表示順" className="font-mono text-xs text-ink-muted">{`#${work.sortOrder}`}</span>
      <span title={work.isFeatured ? "トップに掲載中" : "トップ非掲載"} className={work.isFeatured ? "text-sky" : "text-line-strong"}>
        <AdminIcon name="star" filled className="h-4 w-4" />
        <span className="sr-only">{work.isFeatured ? "トップに掲載中" : "トップ非掲載"}</span>
      </span>
    </>
  );
}
