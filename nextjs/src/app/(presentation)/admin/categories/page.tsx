import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminCategoryTable } from "@/presentation/components/admin/categories/AdminCategoryTable";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminToast } from "@/presentation/components/admin/AdminToast";

interface AdminCategoriesPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const metadata = { title: "文脈カテゴリ" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  await requireAdminPageSession("/admin/categories");
  const services = await getAdminServices();
  const { status } = await searchParams;
  const [contextCategories, workList] = await Promise.all([services.useCases.getWorkContextCategoryList.execute(), services.useCases.getWorkList.execute()]);

  const rows = [...contextCategories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({ category, workCount: workList.filter((work) => work.contextCategoryId === category.id).length }));
  const maxSortOrder = contextCategories.reduce((max, category) => Math.max(max, category.sortOrder), 0);

  return (
    <AdminPage width="narrow">
      <AdminToast
        status={status}
        messages={{
          created: { message: "文脈カテゴリを追加しました。" },
          updated: { message: "文脈カテゴリを更新しました。" },
          deleted: { message: "文脈カテゴリを削除しました。" },
          error: { message: "保存に失敗しました。入力内容や slug の重複を確認してください。", tone: "error" },
        }}
      />
      <AdminCategoryTable rows={rows} nextSortOrder={maxSortOrder + 10} unassignedCount={workList.filter((work) => work.contextCategoryId === null).length} />
    </AdminPage>
  );
}
