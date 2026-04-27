/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { createPortal } from "react-dom";

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
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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

      {isClient && activeImage && activeImageUrl ? createPortal(
        <>
          {/* 背景オーバーレイ（独立した fixed 要素） */}
          <button
            type="button"
            className="fixed inset-0 z-60 bg-surface-primary/90 backdrop-blur-sm"
            aria-label="モーダルを閉じる"
            onClick={() => setCurrentIndex(null)}
          />

          {/* コンテンツエリア（z-[61] で背景の上に確実に表示） */}
          <div className="pointer-events-none fixed inset-0 z-61 flex items-start justify-center overflow-y-auto px-4 py-8 sm:px-8">
            <div className="pointer-events-auto mx-auto w-full max-w-2xl">
              <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface-secondary p-4 shadow-2xl sm:p-5">

                {/* 閉じるボタン（右上） */}
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-primary text-2xl leading-none text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex(null)}
                    aria-label="モーダルを閉じる"
                  >
                    &times;
                  </button>
                </div>

                {/* 画像 + 左右ナビ（sm以上で横並び） */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="hidden shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary sm:block"
                    onClick={() => setCurrentIndex((activeIndex - 1 + images.length) % images.length)}
                    aria-label="前の画像を表示"
                  >
                    &larr;
                  </button>

                  <div className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-border-subtle bg-surface-primary p-3 sm:p-4">
                    <img
                      src={activeImageUrl}
                      alt={`${title} gallery image`}
                      className="max-h-[50vh] w-full object-contain sm:max-h-[55vh]"
                    />
                  </div>

                  <button
                    type="button"
                    className="hidden shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary sm:block"
                    onClick={() => setCurrentIndex((activeIndex + 1) % images.length)}
                    aria-label="次の画像を表示"
                  >
                    &rarr;
                  </button>
                </div>

                {/* モバイル用ナビゲーション（sm未満で表示） */}
                <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-border-subtle bg-surface-primary py-3 text-center text-sm text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex((activeIndex - 1 + images.length) % images.length)}
                    aria-label="前の画像を表示"
                  >
                    &larr; 前へ
                  </button>
                  <span className="shrink-0 text-xs text-foreground-muted">{`${activeIndex + 1} / ${images.length}`}</span>
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-border-subtle bg-surface-primary py-3 text-center text-sm text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
                    onClick={() => setCurrentIndex((activeIndex + 1) % images.length)}
                    aria-label="次の画像を表示"
                  >
                    次へ &rarr;
                  </button>
                </div>

                {/* キャプション + ページ番号（sm以上） */}
                <div className="mt-3 hidden items-start justify-between gap-4 px-1 sm:flex">
                  <p className="min-h-6 text-sm leading-relaxed text-foreground-secondary">
                    {activeImage.caption ?? "説明は未設定です。"}
                  </p>
                  <span className="shrink-0 pt-0.5 text-xs text-foreground-muted">{`${activeIndex + 1} / ${images.length}`}</span>
                </div>

                {/* キャプション（モバイル） */}
                <p className="mt-2 min-h-6 text-sm leading-relaxed text-foreground-secondary sm:hidden">
                  {activeImage.caption ?? "説明は未設定です。"}
                </p>
              </div>
            </div>
          </div>
        </>,
        document.body
      ) : null}
    </>
  );
}

