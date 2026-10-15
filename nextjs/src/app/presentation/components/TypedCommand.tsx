"use client";

import { useEffect, useState } from "react";

interface TypedCommandProps {
  readonly text: string;
}

const TYPE_INTERVAL_MS = 34;

/** ターミナル風にコマンドを 1 文字ずつ表示する（視覚演出のみ。読み上げ用テキストは別途 sr-only で出す） */
export function TypedCommand({ text }: TypedCommandProps) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frameId = window.requestAnimationFrame(() => setLength(text.length));
      return () => window.cancelAnimationFrame(frameId);
    }

    const intervalId = window.setInterval(() => {
      setLength((current) => {
        if (current >= text.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, TYPE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [text]);

  const isTyping = length < text.length;

  return (
    <p aria-hidden="true" className="flex min-h-[1.5em] items-center font-mono text-[13px] leading-normal tracking-[0.04em] text-link">
      <span>{text.slice(0, length)}</span>
      <span className={`terminal-cursor ${isTyping ? "" : "is-idle"}`} />
    </p>
  );
}
