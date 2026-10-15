/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

const roundButtonClassName =
  "absolute flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-transparent text-white transition-colors hover:bg-sky/25";

/** 作品画像のグリッドと、拡大表示用のライトボックス */
export function WorkGalleryModal({ title, images }: WorkGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isOpen = currentIndex !== null;

  const step = (delta: number) => setCurrentIndex((index) => (index === null ? null : (index + delta + images.length) % images.length));

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCurrentIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length));
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => (index === null ? null : (index + 1) % images.length));
      }
    };

    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [isOpen, images.length]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = currentIndex === null ? null : images[currentIndex];
  const activeImageUrl = activeImage ? resolveWorkAssetUrl(activeImage.imagePath) : null;

  return (
    <>
      <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
        {images.map((image, index) => {
          const imageUrl = resolveWorkAssetUrl(image.imagePath);

          return (
            <button
              key={image.id ?? `${image.imagePath}-${index}`}
              type="button"
              data-reveal="render"
              className="media-frame media-zoom-trigger aspect-[16/10] cursor-zoom-in border-0 p-0"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setCurrentIndex(index);
              }}
              aria-label={`画像 ${index + 1} を拡大表示`}
            >
              {imageUrl ? (
                <img data-img src={imageUrl} alt="" loading="lazy" className="media-zoom absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <span data-scan aria-hidden="true" className="scan-line" />
            </button>
          );
        })}
      </div>

      {isClient && activeImage && activeImageUrl && currentIndex !== null
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="画像の拡大表示"
              className="fixed inset-0 z-[9000] flex animate-[fade_0.25s_ease] items-center justify-center bg-ink/95 p-[clamp(16px,4vw,48px)]"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setCurrentIndex(null);
                }
              }}
            >
              <button ref={closeButtonRef} type="button" onClick={() => setCurrentIndex(null)} aria-label="閉じる" className={`${roundButtonClassName} top-4 right-4 text-[22px]`}>
                ×
              </button>
              {images.length > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="前の画像" className={`${roundButtonClassName} bottom-4 left-4 text-xl sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}>
                    ←
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="次の画像" className={`${roundButtonClassName} right-4 bottom-4 text-xl sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}>
                    →
                  </button>
                </>
              ) : null}
              <figure className="m-0 flex flex-col items-center gap-3">
                <img
                  key={activeImageUrl}
                  src={activeImageUrl}
                  alt={activeImage.caption ?? `${title} の画面 ${currentIndex + 1}`}
                  className="max-h-[min(72vh,800px)] sm:max-h-[min(80vh,800px)] w-auto max-w-[min(100%,1200px)] animate-[rise_0.5s_var(--ease-out)] object-contain"
                />
                {activeImage.caption ? <figcaption className="max-w-[40em] text-center text-sm text-white/85">{activeImage.caption}</figcaption> : null}
              </figure>
              <p className="absolute inset-x-0 bottom-7 text-center font-mono sm:bottom-5 text-[13px] text-white">{`${currentIndex + 1} / ${images.length}`}</p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
