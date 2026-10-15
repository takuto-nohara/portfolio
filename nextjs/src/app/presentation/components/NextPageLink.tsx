import Link from "next/link";

interface NextPageLinkProps {
  readonly href: string;
  readonly label: string;
}

/** ページ末尾の「次は〇〇へ」導線 */
export function NextPageLink({ href, label }: NextPageLinkProps) {
  return (
    <Link
      href={href}
      data-reveal
      className="site-container mt-[clamp(48px,8vh,96px)] block border-t border-line-strong py-[clamp(36px,6vh,64px)] text-ink transition-[color,transform,background-color] duration-500 ease-out-expo hover:translate-x-2.5 hover:bg-sky-soft/30 hover:text-link"
    >
      <p className="mono-label">
        <span className="text-sky">$</span> cd {href}
      </p>
      <div className="mt-3 flex items-center justify-between gap-6">
        <span className="heading-display text-[clamp(26px,3.4vw,44px)] leading-[1.35]">{label}</span>
        <span aria-hidden="true" className="text-[clamp(28px,3vw,40px)] leading-none">
          →
        </span>
      </div>
    </Link>
  );
}
