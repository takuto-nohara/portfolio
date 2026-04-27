import type { AnchorHTMLAttributes } from "react";

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  readonly href: string;
}

/**
 * 外部リンク用コンポーネント。
 * - `target="_blank"` / `rel="noopener noreferrer"` を固定
 * - ↗ アイコンをリンクテキストの右に表示（aria-hidden）
 * - スクリーンリーダー向けに「（新しいタブで開きます）」を付加
 */
export function ExternalLink({ href, className, children, ...props }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1.5 inline-block h-3.5 w-3.5 shrink-0 align-middle"
        aria-hidden="true"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  );
}
