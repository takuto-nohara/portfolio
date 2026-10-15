import Image from "next/image";

import type { Work } from "@/application/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

interface WorkThumbProps {
  readonly work: Pick<Work, "title" | "category" | "thumbnail" | "thumbnailFit">;
  /** aspect-ratio などフレームの寸法を指定するクラス */
  readonly className?: string;
  readonly sizes: string;
  readonly alt?: string;
  readonly priority?: boolean;
}

/**
 * 作品サムネイル。
 * contain 指定（ロゴ・縦長など）の場合は余白を残し、同じ画像をぼかして背景に敷く。
 */
export function WorkThumb({ work, className = "aspect-[16/10]", sizes, alt = "", priority = false }: WorkThumbProps) {
  const src = resolveWorkAssetUrl(work.thumbnail);
  const isCover = work.thumbnailFit === "cover";

  return (
    <div data-reveal="render" className={`media-frame ${className}`}>
      {src ? (
        <>
          <div aria-hidden="true" className="absolute -inset-[10%] opacity-55 blur-[28px] saturate-110">
            <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
          </div>
          <div data-img className={`media-zoom absolute ${isCover ? "inset-0" : "inset-[8%]"}`}>
            <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={isCover ? "object-cover" : "object-contain"} />
          </div>
        </>
      ) : (
        <div data-img role={alt ? "img" : undefined} aria-label={alt || undefined} className="absolute inset-0 flex items-center justify-center font-mono text-xs text-link">
          {work.category === "video" ? "video thumbnail" : "image"}
        </div>
      )}
      <span data-scan aria-hidden="true" className="scan-line" />
    </div>
  );
}
