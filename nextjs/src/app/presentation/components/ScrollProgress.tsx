"use client";

import { useEffect, useState } from "react";

/** ヘッダー下端の読了プログレスバー */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };

    const onScroll = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-[-1px] left-0 h-0.5 bg-sky shadow-[0_0_8px_rgba(14,165,233,0.6)] transition-[width] duration-100 ease-linear"
      style={{ width: `${progress}%` }}
    />
  );
}
