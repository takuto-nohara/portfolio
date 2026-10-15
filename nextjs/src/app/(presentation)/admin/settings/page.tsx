import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminPage, AdminPageHeader } from "@/presentation/components/admin/AdminPageHeader";
import { AdminSettingsForm } from "@/presentation/components/admin/AdminSettingsForm";
import { AdminToast } from "@/presentation/components/admin/AdminToast";

interface AdminSettingsPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const metadata = { title: "サイト設定" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  await requireAdminPageSession("/admin/settings");
  const services = await getAdminServices();
  const [settings, token] = await Promise.all([services.useCases.getSettings.execute(), services.repositories.oAuthTokenRepository.findByProvider("google")]);
  const { status } = await searchParams;
  const value = (key: string) => settings.find((setting) => setting.key === key)?.value ?? "";

  return (
    <AdminPage width="narrow">
      <AdminToast
        status={status}
        messages={{
          saved: { message: "設定を保存しました。" },
          "oauth-success": { message: "Google アカウントの連携が完了しました。" },
          "oauth-error": { message: "Google アカウントの連携に失敗しました。", tone: "error" },
          error: { message: "保存に失敗しました。入力内容を確認してください。", tone: "error" },
        }}
      />
      <AdminPageHeader command="config --site" title="サイト設定" description="フッターのリンクと、お問い合わせメールの送信方法を設定します。" />
      <AdminSettingsForm
        connectedEmail={token?.email ?? null}
        values={{
          github_url: value("github_url"),
          contact_email: value("contact_email"),
          gmail_from_email: value("gmail_from_email"),
          gmail_sender_name: value("gmail_sender_name"),
          gmail_subject_prefix: value("gmail_subject_prefix"),
        }}
      />
    </AdminPage>
  );
}
