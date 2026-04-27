import Image from "next/image";
import Link from "next/link";

import { getMediumCategoryDefinition, type Work } from "@/domain/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

import { CategoryChip } from "./CategoryChip";
import { TechTag } from "./TechTag";

interface WorkCardProps {
  readonly work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  const thumbnailUrl = resolveWorkAssetUrl(work.thumbnail);
  const href = work.id === null ? "/works" : `/works/${work.id}`;
  const category = getMediumCategoryDefinition(work.category);
  const techStack = work.techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);
  const visibleTechStack = techStack.slice(0, 3);
  const remainingTechCount = techStack.length - visibleTechStack.length;

  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-primary shadow-[0_18px_50px_-28px_rgba(12,74,110,0.24)] transition-colors hover:border-accent-primary">
        <div className="relative flex aspect-video items-center justify-center bg-border-subtle">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={work.title}
              fill
              className="object-contain"
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <span className="text-xs text-foreground-muted">no_thumbnail</span>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <CategoryChip labelJa={category.nameJa} labelEn={category.nameEn} />
            {work.contextCategoryNameJa && work.contextCategoryNameEn ? (
              <CategoryChip labelJa={work.contextCategoryNameJa} labelEn={work.contextCategoryNameEn} />
            ) : null}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground-primary transition-colors group-hover:text-accent-primary">
            {work.title}
          </h3>
          {work.publishedAt ? <p className="mt-2 text-xs text-foreground-muted">{`公開: ${work.publishedAt}`}</p> : null}
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-foreground-secondary">{work.description}</p>
          {visibleTechStack.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="使用技術">
              {visibleTechStack.map((tech) => (
                <TechTag key={tech} tone="soft">
                  {tech}
                </TechTag>
              ))}
              {remainingTechCount > 0 ? <TechTag tone="soft">{`+${remainingTechCount}`}</TechTag> : null}
            </ul>
          ) : null}
        </div>
      </div>
    </Link>
  );
}