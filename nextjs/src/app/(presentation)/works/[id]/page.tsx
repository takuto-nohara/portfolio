import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getSiteSettings, getWorks, getWorkDetail } from "@worker/lib/site-data";
import { ExternalLink } from "@/presentation/components/ExternalLink";
import { NextPageLink } from "@/presentation/components/NextPageLink";
import { SectionLabel } from "@/presentation/components/SectionLabel";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkGalleryModal } from "@/presentation/components/work/WorkGalleryModal";
import { WorkThumb } from "@/presentation/components/work/WorkThumb";
import { getWorkMeta } from "@/presentation/lib/work-view";
import { extractYouTubeVideoId } from "@/presentation/lib/youtube";

interface WorkDetailPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

function DetailSection({ id, title, children }: { readonly id: string; readonly title: string; readonly children: ReactNode }) {
  return (
    <section data-reveal aria-labelledby={id}>
      <h2 id={id} className="heading-display text-[22px] leading-[1.45] tracking-[0.04em]">
        {title}
      </h2>
      <div className="mt-4 leading-[1.9] whitespace-pre-line text-ink-body">{children}</div>
    </section>
  );
}

const dtClassName = "border-t border-line-strong py-3.5 font-mono text-xs leading-[1.7] tracking-[0.06em] text-link";
const ddClassName = "border-t border-line-strong py-3.5";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const work = Number.isInteger(Number(id)) ? await getWorkDetail(Number(id)) : null;

  return work ? { title: work.title, description: work.lead ?? undefined } : { title: "作品詳細" };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;
  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    notFound();
  }

  const [settings, work, allWorks] = await Promise.all([getSiteSettings(), getWorkDetail(workId), getWorks()]);

  if (!work) {
    notFound();
  }

  const sortedWorks = [...allWorks].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = sortedWorks.findIndex((w) => w.id === workId);
  const prevWork = currentIndex > 0 ? sortedWorks[currentIndex - 1] : null;
  const nextWork = currentIndex >= 0 && currentIndex < sortedWorks.length - 1 ? sortedWorks[currentIndex + 1] : null;
  const meta = getWorkMeta(work);
  const videoId = work.videoUrl ? extractYouTubeVideoId(work.videoUrl) : null;
  const subtitle = [meta.mediumJa, work.contextCategoryNameJa, meta.year].filter(Boolean).join(" / ");

  return (
    <SiteShell settings={settings} currentPath={`/works/${workId}`}>
      <article className="site-container pt-[clamp(32px,5vh,56px)] pb-[clamp(64px,10vh,120px)]">
        <nav aria-label="パンくず" data-reveal className="text-[13px]">
          <Link href="/works" className="inline-flex min-h-11 items-center gap-2 text-ink-muted hover:text-link">
            <span aria-hidden="true">←</span>
            <span>作品一覧</span>
          </Link>
        </nav>

        <header className="mt-2 max-w-[820px]">
          <SectionLabel prefix="$">
            cat works/{workId} &nbsp;<span className="text-ink-muted">{subtitle}</span>
          </SectionLabel>
          <h1 data-reveal className="heading-display mt-4 text-[clamp(32px,4.5vw,56px)] leading-[1.3] tracking-[0.04em]">
            {work.title}
          </h1>
          {work.lead ? (
            <p data-reveal className="mt-5 text-[clamp(17px,1.6vw,20px)] leading-[1.8] text-ink-body">
              {work.lead}
            </p>
          ) : null}
        </header>

        <WorkThumb
          work={work}
          className="mt-[clamp(32px,5vh,48px)] aspect-video"
          sizes="(min-width: 1240px) 1128px, 100vw"
          alt={`${work.title} のメインビジュアル`}
          priority
        />

        <div className="mt-[clamp(40px,6vh,72px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(32px,5vw,72px)]">
          <dl data-reveal className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line-strong text-[15px] leading-[1.7] md:sticky md:top-24">
            {work.role ? (
              <>
                <dt className={dtClassName}>担当</dt>
                <dd className={ddClassName}>{work.role}</dd>
              </>
            ) : null}
            {work.publishedAt ? (
              <>
                <dt className={dtClassName}>公開</dt>
                <dd className={ddClassName}>{work.publishedAt}</dd>
              </>
            ) : null}
            {meta.stackFull ? (
              <>
                <dt className={dtClassName}>技術</dt>
                <dd className={`${ddClassName} font-mono text-[13px] leading-[1.8]`}>{meta.stackFull}</dd>
              </>
            ) : null}
            <dt className={dtClassName}>リンク</dt>
            <dd className={`${ddClassName} flex flex-col items-start gap-2`}>
              {work.url ? (
                <a href={work.url} className="inline-flex items-center gap-2 font-medium text-link hover:text-link-hover">
                  <span>サイトを開く</span>
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
              {work.githubUrl ? (
                <ExternalLink href={work.githubUrl} className="inline-flex items-center font-medium text-link hover:text-link-hover">
                  GitHub
                </ExternalLink>
              ) : null}
              {!work.url && !work.githubUrl ? <span className="text-ink-muted">非公開</span> : null}
            </dd>
          </dl>

          <div className="flex max-w-[680px] flex-col gap-[clamp(36px,5vh,56px)]">
            <DetailSection id="d-overview" title="概要">
              {work.description}
            </DetailSection>
            {work.techDescription ? (
              <DetailSection id="d-tech" title="技術と設計">
                {work.techDescription}
              </DetailSection>
            ) : null}
            {work.background ? (
              <DetailSection id="d-background" title="背景">
                {work.background}
              </DetailSection>
            ) : null}
          </div>
        </div>

        {videoId ? (
          <section aria-labelledby="d-video" className="mt-[clamp(48px,7vh,80px)]">
            <h2 id="d-video" data-reveal className="heading-display text-[22px] leading-[1.45] tracking-[0.04em]">
              映像
            </h2>
            <div data-reveal className="media-frame mt-5 aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={work.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </section>
        ) : null}

        {work.images.length > 0 ? (
          <section aria-labelledby="d-gallery" className="mt-[clamp(48px,7vh,80px)]">
            <h2 id="d-gallery" data-reveal className="heading-display text-[22px] leading-[1.45] tracking-[0.04em]">
              画面
            </h2>
            <WorkGalleryModal title={work.title} images={work.images} />
          </section>
        ) : null}

        <nav aria-label="前後の作品" data-reveal className="mt-[clamp(48px,7vh,80px)] flex justify-between gap-6 border-t border-line-strong pt-6 text-[15px]">
          {prevWork?.id != null ? (
            <Link href={`/works/${prevWork.id}`} className="inline-flex min-h-11 items-center gap-2.5 text-ink hover:text-link">
              <span aria-hidden="true">←</span>
              <span>{prevWork.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextWork?.id != null ? (
            <Link href={`/works/${nextWork.id}`} className="inline-flex min-h-11 items-center gap-2.5 text-right text-ink hover:text-link">
              <span>{nextWork.title}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <NextPageLink href="/works" label="作品一覧に戻る" />
    </SiteShell>
  );
}
