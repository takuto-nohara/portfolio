import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  readonly command: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

/** 画面ヘッダー: コマンド風ラベル + タイトル + 説明、右に主要操作 */
export function AdminPageHeader({ command, title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pb-5">
      <div className="min-w-0">
        <p className="m-0 font-mono text-[13px] tracking-[0.06em] text-link">
          <span className="text-sky">$</span> {command}
        </p>
        <h1 className="mt-1.5 mb-0 font-serif text-[28px] leading-[1.3] font-semibold tracking-[0.05em] sm:text-[30px]">{title}</h1>
        {description ? <p className="mt-1.5 mb-0 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** 管理画面の 1 画面分の外枠 */
export function AdminPage({ children, width = "wide" }: { readonly children: ReactNode; readonly width?: "wide" | "medium" | "narrow" }) {
  const maxWidth = width === "wide" ? "max-w-[1200px]" : width === "medium" ? "max-w-[1100px]" : "max-w-[980px]";
  return <section className={`mx-auto px-4 pt-7 pb-20 sm:px-[clamp(16px,3vw,32px)] ${maxWidth}`}>{children}</section>;
}
