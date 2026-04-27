import Link from "next/link";

import { ContactForm } from "@/presentation/components/contact/ContactForm";
import { ExternalLink } from "@/presentation/components/ExternalLink";
import { PageHeader } from "@/presentation/components/PageHeader";
import { SiteShell } from "@/presentation/components/SiteShell";
import { getSiteSettings } from "@worker/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings} currentPath="/contact">
      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            titleJa="連絡先"
            titleEn="Contact"
            lead="このページでは、お問い合わせフォームと直接連絡先を確認できます。採用や制作に関するご相談は、フォームまたはメールからご連絡ください。"
            align="center"
          />
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="rounded-3xl border border-border-subtle bg-surface-secondary p-6 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.18)] sm:p-8">
            <ContactForm />
          </div>

          <aside className="rounded-3xl border border-border-subtle bg-surface-primary p-6 shadow-[0_18px_50px_-28px_rgba(12,74,110,0.18)] sm:p-8">
            <h2 className="text-lg font-semibold text-foreground-primary">直接連絡する</h2>
            <p className="mt-4 text-sm leading-7 text-foreground-secondary">
              フォーム送信後のやりとりを素早く進めたい場合は、メールまたは GitHub からも連絡できます。
            </p>
            <div className="mt-6 space-y-4 text-sm text-foreground-secondary">
              <div>
                <p className="font-medium text-foreground-primary">Email</p>
                {settings.contactEmail ? (
                  <a href={`mailto:${settings.contactEmail}`} className="mt-1 inline-flex text-accent-primary transition-colors hover:text-accent-secondary">
                    {settings.contactEmail}
                  </a>
                ) : (
                  <p className="mt-1 text-foreground-muted">設定準備中</p>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground-primary">GitHub</p>
                {settings.githubUrl ? (
                  <ExternalLink
                    href={settings.githubUrl}
                    className="mt-1 inline-flex text-accent-primary transition-colors hover:text-accent-secondary"
                  >
                    プロフィールを見る / Visit GitHub
                  </ExternalLink>
                ) : (
                  <p className="mt-1 text-foreground-muted">設定準備中</p>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground-primary">案内</p>
                <p className="mt-1 leading-7">まず実績を確認したい場合は、<Link href="/works" className="text-accent-primary hover:text-accent-secondary">作品一覧</Link> からご覧ください。</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}