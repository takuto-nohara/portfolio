import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";

interface AdminContactsPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
  const session = await requireAdminPageSession("/admin/contacts");
  const services = await getAdminServices();
  const contacts = await services.useCases.getContactList.execute();
  const { status } = await searchParams;

  return (
    <AdminShell session={session} title={"> お問い合わせ管理"} activePath="contacts">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">{`受信件数: ${contacts.length}`}</p>
      </div>

      {status === "deleted" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">お問い合わせを削除しました。</div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-primary">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-foreground-secondary">
              <th className="px-6 py-3 text-left">名前</th>
              <th className="px-6 py-3 text-left">メール</th>
              <th className="px-6 py-3 text-left">メッセージ</th>
              <th className="px-6 py-3 text-left">受信日時</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={contact.id ?? `${contact.email}-${contact.createdAt}`} className="align-top transition-colors hover:bg-surface-secondary/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground-primary">{contact.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground-secondary">{contact.email}</td>
                  <td className="max-w-md whitespace-pre-wrap px-6 py-4 text-sm text-foreground-secondary">{contact.message}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground-secondary">{contact.createdAt ?? "-"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <form action={`/api/admin/contacts/${contact.id}`} method="post" className="inline">
                      <button type="submit" className="text-xs text-red-500 transition-colors hover:text-red-700">
                        delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-foreground-muted">お問い合わせはまだありません。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}