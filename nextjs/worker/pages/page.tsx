import Link from "next/link";

import { getFeaturedWorks, getSiteSettings } from "@worker/lib/site-data";
import { ProfileAvatar } from "@/presentation/components/ProfileAvatar";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkCard } from "@/presentation/components/WorkCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, featuredWorks] = await Promise.all([getSiteSettings(), getFeaturedWorks()]);

  return (
    <SiteShell settings={settings}>
      <section className="hero-bg relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-6 text-center sm:px-20">
        <canvas id="hero-canvas" className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="hero-item text-[56px] font-bold leading-tight tracking-tight text-foreground-primary" data-delay="0">
            Rendering Ideas
            <br />
            into Reality
          </h1>
          <p className="hero-item mt-6 max-w-xl text-base leading-relaxed text-foreground-secondary" data-delay="150">
            思考を目に見える形に。アプリ、Web、映像、グラフィック——
            <br />
            あらゆるアウトプットを通じて学びを深めています。
          </p>
          <div className="hero-item mt-10 flex gap-4" data-delay="300">
            <Link
              href="/works"
              className="rounded bg-accent-primary px-8 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary"
            >
              {"> view_all_works"}
            </Link>
            <Link
              href="/contact"
              className="rounded border border-accent-primary px-8 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
            >
              {"> contact_me"}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-foreground-primary">{"> featured_works"}</h2>
            <Link href="/works" className="text-xs text-accent-primary transition-colors hover:text-accent-secondary">
              {"view_all >"}
            </Link>
          </div>

          {featuredWorks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
              {featuredWorks.map((work) => (
                <WorkCard key={work.id ?? work.title} work={work} />
              ))}
            </div>
          ) : (
            <p className="col-span-3 py-12 text-center text-sm text-foreground-muted">{"// まだ作品が登録されていません"}</p>
          )}
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:gap-16">
          <ProfileAvatar sizeClass="h-48 w-48 sm:h-80 sm:w-80" priority />
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground-primary">{"> about_me"}</h2>
            <p className="mb-6 text-sm leading-relaxed text-foreground-secondary">
              『欲しいものが見当たらない？ならば作ってしまえばいい！』を
              <br />
              モットーに様々なコンテンツの制作を行っています。
            </p>
            <Link href="/about" className="text-sm font-medium text-accent-primary transition-colors hover:text-accent-secondary">
              {"> learn_more"}
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
