"use client";

import { useEffect, useState } from "react";

import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

interface WorkGalleryImage {
  readonly id: number | null;
  readonly imagePath: string;
  readonly caption: string | null;
}

interface WorkGalleryModalProps {
  readonly title: string;
  readonly images: readonly WorkGalleryImage[];
}

export function WorkGalleryModal({ title, images }: WorkGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const activeIndex = currentIndex ?? 0;

  useEffect(() => {
    if (currentIndex === null) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCurrentIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => {
          if (index === null) {
            return null;
          }

          return (index - 1 + images.length) % images.length;
        });
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => {
          if (index === null) {
            return null;
          }

          return (index + 1) % images.length;
        });
      }
    };

    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [currentIndex, images.length]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = currentIndex === null ? null : images[activeIndex];
  const activeImageUrl = activeImage ? resolveWorkAssetUrl(activeImage.imagePath) : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((image, index) => {
          const imageUrl = resolveWorkAssetUrl(image.imagePath);

          return (
            <button
              key={image.id ?? `${image.imagePath}-${index}`}
              type="button"
              className="group aspect-video overflow-hidden rounded-lg border border-border-subtle bg-surface-card text-left transition-transform hover:-translate-y-1 hover:border-accent-primary"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${title} の画像 ${index + 1} を拡大表示`}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${title} gallery image`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-foreground-muted">gallery_image_not_found</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeImage && activeImageUrl ? (
        <div className="fixed inset-0 z-60" aria-hidden="false">
          <button
            type="button"
            className="absolute inset-0 bg-surface-primary/90 backdrop-blur-sm"
            aria-label="モーダルを閉じる"
            onClick={() => setCurrentIndex(null)}
          />
          <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-8">
            <div className="mx-auto w-fit" style={{ maxWidth: "min(60vw, 760px)" }}>
              <div className="inline-flex flex-col items-center rounded-2xl border border-border-subtle bg-surface-secondary p-3 shadow-2xl sm:p-4">
                <div className="mb-3 flex w-full justify-end">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-primary text-2xl leading-none text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex(null)}
                    aria-label="モーダルを閉じる"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex((activeIndex - 1 + images.length) % images.length)}
                    aria-label="前の画像を表示"
                  >
                    &larr;
                  </button>

                  <div className="flex items-center justify-center rounded-xl border border-border-subtle bg-surface-primary px-3 py-3 sm:px-4 sm:py-4">
                    <img
                      src={activeImageUrl}
                      alt={`${title} gallery image`}
                      className="mx-auto block h-auto w-auto object-contain"
                      style={{ maxWidth: "min(46vw, 640px)", maxHeight: "44vh" }}
                    />
                  </div>

                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex((activeIndex + 1) % images.length)}
                    aria-label="次の画像を表示"
                  >
                    &rarr;
                  </button>
                </div>

                <div className="mt-3 flex w-full items-start justify-between gap-4 px-1" style={{ maxWidth: "min(46vw, 640px)" }}>
                  <p className="min-h-6 text-sm leading-relaxed text-foreground-secondary">
                    {activeImage.caption || "説明は未設定です。"}
                  </p>
                  <span className="shrink-0 pt-0.5 text-xs text-foreground-muted">{`${activeIndex + 1} / ${images.length}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}