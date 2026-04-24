import { requireAdminPageSession } from "@/lib/auth/admin";
import { AdminShell } from "@/presentation/components/admin/AdminShell";
import { AdminWorkForm } from "@/presentation/components/admin/AdminWorkForm";

export const dynamic = "force-dynamic";

export default async function AdminWorkCreatePage() {
  const session = await requireAdminPageSession("/admin/works/create");

  return (
    <AdminShell session={session} title={"> 新規作品作成"} activePath="works">
      <AdminWorkForm mode="create" />
    </AdminShell>
  );
}