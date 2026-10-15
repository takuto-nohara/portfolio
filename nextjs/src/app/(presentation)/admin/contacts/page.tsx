import type { Contact } from "@/domain/publicApi";
import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminToast } from "@/presentation/components/admin/AdminToast";
import { AdminContactList, type AdminContactItem } from "@/presentation/components/admin/contacts/AdminContactList";

interface AdminContactsPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const receivedAtFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** D1 の CURRENT_TIMESTAMP（UTC, "YYYY-MM-DD HH:MM:SS"）を Date にする */
function parseUtcTimestamp(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 一覧表示用に整形する（受信から 7 日以内を「今週」とする） */
function toContactItems(contacts: readonly Contact[]): AdminContactItem[] {
  const now = Date.now();

  return contacts
    .filter((contact): contact is Contact & { id: number } => contact.id !== null)
    .map((contact) => {
      const receivedAt = parseUtcTimestamp(contact.createdAt);
      return {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        receivedAt: receivedAt ? receivedAtFormat.format(receivedAt) : "—",
        group: receivedAt && now - receivedAt.getTime() < WEEK_MS ? "今週" : "それ以前",
      };
    });
}

export const metadata = { title: "お問い合わせ" };
export const dynamic = "force-dynamic";

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
  await requireAdminPageSession("/admin/contacts");
  const services = await getAdminServices();
  const contacts = await services.useCases.getContactList.execute();
  const { status } = await searchParams;
  const items = toContactItems(contacts);

  return (
    <AdminPage width="medium">
      <AdminToast
        status={status}
        messages={{
          deleted: { message: "お問い合わせを削除しました。" },
          error: { message: "削除に失敗しました。時間を置いて再度お試しください。", tone: "error" },
        }}
      />
      <AdminContactList contacts={items} />
    </AdminPage>
  );
}
