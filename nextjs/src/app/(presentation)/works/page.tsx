import { categories, getMediumCategoryDefinition } from "@/domain/publicApi";
import { getSiteSettings, getWorkContextCategories, getWorks } from "@worker/lib/site-data";
import { CategoryChip } from "@/presentation/components/CategoryChip";
import { PageHeader } from "@/presentation/components/PageHeader";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkCard } from "@/presentation/components/WorkCard";

interface WorksPageProps {
  readonly searchParams: Promise<{
    readonly category?: string;
    readonly context?: string;
  }>;
}

const unassignedContextSlug = "unassigned";

function isCategory(value: string): value is (typeof categories)[number] {
  return categories.includes(value as (typeof categories)[number]);
}

function buildWorksHref(category: string | null, context: string | null): string {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (context) {
    params.set("context", context);
  }

  const query = params.toString();
  return query.length > 0 ? `/works?${query}` : "/works";
}

export const dynamic = "force-dynamic";

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams.category;
  const contextParam = resolvedSearchParams.context ?? null;
  const activeCategory = categoryParam && isCategory(categoryParam) ? categoryParam : null;
  const [settings, workList, contextCategories] = await Promise.all([getSiteSettings(), getWorks(activeCategory), getWorkContextCategories()]);
  const hasUnassignedWorks = workList.some((work) => work.contextCategoryId === null);
  const activeContext =
    contextParam === unassignedContextSlug || contextCategories.some((contextCategory) => contextCategory.slug === contextParam)
      ? contextParam
      : null;

  const filteredWorks =
    activeContext === unassignedContextSlug
      ? workList.filter((work) => work.contextCategoryId === null)
      : activeContext
        ? workList.filter((work) => work.contextCategorySlug === activeContext)
        : workList;

  const groupedWorks = activeContext
    ? [
        {
          key: activeContext,
          titleJa:
            activeContext === unassignedContextSlug
              ? "未分類"
              : contextCategories.find((contextCategory) => contextCategory.slug === activeContext)?.nameJa ?? "文脈カテゴリ",
          titleEn:
            activeContext === unassignedContextSlug
              ? "Unassigned"
              : contextCategories.find((contextCategory) => contextCategory.slug === activeContext)?.nameEn ?? "Context Category",
          works: filteredWorks,
        },
      ]
    : [
        ...contextCategories
          .map((contextCategory) => ({
            key: contextCategory.slug,
            titleJa: contextCategory.nameJa,
            titleEn: contextCategory.nameEn,
            works: filteredWorks.filter((work) => work.contextCategoryId === contextCategory.id),
          }))
          .filter((group) => group.works.length > 0),
        ...(hasUnassignedWorks
          ? [
              {
                key: unassignedContextSlug,
                titleJa: "未分類",
                titleEn: "Unassigned",
                works: filteredWorks.filter((work) => work.contextCategoryId === null),
              },
            ]
          : []),
      ];

  return (
    <SiteShell settings={settings} currentPath="/works">
      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            titleJa="作品一覧"
            titleEn="Works"
            lead="これまでに制作した作品を、表示媒体と制作文脈の 2 軸で整理しています。採用担当者が興味の近い制作物へ短時間で到達できるよう、一覧性と絞り込みの両立を重視した構成です。"
            align="center"
          />
        </div>
      </section>

      <section className="bg-surface-primary px-6 pb-4 pt-8 sm:px-20 sm:pt-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground-muted">文脈カテゴリ / Context</p>
            <div className="flex flex-wrap gap-3">
              <CategoryChip labelJa="すべての文脈" labelEn="All Contexts" href={buildWorksHref(activeCategory, null)} active={!activeContext} />
              {contextCategories.map((contextCategory) => (
                <CategoryChip
                  key={contextCategory.id}
                  href={buildWorksHref(activeCategory, contextCategory.slug)}
                  active={activeContext === contextCategory.slug}
                  labelJa={contextCategory.nameJa}
                  labelEn={contextCategory.nameEn}
                />
              ))}
              {hasUnassignedWorks ? (
                <CategoryChip
                  href={buildWorksHref(activeCategory, unassignedContextSlug)}
                  active={activeContext === unassignedContextSlug}
                  labelJa="未分類"
                  labelEn="Unassigned"
                />
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground-muted">表示媒体 / Medium</p>
            <div className="flex flex-wrap gap-3">
              <CategoryChip labelJa="すべての媒体" labelEn="All Media" href={buildWorksHref(null, activeContext)} active={!activeCategory} />
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  href={buildWorksHref(category, activeContext)}
                  active={activeCategory === category}
                  labelJa={getMediumCategoryDefinition(category).nameJa}
                  labelEn={getMediumCategoryDefinition(category).nameEn}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-8 sm:px-20 sm:py-12">
        <div className="mx-auto max-w-6xl space-y-12">
          {filteredWorks.length > 0 ? (
            groupedWorks.map((group, groupIndex) => (
              <section key={group.key} className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-subtle pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground-primary">{group.titleJa}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground-muted" lang="en">
                      {group.titleEn}
                    </p>
                  </div>
                  <p className="text-sm text-foreground-secondary">{`${group.works.length} 件`}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                  {group.works.map((work, index) => (
                    <WorkCard key={work.id ?? work.title} work={work} priorityImage={groupIndex === 0 && index === 0} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="py-12 text-center text-sm text-foreground-muted">{"// 条件に一致する作品が見つかりませんでした"}</p>
          )}
        </div>
      </section>
    </SiteShell>
  );
}