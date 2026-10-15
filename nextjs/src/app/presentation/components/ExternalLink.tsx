import type { AnchorHTMLAttributes } from "react";

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  readonly href: string;
}

/**
 * 外部サービス（GitHub など）へのリンク。
 * - `target="_blank"` / `rel="noopener noreferrer"` を固定
 * - ↗ アイコンをリンクテキストの右に表示（aria-hidden）
 * - ホバー・フォーカス時にツールチップ「新しいタブで開きます」を表示（非表示中はレイアウトに影響させない）
 * - スクリーンリーダー向けに「（新しいタブで開きます）」を付加
 */
export function ExternalLink({ href, className, children, ...props }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`group relative gap-2 ${className ?? ""}`} {...props}>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
      <span className="sr-only">（新しいタブで開きます）</span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2.5 py-1 font-sans text-xs text-white shadow-sm group-hover:block group-focus-visible:block"
      >
        新しいタブで開きます
      </span>
    </a>
  );
}
