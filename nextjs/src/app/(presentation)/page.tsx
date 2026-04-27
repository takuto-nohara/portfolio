import Link from "next/link";

import { getFeaturedWorks, getSiteSettings } from "@worker/lib/site-data";
import { ProfileAvatar } from "@/presentation/components/ProfileAvatar";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkCard } from "@/presentation/components/WorkCard";
import { siteProfile } from "@/presentation/content/siteProfile";

const highlights = [
  {
    title: "設計から実装まで",
    description: "要件整理、画面設計、実装、運用まで一連の流れを自走して進めた制作物を掲載しています。",
  },
  {
    title: "複数媒体の制作経験",
    description: "Web アプリだけでなく、映像やグラフィックも含めてアウトプットの幅を持っています。",
  },
  {
    title: "学習と実践の接続",
    description: "個人開発と実案件の両方を通じて、学んだ技術を実際の課題解決へ結びつけています。",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, featuredWorks] = await Promise.all([getSiteSettings(), getFeaturedWorks()]);

  return (
    <SiteShell settings={settings} currentPath="/">
      <section className="hero-bg relative overflow-hidden px-6 py-16 sm:px-20 sm:py-24">
        <canvas id="hero-canvas" className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="hero-item text-sm font-medium tracking-[0.24em] text-accent-primary" data-delay="0" lang="en">
              {siteProfile.roleEn}
            </p>
            <h1 className="hero-item mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground-primary sm:text-6xl" data-delay="100">
              {siteProfile.nameJa}
            </h1>
            <p className="hero-item mt-3 text-lg text-foreground-secondary" data-delay="150" lang="en">
              {siteProfile.nameEn}
            </p>
            <p className="hero-item mt-4 text-base font-medium text-foreground-primary sm:text-lg" data-delay="200">
              {siteProfile.roleJa}
            </p>
            <p className="hero-item mt-6 max-w-2xl text-sm leading-8 text-foreground-secondary sm:text-base" data-delay="250">
              {siteProfile.homeLead.map((line, i) => (
                <span key={i}>{line}{i < siteProfile.homeLead.length - 1 && <br />}</span>
              ))}
            </p>
            <div className="hero-item mt-10 flex flex-wrap gap-3" data-delay="300">
              <Link
                href="/works"
                className="rounded-full bg-accent-primary px-6 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary"
              >
                作品を見る / Works
              </Link>
              {settings.githubUrl ? (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-accent-primary px-6 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
                >
                  GitHub
                </a>
              ) : (
                <Link
                  href="/about"
                  className="rounded-full border border-accent-primary px-6 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
                >
                  自己紹介 / About
                </Link>
              )}
              <Link
                href="/contact"
                className="rounded-full border border-accent-primary px-6 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
              >
                連絡する / Contact
              </Link>
            </div>

          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <ProfileAvatar sizeClass="h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80" priority />
          </div>
        </div>
      </section>

      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground-primary">注目の作品</h2>
              <p className="mt-2 text-sm text-foreground-secondary" lang="en">
                Featured Works
              </p>
            </div>
            <Link href="/works" className="text-sm font-medium text-accent-primary transition-colors hover:text-accent-secondary">
              すべて見る / View all
            </Link>
          </div>

          {featuredWorks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
              {featuredWorks.map((work, index) => (
                <WorkCard key={work.id ?? work.title} work={work} priorityImage={index === 0} />
              ))}
            </div>
          ) : (
            <p className="col-span-3 py-12 text-center text-sm text-foreground-muted">{"// まだ作品が登録されていません"}</p>
          )}
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl border border-border-subtle bg-surface-secondary p-8 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.24)] sm:p-10">
            <p className="text-sm font-medium tracking-[0.24em] text-accent-primary" lang="en">
              About
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground-primary">自己紹介</h2>
            <p className="mt-5 text-sm leading-8 text-foreground-secondary">{siteProfile.summary}</p>
            <p className="mt-4 text-sm leading-8 text-foreground-secondary">
              中学生のころに動画編集からものづくりへ入り、現在は Web アプリケーション開発を中心に、設計意図まで説明できる成果物づくりを重視しています。
            </p>
            <Link href="/about" className="mt-6 inline-flex text-sm font-medium text-accent-primary transition-colors hover:text-accent-secondary">
              自己紹介を見る / Learn more
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {highlights.map((highlight) => (
              <section key={highlight.title} className="rounded-3xl border border-border-subtle bg-surface-primary p-6 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.18)]">
                <h3 className="text-lg font-semibold text-foreground-primary">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground-secondary">{highlight.description}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
