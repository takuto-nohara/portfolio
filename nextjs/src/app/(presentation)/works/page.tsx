import Link from "next/link";

import { categories, getMediumCategoryDefinition, type Category } from "@/domain/publicApi";
import { getSiteSettings, getWorkContextCategories, getWorks } from "@worker/lib/site-data";
import { NextPageLink } from "@/presentation/components/NextPageLink";
import { SectionLabel } from "@/presentation/components/SectionLabel";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkThumb } from "@/presentation/components/work/WorkThumb";
import { siteSections } from "@/presentation/content/siteContent";
import { getWorkMeta } from "@/presentation/lib/work-view";

interface WorksPageProps {
  readonly searchParams: Promise<{
    readonly category?: string;
  }>;
}

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

export const metadata = { title: "作品一覧" };
export const dynamic = "force-dynamic";

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const { category: categoryParam } = await searchParams;
  const activeCategory = categoryParam && isCategory(categoryParam) ? categoryParam : null;
  const [settings, allWorks, contextCategories] = await Promise.all([getSiteSettings(), getWorks(), getWorkContextCategories()]);
  const filteredWorks = activeCategory ? allWorks.filter((work) => work.category === activeCategory) : allWorks;

  const tabs = [
    { key: null, label: "すべて", count: allWorks.length },
    ...categories.map((category) => ({
      key: category,
      label: getMediumCategoryDefinition(category).nameJa,
      count: allWorks.filter((work) => work.category === category).length,
    })),
  ];

  // 制作文脈（所属・プロジェクト）ごとにまとめ、未分類は末尾に置く
  const groups = [
    ...contextCategories.map((contextCategory) => ({
      key: contextCategory.slug,
      titleJa: contextCategory.nameJa,
      works: filteredWorks.filter((work) => work.contextCategoryId === contextCategory.id),
    })),
    { key: "unassigned", titleJa: "未分類", works: filteredWorks.filter((work) => work.contextCategoryId === null) },
  ].filter((group) => group.works.length > 0);

  return (
    <SiteShell settings={settings} currentPath="/works">
      <div className="site-container page-pad">
        <SectionLabel prefix="$">ls works</SectionLabel>
        <h1 data-reveal className="heading-page mt-4">
          作品一覧
        </h1>
        <p data-reveal className="mt-5 max-w-[36em] leading-[1.9] text-ink-body">
          {siteSections.worksPageLead}
        </p>

        <div data-reveal role="group" aria-label="媒体で絞り込む" className="mt-9 flex flex-wrap gap-x-6 gap-y-1 border-b border-line-strong">
          {tabs.map((tab) => {
            const active = tab.key === activeCategory;

            return (
              <Link
                key={tab.key ?? "all"}
                href={tab.key ? `/works?category=${tab.key}` : "/works"}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={`relative inline-flex min-h-11 items-center px-0.5 pt-3 pb-3.5 text-[15px] leading-normal font-medium transition-colors hover:text-link ${active ? "text-ink" : "text-ink-muted"}`}
              >
                <span>{tab.label}</span>
                <span className="ml-2 font-mono text-xs text-ink-muted">{tab.count}</span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-sky transition-transform duration-300 ease-out-expo ${active ? "scale-x-100" : "scale-x-0"}`}
                />
              </Link>
            );
          })}
        </div>

        <div className="mt-[clamp(32px,5vh,56px)] flex flex-col gap-[clamp(48px,7vh,80px)]">
          {groups.map((group, groupIndex) => (
            <section key={group.key} aria-labelledby={`g-${group.key}`}>
              <div data-reveal className="flex flex-wrap items-baseline gap-4">
                <span className="font-mono text-[13px] tracking-[0.06em] text-link">{String(groupIndex + 1).padStart(2, "0")}</span>
                <h2 id={`g-${group.key}`} className="heading-display text-[clamp(22px,2.4vw,30px)] leading-[1.4] tracking-[0.04em]">
                  {group.titleJa}
                </h2>
                <span className="text-[13px] text-ink-muted">{`${group.works.length} 件`}</span>
              </div>
              <ul className="mt-5 border-b border-line">
                {group.works.map((work) => {
                  const meta = getWorkMeta(work);

                  return (
                    <li key={work.id ?? work.title} data-reveal className="border-t border-line">
                      <Link
                        href={work.id === null ? "/works" : `/works/${work.id}`}
                        className="row-link group grid-cols-[96px_minmax(0,1fr)] items-start gap-4 py-6 sm:grid-cols-[minmax(120px,220px)_minmax(0,1fr)_auto] sm:items-center sm:gap-[clamp(16px,3vw,40px)]"
                      >
                        <WorkThumb work={work} sizes="220px" />
                        <div className="min-w-0">
                          <p className="font-mono text-xs leading-normal tracking-[0.06em] text-ink-muted">{`${meta.mediumJa}  ${meta.year}`}</p>
                          <h3 className="heading-display mt-2 text-[clamp(18px,2vw,24px)] leading-[1.45] tracking-[0.03em]">{work.title}</h3>
                          <p className="mt-2 text-[15px] leading-[1.8] text-ink-body">{meta.lead}</p>
                          {meta.stackShort ? <p className="mt-2 font-mono text-xs leading-relaxed text-ink-muted">{meta.stackShort}</p> : null}
                        </div>
                        <span aria-hidden="true" className="hidden text-xl text-ink-muted transition-[transform,color] duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-link sm:inline">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {filteredWorks.length === 0 ? <p className="py-12 text-center text-ink-muted">条件に一致する作品がありません。</p> : null}
        </div>
      </div>

      <NextPageLink href="/about" label="次は、自己紹介へ" />
    </SiteShell>
  );
}
