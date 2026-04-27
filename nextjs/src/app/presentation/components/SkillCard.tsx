import { TechTag } from "./TechTag";

interface SkillCardProps {
  readonly titleJa: string;
  readonly titleEn: string;
  readonly items: readonly string[];
}

export function SkillCard({ titleJa, titleEn, items }: SkillCardProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-6 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.24)]">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent-primary">{titleEn}</p>
      <h3 className="mt-3 text-lg font-semibold text-foreground-primary">{titleJa}</h3>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={titleJa}>
        {items.map((item) => (
          <TechTag key={item}>{item}</TechTag>
        ))}
      </ul>
    </section>
  );
}