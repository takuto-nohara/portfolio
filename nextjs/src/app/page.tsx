import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-primary">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border-subtle/0 bg-surface-primary px-6 backdrop-blur-sm sm:px-20">
        <Link
          href="/"
          className="text-[22px] font-medium tracking-wide text-foreground-primary transition-colors hover:text-accent-primary"
        >
          {"> TN_"}
        </Link>
        <nav className="flex items-center gap-10">
          <Link href="/works" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            works()
          </Link>
          <Link href="/about" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            about()
          </Link>
          <Link href="/contact" className="text-[13px] text-foreground-secondary transition-colors hover:text-accent-primary">
            contact()
          </Link>
        </nav>
      </header>

      <section className="hero-bg relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-6 text-center sm:px-20">
        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-[56px] font-bold leading-tight tracking-tight text-foreground-primary">
            Rendering Ideas
            <br />
            into Reality
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-secondary">
            思考を目に見える形に。アプリ、Web、映像、グラフィック——
            <br />
            あらゆるアウトプットを通じて学びを深めています。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/works"
              className="rounded bg-accent-primary px-8 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary"
            >
              {"> view_all_works"}
            </Link>
            <Link
              href="/contact"
              className="rounded border border-accent-primary px-8 py-3 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary hover:text-surface-primary"
            >
              {"> contact_me"}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-foreground-primary">{"> featured_works"}</h2>
            <Link href="/works" className="text-xs text-accent-primary transition-colors hover:text-accent-secondary">
              {"view_all >"}
            </Link>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-primary px-6 py-12 text-center text-sm text-foreground-muted">
            // featured works will be rendered from D1 in Phase 3
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:gap-16">
          <div className="flex h-48 w-48 items-center justify-center rounded-full border border-border-subtle bg-surface-card shadow-[0_0_0_12px_rgba(14,165,233,0.08)] sm:h-80 sm:w-80">
            <span className="text-xs uppercase tracking-[0.35em] text-foreground-muted">profile</span>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground-primary">{"> about_me"}</h2>
            <p className="mb-6 text-sm leading-relaxed text-foreground-secondary">
              『欲しいものが見当たらない？ならば作ってしまえばいい！』を
              <br />
              モットーに様々なコンテンツの制作を行っています。
            </p>
            <Link href="/about" className="text-sm font-medium text-accent-primary transition-colors hover:text-accent-secondary">
              {"> learn_more"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
