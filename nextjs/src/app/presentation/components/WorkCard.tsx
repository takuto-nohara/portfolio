import Image from "next/image";
import Link from "next/link";

import type { Work } from "@/domain/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

interface WorkCardProps {
  readonly work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  const thumbnailUrl = resolveWorkAssetUrl(work.thumbnail);
  const href = work.id === null ? "/works" : `/works/${work.id}`;

  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card transition-colors hover:border-accent-primary">
        <div className="relative flex aspect-video items-center justify-center bg-border-subtle">
          {thumbnailUrl ? (
            <>
              {/* ブラー背景：黒帯や余白部分を補完する */}
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                aria-hidden="true"
                className="scale-110 object-cover brightness-50"
                sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              {/* メイン画像：見切れないよう object-contain */}
              <Image
                src={thumbnailUrl}
                alt={work.title}
                fill
                className="object-contain"
                sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </>
          ) : (
            <span className="text-xs text-foreground-muted">no_thumbnail</span>
          )}
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