import Link from "next/link";

import { getSiteSettings } from "@worker/lib/site-data";
import { ContactForm } from "@/presentation/components/contact/ContactForm";
import { ExternalLink } from "@/presentation/components/ExternalLink";
import { SectionLabel } from "@/presentation/components/SectionLabel";
import { SiteShell } from "@/presentation/components/SiteShell";
import { siteSections } from "@/presentation/content/siteContent";

export const metadata = { title: "連絡する" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings} currentPath="/contact">
      <div className="site-container page-pad">
        <SectionLabel prefix="$">mail takuto</SectionLabel>
        <h1 data-reveal className="heading-page mt-4">
          連絡する
        </h1>
        <div className="mt-[clamp(32px,5vh,56px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
          <div data-reveal>
            <p className="leading-[1.9] text-ink-body">{siteSections.contactPageLead}</p>
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="link-underline mt-5 font-mono text-[clamp(17px,2vw,22px)] font-normal">
                {settings.contactEmail}
              </a>
            ) : null}
            <p className="mt-7 text-[15px] leading-[1.8] text-ink-body">
              コードや設計を先に見たい方は{" "}
              {settings.githubUrl ? (
                <ExternalLink href={settings.githubUrl} className="inline-flex items-center font-medium text-link hover:text-link-hover">
                  GitHub
                </ExternalLink>
              ) : (
                "GitHub"
              )}
              、実績は{" "}
              <Link href="/works" className="font-medium text-link hover:text-link-hover">
                作品一覧
              </Link>{" "}
              へ。
            </p>
          </div>
          <ContactForm sentMessage={siteSections.contactSent} />
        </div>
      </div>
    </SiteShell>
  );
}
