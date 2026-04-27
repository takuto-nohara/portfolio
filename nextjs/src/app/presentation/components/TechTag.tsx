import type { PropsWithChildren } from "react";

interface TechTagProps extends PropsWithChildren {
  readonly tone?: "neutral" | "soft";
}

export function TechTag({ children, tone = "neutral" }: TechTagProps) {
  const toneClassName = tone === "soft" ? "border-border-subtle/70 text-foreground-muted" : "border-border-subtle text-foreground-secondary";

  return (
    <li className={`chip-label ${toneClassName}`}>
      {children}
    </li>
  );
}