import Link from "next/link";

import { categories } from "@/domain/publicApi";
import { getSiteSettings, getWorks } from "@/lib/site-data";
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
    <SiteShell settings={settings}>
      <section className="bg-surface-secondary px-6 py-12 text-center sm:px-20 sm:py-20">
        <h1 className="text-[40px] font-bold text-foreground-primary">{"> All Works"}</h1>
      </section>

      <section className="bg-surface-primary px-6 pb-4 pt-8 sm:px-20 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/works"
              className={`rounded px-4 py-2 text-xs font-medium transition-colors ${!activeCategory ? "bg-accent-primary text-surface-primary" : "bg-surface-card text-foreground-secondary hover:bg-border-subtle"}`}
            >
              all()
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/works?category=${category}`}
                className={`rounded px-4 py-2 text-xs font-medium transition-colors ${activeCategory === category ? "bg-accent-primary text-surface-primary" : "bg-surface-card text-foreground-secondary hover:bg-border-subtle"}`}
              >
                {`output.${category}`}
              </Link>
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