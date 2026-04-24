import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";
import { AdminSettingsForm } from "@/presentation/components/admin/AdminSettingsForm";

interface AdminSettingsPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const session = await requireAdminPageSession("/admin/settings");
  const services = await getAdminServices();
  const [settings, token] = await Promise.all([
    services.useCases.getSettings.execute(),
    services.repositories.oAuthTokenRepository.findByProvider("google"),
  ]);
  const { status } = await searchParams;

  return (
    <AdminShell session={session} title={"> サイト設定"} activePath="settings">
      <AdminSettingsForm settings={settings} token={token} status={status} />
    </AdminShell>
  );
}