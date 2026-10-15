import type { ReactNode } from "react";

interface WorkFormSectionProps {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly description?: string;
  readonly last?: boolean;
  readonly children: ReactNode;
}

/** 作品フォームの 1 セクション（左に番号と見出し、右に入力欄） */
export function WorkFormSection({ id, index, title, description, last = false, children }: WorkFormSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`flex scroll-mt-4 flex-wrap gap-x-6 gap-y-3 py-7 ${last ? "" : "border-b border-line"}`}>
      <div className="max-w-[220px] flex-[1_1_160px]">
        <p className="m-0 font-mono text-xs text-link">{index}</p>
        <h2 id={`${id}-title`} className="mt-1 mb-0 text-[15px] font-bold">
          {title}
        </h2>
        {description ? <p className="mt-1 mb-0 text-xs leading-[1.7] text-ink-muted">{description}</p> : null}
      </div>
      <div className="grid min-w-0 flex-[999_1_320px] gap-[18px]">{children}</div>
    </section>
  );
}

interface FieldProps {
  readonly id?: string;
  readonly label: string;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly hint?: ReactNode;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

/** ラベル + 入力 + 補足 */
export function Field({ id, label, required = false, optional = false, hint, action, children, className = "" }: FieldProps) {
  const labelContent = (
    <>
      {label}
      {required ? <span className="ml-1 font-normal text-red-700">必須</span> : null}
      {optional ? <span className="ml-1 font-normal text-ink-muted">任意</span> : null}
    </>
  );

  return (
    <div className={`grid gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        {id ? (
          <label htmlFor={id} className="text-[13px] font-bold">
            {labelContent}
          </label>
        ) : (
          <span className="text-[13px] font-bold">{labelContent}</span>
        )}
        {action}
      </div>
      {children}
      {hint ? <div className="text-xs leading-relaxed text-ink-muted">{hint}</div> : null}
    </div>
  );
}
