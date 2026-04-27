import { categories, getMediumCategoryDefinition } from "@/domain/publicApi";
import { getSiteSettings, getWorks } from "@worker/lib/site-data";
import { CategoryChip } from "@/presentation/components/CategoryChip";
import { PageHeader } from "@/presentation/components/PageHeader";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkCard } from "@/presentation/components/WorkCard";

interface WorksPageProps {
  readonly searchParams: Promise<{
    readonly category?: string;
  }>;
}

function isCategory(value: string): value is (typeof categories)[number] {
  return categories.includes(value as (typeof categories)[number]);
}

export const dynamic = "force-dynamic";

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams.category;
  const activeCategory = categoryParam && isCategory(categoryParam) ? categoryParam : null;
  const [settings, workList] = await Promise.all([getSiteSettings(), getWorks(activeCategory)]);

  return (
    <SiteShell settings={settings} currentPath="/works">
      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            titleJa="作品一覧"
            titleEn="Works"
            lead="これまでに制作したアプリ、Web、映像、グラフィックの一覧です。カテゴリから興味の近い制作物を絞り込み、短時間で全体像を把握できる構成にしています。"
            align="center"
          />
        </div>
      </section>

      <section className="bg-surface-primary px-6 pb-4 pt-8 sm:px-20 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3">
            <CategoryChip labelJa="すべて" labelEn="All" href="/works" active={!activeCategory} />
            {categories.map((category) => (
              <CategoryChip
                key={category}
                href={`/works?category=${category}`}
                active={activeCategory === category}
                labelJa={getMediumCategoryDefinition(category).nameJa}
                labelEn={getMediumCategoryDefinition(category).nameEn}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-8 sm:px-20 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
            {workList.length > 0 ? (
              workList.map((work) => <WorkCard key={work.id ?? work.title} work={work} />)
            ) : (
              <p className="col-span-3 py-12 text-center text-sm text-foreground-muted">{"// 作品が見つかりませんでした"}</p>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}