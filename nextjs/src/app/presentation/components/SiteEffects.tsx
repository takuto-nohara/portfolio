"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PAGE_LEAVE_MS = 240;

/**
 * 公開サイト全体の演出。
 * - [data-reveal] 要素をスクロールに合わせて表示する（rise / render / type の 3 種）
 * - 内部リンク遷移時に main をフェードアウト → 遷移後にフェードイン
 */
export function SiteEffects() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealed = new WeakSet<Element>();
    const timeoutIds: number[] = [];

    const show = (element: HTMLElement, stagger: number) => {
      if (revealed.has(element)) {
        return;
      }

      revealed.add(element);
      element.style.opacity = "";
      const scanLine = element.querySelector<HTMLElement>("[data-scan]");

      if (reduceMotion) {
        scanLine?.style.setProperty("display", "none");
        return;
      }

      const delay = stagger * 90;
      const kind = element.dataset.reveal;

      if (kind === "render") {
        element.style.animation = `render-clip 1.15s var(--ease-out) ${delay}ms both`;
        if (scanLine) {
          scanLine.style.animation = `scan 1.15s var(--ease-out) ${delay}ms both`;
        }
        const image = element.querySelector<HTMLElement>("[data-img]");
        if (image) {
          image.style.animation = `focus-in 1.6s ease ${delay}ms both`;
        }
        return;
      }

      if (kind === "type") {
        const steps = Math.max(8, (element.textContent ?? "").trim().length);
        element.style.animation = `type-in ${Math.min(1.2, steps * 0.035)}s steps(${steps}, end) ${delay}ms both`;
        return;
      }

      element.style.animation = `rise 1.1s var(--ease-out) ${delay}ms both`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target as HTMLElement, 0);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const arm = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      let stagger = 0;

      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (revealed.has(element)) {
          return;
        }

        const rect = element.getBoundingClientRect();

        if (rect.top < viewportHeight && rect.bottom > 0) {
          show(element, stagger);
          stagger += 1;
        } else {
          element.style.opacity = "0";
          observer.observe(element);
        }
      });
    };

    arm();
    // 画像の読み込みなどでレイアウトがずれた場合の取りこぼし対策
    timeoutIds.push(window.setTimeout(arm, 600), window.setTimeout(arm, 1500));

    const main = document.querySelector<HTMLElement>("main[data-site-main]");
    main?.classList.remove("page-leave");
    main?.classList.add("page-enter");

    return () => {
      observer.disconnect();
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [pathname]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (event: MouseEvent) => {
      if (reduceMotion || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      // 同一パス内（絞り込み・ページ内リンク）はフェードさせない
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/") || url.pathname === window.location.pathname) {
        return;
      }

      const main = document.querySelector<HTMLElement>("main[data-site-main]");

      if (!main) {
        return;
      }

      event.preventDefault();
      main.classList.remove("page-enter");
      main.classList.add("page-leave");
      window.setTimeout(() => router.push(`${url.pathname}${url.search}${url.hash}`), PAGE_LEAVE_MS);
    };

    // capture 段階で先に処理し、next/link の遷移を遅延させる
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
