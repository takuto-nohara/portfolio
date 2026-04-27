import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";
import { AdminWorkForm } from "@/presentation/components/admin/AdminWorkForm";

export const dynamic = "force-dynamic";

export default async function AdminWorkCreatePage() {
  const session = await requireAdminPageSession("/admin/works/create");
  const services = await getAdminServices();
  const contextCategories = await services.useCases.getWorkContextCategoryList.execute();

  return (
    <AdminShell session={session} title={"> 新規作品作成"} activePath="works">
      <AdminWorkForm mode="create" contextCategories={contextCategories} />
    </AdminShell>
  );
}