import Link from "next/link";
import { notFound } from "next/navigation";

import { getSiteSettings, getWorkDetail } from "@/lib/site-data";
import { resolveWorkAssetUrl } from "@/lib/work-assets";
import { SiteShell } from "@/presentation/components/SiteShell";
import { WorkGalleryModal } from "@/presentation/components/work/WorkGalleryModal";

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

  const [settings, workDetail] = await Promise.all([getSiteSettings(), getWorkDetail(workId)]);

  if (!workDetail) {
    notFound();
  }

  const thumbnailUrl = resolveWorkAssetUrl(workDetail.thumbnail);
  const techStack = workDetail.techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);

  return (
    <SiteShell settings={settings}>
      <section className="bg-surface-card">
        <div className="mx-auto flex aspect-[16/7] max-w-6xl items-center justify-center">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={workDetail.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-foreground-muted">hero_image</span>
          )}
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded bg-surface-card px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-accent-primary">
            {`output.${workDetail.category}`}
          </span>

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
            <Link
              href="/works"
              className="rounded border border-border-subtle px-6 py-3 text-sm font-medium text-foreground-secondary transition-colors hover:border-accent-primary hover:text-accent-primary"
            >
              {"> back_to_works"}
            </Link>
          </div>

          <div className="mt-16">
            <h2 className="mb-6 text-lg font-semibold text-foreground-primary">{"> gallery"}</h2>
            <WorkGalleryModal title={workDetail.title} images={workDetail.images} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}