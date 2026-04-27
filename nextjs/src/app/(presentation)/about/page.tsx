import { getSiteSettings } from "@worker/lib/site-data";
import { PageHeader } from "@/presentation/components/PageHeader";
import { ProfileAvatar } from "@/presentation/components/ProfileAvatar";
import { SiteShell } from "@/presentation/components/SiteShell";
import { SkillCard } from "@/presentation/components/SkillCard";
import { experiences, skillColumns } from "@/presentation/content/aboutContent";
import { siteProfile } from "@/presentation/content/siteProfile";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings} currentPath="/about">
      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            titleJa="自己紹介"
            titleEn="About"
            lead={<>このページでは、経歴、得意領域、使用技術をまとめて確認できます。<br />作品の背景にある興味や学習の流れも含めて、人物像が自然に伝わる構成に整えています。</>}
            align="center"
          />
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border-subtle bg-surface-secondary p-8 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.24)] sm:p-10">
          <div className="flex flex-col items-center gap-8 text-center">
            <ProfileAvatar sizeClass="h-48 w-48 sm:h-64 sm:w-64" priority />
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-foreground-primary">{siteProfile.nameJa}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-accent-primary" lang="en">
                {siteProfile.nameEn}
              </p>
              <p className="mt-4 text-base font-medium text-foreground-primary">{siteProfile.roleJa}</p>
              <div className="mt-6 space-y-4 break-keep text-left text-pretty text-sm leading-8 text-foreground-secondary">
                <p>
                  中学生のころ、動画編集をきっかけにコンテンツ制作の世界に入りました。映像から始まり、パンフレット、Webページ、そしてアプリケーション開発へと領域を広げています。
                </p>
                <p>
                  「欲しいものが見当たらないなら自分で作ってしまえ」という姿勢で、幅広いアウトプットに挑戦してきました。現在はフロントエンドからバックエンドまで、Webアプリケーション開発を軸に学習を深めています。
                </p>
                <p>コードを書くことは、頭の中のアイデアを実際に動いて触れる形へレンダリングすること。その過程自体に強い面白さを感じています。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 pb-12 sm:px-20 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground-primary">使用技術</h2>
            <p className="mt-2 text-sm text-foreground-secondary" lang="en">
              Skills
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {skillColumns.map((column) => (
              <SkillCard key={column.titleEn} titleJa={column.titleJa} titleEn={column.titleEn} items={column.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground-primary">経験の流れ</h2>
            <p className="mt-2 text-sm text-foreground-secondary" lang="en">
              Experience
            </p>
          </div>
          <div className="space-y-8">
            {experiences.map((experience) => (
              <div key={`${experience.date}-${experience.title}`} className="rounded-2xl border border-border-subtle bg-surface-secondary p-6 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.18)]">
                <div className="flex items-start gap-6">
                  <span className="w-20 shrink-0 text-sm font-semibold text-accent-primary">{experience.date}</span>
                  <div>
                  <h3 className="text-base font-semibold text-foreground-primary">{experience.title}</h3>
                    <p className="mt-2 break-keep text-pretty text-sm leading-7 text-foreground-secondary">{experience.description}</p>
                    {experience.href && experience.label ? (
                      <a
                        href={experience.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs text-accent-primary hover:underline"
                      >
                        {experience.label}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}