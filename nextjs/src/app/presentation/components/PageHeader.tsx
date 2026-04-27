interface PageHeaderProps {
  readonly titleJa: string;
  readonly titleEn: string;
  readonly lead: string;
  readonly align?: "left" | "center";
  readonly variant?: "default" | "hero";
}

export function PageHeader({
  titleJa,
  titleEn,
  lead,
  align = "left",
  variant = "default",
}: PageHeaderProps) {
  const isCenter = align === "center";
  const titleClassName = variant === "hero" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl";

  return (
    <header className={isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-medium tracking-[0.24em] text-accent-primary" lang="en">
        {titleEn}
      </p>
      <h1 className={`mt-3 font-semibold tracking-tight text-foreground-primary ${titleClassName}`}>{titleJa}</h1>
      <p className="mt-5 text-sm leading-7 text-foreground-secondary sm:text-base">{lead}</p>
    </header>
  );
}