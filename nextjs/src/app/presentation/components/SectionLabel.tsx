import type { ReactNode } from "react";

interface SectionLabelProps {
  /** "//" はセクション番号、"$" はページのコマンド */
  readonly prefix: "//" | "$";
  readonly children: ReactNode;
  readonly className?: string;
}

/** 見出し上のターミナル風ラベル（例: "// 01  works --featured"） */
export function SectionLabel({ prefix, children, className = "" }: SectionLabelProps) {
  return (
    <p data-reveal="type" className={`mono-label ${className}`}>
      <span className="text-sky">{prefix}</span> {children}
    </p>
  );
}
