import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminWorkForm } from "@/presentation/components/admin/AdminWorkForm";

export const dynamic = "force-dynamic";

export default async function AdminWorkCreatePage() {
  await requireAdminPageSession("/admin/works/create");
  const services = await getAdminServices();
  const contextCategories = await services.useCases.getWorkContextCategoryList.execute();

  return (
    <AdminPage>
      <AdminWorkForm mode="create" contextCategories={contextCategories} />
    </AdminPage>
  );
}