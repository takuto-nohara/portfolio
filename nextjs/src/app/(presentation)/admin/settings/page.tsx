import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getRequestOrigin } from "@worker/lib/api/origin";
import { getAdminServices } from "@worker/lib/api/services";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { AdminMcpPanel } from "@/presentation/components/admin/AdminMcpPanel";
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
  const session = await requireAdminPageSession("/admin/settings");
  const services = await getAdminServices();
  const { apiTokens } = await getMcpAuthServices();
  const [{ values, googleLinkedEmail }, tokens, origin] = await Promise.all([
    services.admin.settings.get(),
    apiTokens.list(session.userId),
    getRequestOrigin(),
  ]);
  const { status } = await searchParams;

  return (
    <AdminPage width="narrow">
      <AdminToast
        status={status}
        messages={{
          saved: { message: "設定を保存しました。" },
          "oauth-success": { message: "Google アカウントの連携が完了しました。" },
          "oauth-error": { message: "Google アカウントの連携に失敗しました。", tone: "error" },
          "token-revoked": { message: "トークンを失効しました。" },
          error: { message: "保存に失敗しました。入力内容を確認してください。", tone: "error" },
        }}
      />
      <AdminPageHeader command="config --site" title="サイト設定" description="フッターのリンクと、お問い合わせメールの送信方法を設定します。" />
      <AdminSettingsForm
        connectedEmail={googleLinkedEmail}
        values={{
          github_url: values.github_url ?? "",
          contact_email: values.contact_email ?? "",
          gmail_from_email: values.gmail_from_email ?? "",
          gmail_sender_name: values.gmail_sender_name ?? "",
          gmail_subject_prefix: values.gmail_subject_prefix ?? "",
        }}
      />
      <AdminMcpPanel endpoint={`${origin}/api/mcp`} tokens={tokens} />
    </AdminPage>
  );
}
