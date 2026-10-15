import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminToast } from "@/presentation/components/admin/AdminToast";
import { AdminWorkForm } from "@/presentation/components/admin/works/AdminWorkForm";

interface AdminWorkCreatePageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const metadata = { title: "新しい作品" };
export const dynamic = "force-dynamic";

export default async function AdminWorkCreatePage({ searchParams }: AdminWorkCreatePageProps) {
  await requireAdminPageSession("/admin/works/create");
  const services = await getAdminServices();
  const contextCategories = await services.useCases.getWorkContextCategoryList.execute();
  const { status } = await searchParams;

  return (
    <AdminPage>
      <AdminToast status={status} messages={{ error: { message: "保存に失敗しました。必須項目を確認してください。", tone: "error" } }} />
      <AdminWorkForm contextCategories={contextCategories} />
    </AdminPage>
  );
}
