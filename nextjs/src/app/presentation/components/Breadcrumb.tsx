import Link from "next/link";

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

interface BreadcrumbProps {
  readonly items: readonly BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="パンくず" className="text-sm text-foreground-secondary">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-accent-primary focus-visible:outline-none">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-foreground-primary" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true" className="text-foreground-muted">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}