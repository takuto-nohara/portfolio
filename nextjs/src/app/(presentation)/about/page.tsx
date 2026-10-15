import Image from "next/image";

import { getSiteSettings } from "@worker/lib/site-data";
import { NextPageLink } from "@/presentation/components/NextPageLink";
import { SectionLabel } from "@/presentation/components/SectionLabel";
import { Segments } from "@/presentation/components/Segments";
import { SiteShell } from "@/presentation/components/SiteShell";
import { experiences, siteProfile, siteSections, skills } from "@/presentation/content/siteContent";

export const metadata = { title: "自己紹介" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings} currentPath="/about">
      <div className="site-container page-pad">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-[clamp(32px,5vw,80px)]">
          <div className="relative w-[min(calc(100%-12px),280px)] md:w-full md:max-w-[420px]">
            <div data-reveal="render" className="media-frame aspect-[4/5]">
              <div data-img className="absolute inset-0">
                <Image
                  src={siteProfile.portrait}
                  alt={siteProfile.portraitAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 80vw"
                  className="object-cover object-[50%_20%]"
                />
              </div>
              <span data-scan aria-hidden="true" className="scan-line" />
            </div>
            <span aria-hidden="true" className="corner-bl" />
          </div>

          <div>
            <SectionLabel prefix="$">whoami</SectionLabel>
            <h1 data-reveal className="heading-page mt-4">
              {siteProfile.nameJa}
            </h1>
            <p data-reveal className="mt-3 text-sm leading-relaxed text-ink-muted">
              <Segments items={[siteProfile.nameKana, ...siteProfile.roleJa.split(" / "), siteProfile.affiliation]} />
            </p>
            <div data-reveal className="mt-7 flex max-w-[34em] flex-col gap-5 leading-[1.9] text-ink-body">
              {siteProfile.aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <section aria-labelledby="h-skills" className="mt-[clamp(64px,10vh,120px)] border-t border-line pt-[clamp(40px,6vh,64px)]">
          <SectionLabel prefix="//">01 &nbsp;skills</SectionLabel>
          <h2 id="h-skills" data-reveal className="heading-display mt-5 text-[clamp(28px,3.2vw,40px)] leading-[1.35]">
            {siteSections.skillsHeading}
          </h2>
          <dl data-reveal className="mt-8 grid grid-cols-1 border-b border-line-strong sm:grid-cols-[160px_1fr] sm:gap-x-6 md:grid-cols-[200px_1fr]">
            {skills.map((skill) => (
              <div key={skill.titleJa} className="contents">
                <dt className="border-t border-line-strong pt-4 text-[15px] leading-[1.7] font-medium sm:py-4.5">{skill.titleJa}</dt>
                <dd className="pt-1 pb-4 font-mono text-[13px] leading-[1.9] text-ink-body sm:border-t sm:border-line-strong sm:py-4.5 sm:text-sm">{skill.items.join(" / ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="h-experience" className="mt-[clamp(64px,10vh,120px)]">
          <SectionLabel prefix="//">02 &nbsp;git log</SectionLabel>
          <h2 id="h-experience" data-reveal className="heading-display mt-5 text-[clamp(28px,3.2vw,40px)] leading-[1.35]">
            {siteSections.experienceHeading}
          </h2>
          <ol className="mt-8 border-b border-line-strong">
            {experiences.map((experience) => (
              <li
                key={`${experience.date}-${experience.title}`}
                data-reveal
                className="grid grid-cols-1 gap-y-2 border-t border-line-strong py-6 sm:grid-cols-[120px_1fr] sm:gap-x-6 sm:gap-y-3"
              >
                <span className="font-mono text-sm leading-[1.7] tracking-[0.04em] text-link sm:pt-1">{experience.date}</span>
                <div className="max-w-[40em]">
                  <h3 className="heading-display text-lg leading-normal tracking-[0.03em] sm:text-xl">{experience.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.8] text-ink-body">{experience.description}</p>
                  {experience.href && experience.label ? (
                    <a href={experience.href} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-link hover:text-link-hover">
                      <span>{experience.label}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <NextPageLink href="/contact" label="次は、連絡へ" />
    </SiteShell>
  );
}
