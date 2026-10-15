import Image from "next/image";
import Link from "next/link";

import { getFeaturedWorks, getSiteSettings, getWorks } from "@worker/lib/site-data";
import { NextPageLink } from "@/presentation/components/NextPageLink";
import { Phrases } from "@/presentation/components/Phrases";
import { SectionLabel } from "@/presentation/components/SectionLabel";
import { SiteShell } from "@/presentation/components/SiteShell";
import { TypedCommand } from "@/presentation/components/TypedCommand";
import { WorkThumb } from "@/presentation/components/work/WorkThumb";
import { siteProfile, siteSections } from "@/presentation/content/siteContent";
import { getWorkMeta } from "@/presentation/lib/work-view";

const FEATURED_COUNT = 3;

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, featuredWorks, allWorks] = await Promise.all([getSiteSettings(), getFeaturedWorks(), getWorks()]);
  const featured = featuredWorks.slice(0, FEATURED_COUNT);

  return (
    <SiteShell settings={settings} currentPath="/">
      <section aria-label="自己紹介の要約" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_72%_40%,rgba(186,230,253,0.55)_0%,rgba(224,242,254,0.25)_45%,rgba(247,249,251,0)_75%)]"
        />
        <div className="site-container relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] pt-[clamp(48px,8vh,96px)] pb-[clamp(64px,10vh,120px)]">
          <div>
            <TypedCommand text={siteProfile.command} />
            <p className="sr-only">{siteProfile.command}</p>
            <h1 data-reveal className="heading-display mt-5 text-[clamp(40px,6vw,76px)] leading-[1.2] tracking-[0.04em]">
              {siteProfile.nameJa}
            </h1>
            <p data-reveal className="mt-3 text-sm leading-relaxed text-ink-muted">
              {`${siteProfile.nameKana} / ${siteProfile.roleJa}`}
            </p>
            <p className="mt-8 max-w-[14em] font-serif text-[clamp(22px,2.6vw,32px)] leading-[1.55] tracking-[0.06em]">
              <Phrases text={siteProfile.catchCopy} />
            </p>
            <p data-reveal className="mt-6 max-w-[34em] leading-[1.9] text-ink-body">
              {siteProfile.lead}
            </p>
            <div data-reveal className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/works"
                className="inline-flex min-h-13 items-center gap-3.5 rounded-full bg-ink px-7 text-[15px] font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:translate-x-0.5 hover:bg-link hover:shadow-[0_0_0_6px_rgba(14,165,233,0.18)]"
              >
                <span>作品を見る</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact" className="link-underline text-[15px]">
                連絡する
              </Link>
            </div>
          </div>

          <div className="relative w-[min(100%,clamp(260px,34vw,460px))] justify-self-center">
            <div data-reveal="render" className="media-frame aspect-[4/5]">
              <div data-img className="absolute inset-0">
                <Image
                  src={siteProfile.portrait}
                  alt={siteProfile.portraitAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 460px, 80vw"
                  className="object-cover object-[50%_20%]"
                />
              </div>
              <span data-scan aria-hidden="true" className="scan-line" />
            </div>
            <span aria-hidden="true" className="corner-bl" />
            <span aria-hidden="true" className="corner-tr" />
            <p aria-hidden="true" className="absolute right-0 -bottom-7.5 font-mono text-[11px] tracking-[0.08em] text-ink-muted">
              creator &amp;&amp; programmer
            </p>
          </div>
        </div>
        <a
          href="#h-works"
          data-reveal
          aria-label="作品セクションへスクロール"
          className="absolute bottom-6 left-[clamp(20px,5vw,56px)] inline-flex min-h-11 items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-ink-muted hover:text-link"
        >
          <span aria-hidden="true" className="scroll-cue block h-10 w-px bg-sky" />
          <span>scroll</span>
        </a>
      </section>

      <section aria-labelledby="h-works" className="border-t border-line">
        <div className="site-container section-pad">
          <SectionLabel prefix="//">01 &nbsp;works --featured</SectionLabel>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <h2 id="h-works" data-reveal className="heading-section">
              {siteSections.worksHeading}
            </h2>
            <Link href="/works" data-reveal className="inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-ink hover:text-link">
              <span>{`${siteSections.worksAll}（${allWorks.length}）`}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featured.length > 0 ? (
            <ol className="mt-[clamp(32px,5vh,56px)] flex flex-col">
              {featured.map((work, index) => {
                const meta = getWorkMeta(work);

                return (
                  <li key={work.id ?? work.title} data-reveal className="border-t border-line">
                    <Link
                      href={work.id === null ? "/works" : `/works/${work.id}`}
                      aria-label={`${work.title} の詳細`}
                      className="row-link group grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(20px,3vw,48px)] py-[clamp(28px,4vh,44px)]"
                    >
                      <WorkThumb work={work} sizes="(min-width: 1024px) 560px, 100vw" priority={index === 0} />
                      <div>
                        <p className="font-mono text-xs leading-normal tracking-[0.06em] text-ink-muted">
                          {`${String(index + 1).padStart(2, "0")}  ${meta.mediumJa}  ${meta.year}`}
                        </p>
                        <h3 className="heading-display mt-3 text-[clamp(24px,2.6vw,34px)] leading-[1.4] tracking-[0.04em]">{work.title}</h3>
                        <p className="mt-3 leading-[1.8] text-ink-body">{meta.lead}</p>
                        {work.role ? <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{`担当: ${work.role}`}</p> : null}
                        <span className="mt-5 inline-flex items-center gap-2.5 text-sm font-medium text-link">
                          <span>詳しく見る</span>
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-12 text-center text-ink-muted">まだ作品が登録されていません。</p>
          )}
        </div>
      </section>

      <section aria-labelledby="h-about" className="border-t border-line bg-sky-soft/35">
        <div className="site-container section-pad grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-end gap-[clamp(32px,5vw,80px)]">
          <div>
            <SectionLabel prefix="//">02 &nbsp;about</SectionLabel>
            <h2 id="h-about" className="heading-section mt-5 max-w-[14em]">
              <Phrases text={siteProfile.aboutTitle} />
            </h2>
            <p data-reveal className="mt-6 max-w-[32em] leading-[1.9] text-ink-body">
              {siteProfile.aboutSummary}
            </p>
            <Link href="/about" data-reveal className="link-underline mt-7 text-[15px]">
              <span>{siteSections.aboutMore}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <dl data-reveal className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line-strong text-[15px] leading-[1.7]">
            {siteProfile.facts.map((fact) => (
              <div key={fact.label} className="contents">
                <dt className="border-t border-line-strong py-4 font-mono text-xs leading-[1.7] tracking-[0.06em] text-link">{fact.label}</dt>
                <dd className="border-t border-line-strong py-4">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="h-contact" className="border-t border-line">
        <div className="site-container section-pad">
          <SectionLabel prefix="//">03 &nbsp;contact</SectionLabel>
          <h2 id="h-contact" className="heading-section mt-5 max-w-[16em]">
            <Phrases text={siteSections.contactTitle} />
          </h2>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="link-underline font-mono text-[clamp(16px,2.2vw,22px)] font-normal">
                {settings.contactEmail}
              </a>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex min-h-13 items-center gap-3.5 rounded-full border border-ink px-7 text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-white"
            >
              <span>フォームを開く</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <NextPageLink href="/works" label="次は、作品一覧へ" />
    </SiteShell>
  );
}
