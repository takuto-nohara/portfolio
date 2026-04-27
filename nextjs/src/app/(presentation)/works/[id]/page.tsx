import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSiteSettings, getWorks, getWorkDetail } from "@worker/lib/site-data";
import { getMediumCategoryDefinition } from "@/domain/publicApi";
import { Breadcrumb } from "@/presentation/components/Breadcrumb";
import { CategoryChip } from "@/presentation/components/CategoryChip";
import { PageHeader } from "@/presentation/components/PageHeader";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";
import { SiteShell } from "@/presentation/components/SiteShell";
import { TechTag } from "@/presentation/components/TechTag";
import { WorkGalleryModal } from "@/presentation/components/work/WorkGalleryModal";

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
      if (match) return match[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

interface WorkDetailPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;
  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    notFound();
  }

  const [settings, workDetail, allWorks] = await Promise.all([getSiteSettings(), getWorkDetail(workId), getWorks()]);

  if (!workDetail) {
    notFound();
  }

  const sortedWorks = [...allWorks].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = sortedWorks.findIndex((w) => w.id === workId);
  const prevWork = currentIndex > 0 ? sortedWorks[currentIndex - 1] : null;
  const nextWork = currentIndex < sortedWorks.length - 1 ? sortedWorks[currentIndex + 1] : null;

  const thumbnailUrl = resolveWorkAssetUrl(workDetail.thumbnail);
  const videoId = workDetail.videoUrl ? extractYouTubeVideoId(workDetail.videoUrl) : null;
  const techStack = workDetail.techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);
  const category = getMediumCategoryDefinition(workDetail.category);

  return (
    <SiteShell settings={settings} currentPath={`/works/${workId}`}>
      <section className="bg-surface-secondary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={[{ label: "トップ", href: "/" }, { label: "作品一覧", href: "/works" }, { label: workDetail.title }]} />
          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryChip labelJa={category.nameJa} labelEn={category.nameEn} />
            {workDetail.contextCategoryNameJa && workDetail.contextCategoryNameEn ? (
              <CategoryChip labelJa={workDetail.contextCategoryNameJa} labelEn={workDetail.contextCategoryNameEn} />
            ) : null}
          </div>
          <div className="mt-6 max-w-3xl">
            <PageHeader
              titleJa={workDetail.title}
              titleEn="Work Details"
              lead={`作品「${workDetail.title}」の制作背景、使用技術、公開先をまとめています。`}
            />
            {workDetail.publishedAt ? <p className="mt-4 text-sm text-foreground-muted">{`公開日: ${workDetail.publishedAt}`}</p> : null}
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 pb-4 pt-8 sm:px-20 sm:pt-12">
        <div className="relative mx-auto flex aspect-16/7 max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-[0_24px_70px_-42px_rgba(12,74,110,0.32)]">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={workDetail.title}
              fill
              className="object-contain"
              sizes="(min-width: 1152px) 1152px, 100vw"
              priority
            />
          ) : (
            <span className="text-sm text-foreground-muted">メインビジュアル準備中 / Hero image pending</span>
          )}
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground-primary">
              概要 <span className="ml-2 text-xs uppercase tracking-[0.18em] text-foreground-muted" lang="en">Overview</span>
            </h2>
            <p className="text-sm leading-8 text-foreground-secondary">{workDetail.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground-primary">
              使用技術 <span className="ml-2 text-xs uppercase tracking-[0.18em] text-foreground-muted" lang="en">Tech Stack</span>
            </h2>
            <ul className="flex flex-wrap gap-2" role="list" aria-label="使用技術">
              {techStack.map((tech) => (
                <TechTag key={tech}>
                  {tech}
                </TechTag>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {workDetail.githubUrl ? (
              <a
                href={workDetail.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground-primary px-6 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-foreground-secondary"
              >
                GitHub で見る / GitHub
              </a>
            ) : null}
            {workDetail.url ? (
              <a
                href={workDetail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent-primary px-6 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
              >
                サイトを開く / Visit Site
              </a>
            ) : null}
          </div>

          {videoId ? (
            <div className="mt-16">
              <h2 className="mb-6 text-lg font-semibold text-foreground-primary">
                動画 <span className="ml-2 text-xs uppercase tracking-[0.18em] text-foreground-muted" lang="en">Video</span>
              </h2>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={workDetail.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : null}

          {workDetail.images.length > 0 ? (
            <div className="mt-16">
              <h2 className="mb-6 text-lg font-semibold text-foreground-primary">
                ギャラリー <span className="ml-2 text-xs uppercase tracking-[0.18em] text-foreground-muted" lang="en">Gallery</span>
              </h2>
              <WorkGalleryModal title={workDetail.title} images={workDetail.images} />
            </div>
          ) : null}

          <nav className="mt-16 flex items-center justify-between border-t border-border-subtle pt-8">
            {prevWork?.id != null ? (
              <Link
                href={`/works/${prevWork.id}`}
                className="group flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-accent-primary"
              >
                <span className="transition-transform group-hover:-translate-x-1">{"<"}</span>
                <span className="max-w-45 truncate">{prevWork.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextWork?.id != null ? (
              <Link
                href={`/works/${nextWork.id}`}
                className="group flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-accent-primary"
              >
                <span className="max-w-45 truncate">{nextWork.title}</span>
                <span className="transition-transform group-hover:translate-x-1">{">"}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </section>
    </SiteShell>
  );
}