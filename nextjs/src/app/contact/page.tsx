import { ContactForm } from "@/presentation/components/contact/ContactForm";
import { SiteShell } from "@/presentation/components/SiteShell";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings}>
      <section className="bg-surface-secondary px-6 py-12 text-center sm:px-20 sm:py-20">
        <h1 className="text-[40px] font-bold text-foreground-primary">{"> Get in Touch"}</h1>
      </section>

      <section className="bg-surface-primary px-6 py-10 sm:px-20 sm:py-16">
        <div className="mx-auto max-w-xl">
          <ContactForm />
        </div>
      </section>
    </SiteShell>
  );
}