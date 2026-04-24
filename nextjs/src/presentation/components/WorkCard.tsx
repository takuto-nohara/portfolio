import Link from "next/link";

import type { Work } from "@/domain/publicApi";

interface WorkCardProps {
  readonly work: Work;
}

function resolveThumbnailUrl(thumbnail: string | null): string | null {
  if (!thumbnail) {
    return null;
  }

  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://") || thumbnail.startsWith("/")) {
    return thumbnail;
  }

  return null;
}

export function WorkCard({ work }: WorkCardProps) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail);

  return (
    <Link href={`/works/${work.id ?? ""}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card transition-colors hover:border-accent-primary">
        <div
          className="flex aspect-video items-center justify-center bg-border-subtle"
          style={
            thumbnailUrl
              ? {
                  backgroundImage: `url(${thumbnailUrl})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!thumbnailUrl ? <span className="text-xs text-foreground-muted">no_thumbnail</span> : null}
        </div>
        <div className="p-5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-accent-primary">
            {`output.${work.category}`}
          </span>
          <h3 className="mt-2 text-base font-semibold text-foreground-primary transition-colors group-hover:text-accent-primary">
            {work.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-secondary">{work.description}</p>
        </div>
      </div>
    </Link>
  );
}