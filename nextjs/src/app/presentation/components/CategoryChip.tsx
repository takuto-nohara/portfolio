import Link from "next/link";

interface CategoryChipProps {
  readonly labelJa: string;
  readonly labelEn: string;
  readonly href?: string;
  readonly active?: boolean;
}

function CategoryChipContent({ labelJa, labelEn }: Pick<CategoryChipProps, "labelJa" | "labelEn">) {
  return (
    <span className="flex items-center gap-2">
      <span>{labelJa}</span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-current/70" lang="en">
        {labelEn}
      </span>
    </span>
  );
}

export function CategoryChip({ labelJa, labelEn, href, active = false }: CategoryChipProps) {
  const className = active ? "chip-link-active" : "chip-link";

  if (href) {
    return (
      <Link href={href} className={className}>
        <CategoryChipContent labelJa={labelJa} labelEn={labelEn} />
      </Link>
    );
  }

  return (
    <span className="chip-label">
      <CategoryChipContent labelJa={labelJa} labelEn={labelEn} />
    </span>
  );
}