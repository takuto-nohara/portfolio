import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSiteSettings, getWorks, getWorkDetail } from "@worker/lib/site-data";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";
import { SiteShell } from "@/presentation/components/SiteShell";
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

  return (
    <SiteShell settings={settings}>
      <section className="bg-surface-card">
        <div className="relative mx-auto flex aspect-16/7 max-w-6xl items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            <>
              {/* ブラー背景：黒帯や余白部分を補完する */}
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                aria-hidden="true"
                className="scale-110 object-cover brightness-50"
                sizes="(min-width: 1152px) 1152px, 100vw"
              />
              {/* メイン画像：見切れないよう object-contain */}
              <Image
                src={thumbnailUrl}
                alt={workDetail.title}
                fill
                className="object-contain"
                sizes="(min-width: 1152px) 1152px, 100vw"
              />
            </>
          ) : (
            <span className="text-sm text-foreground-muted">hero_image</span>
          )}
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <span className="inline-block rounded bg-surface-card px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-accent-primary">
              {`output.${workDetail.category}`}
            </span>
            <Link
              href="/works"
              className="text-sm font-medium text-foreground-secondary transition-colors hover:text-accent-primary"
            >
              {"> back_to_works"}
            </Link>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-foreground-primary">{workDetail.title}</h1>
          {workDetail.publishedAt ? (
            <p className="mt-2 text-xs text-foreground-muted">{`published: ${workDetail.publishedAt}`}</p>
          ) : null}

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground-primary">{"> description"}</h2>
            <p className="text-sm leading-relaxed text-foreground-secondary">{workDetail.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground-primary">{"> tech_stack"}</h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="rounded border border-border-subtle bg-surface-card px-3 py-1 text-xs text-foreground-secondary">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {workDetail.githubUrl ? (
              <a
                href={workDetail.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-foreground-primary px-6 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-foreground-secondary"
              >
                {"> github_repo"}
              </a>
            ) : null}
            {workDetail.url ? (
              <a
                href={workDetail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-accent-primary px-6 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
              >
                {"> visit_site"}
              </a>
            ) : null}
          </div>

          {videoId ? (
            <div className="mt-16">
              <h2 className="mb-6 text-lg font-semibold text-foreground-primary">{"> video"}</h2>
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
              <h2 className="mb-6 text-lg font-semibold text-foreground-primary">{"> gallery"}</h2>
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