import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminSettingsForm } from "@/presentation/components/admin/AdminSettingsForm";

interface AdminSettingsPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  await requireAdminPageSession("/admin/settings");
  const services = await getAdminServices();
  const [settings, token] = await Promise.all([
    services.useCases.getSettings.execute(),
    services.repositories.oAuthTokenRepository.findByProvider("google"),
  ]);
  const { status } = await searchParams;

  return (
    <AdminPage>
      <AdminSettingsForm settings={settings} token={token} status={status} />
    </AdminPage>
  );
}