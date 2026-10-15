import { notFound } from "next/navigation";

import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getWorkDetail } from "@worker/lib/site-data";
import { AdminPage } from "@/presentation/components/admin/AdminPageHeader";
import { AdminToast } from "@/presentation/components/admin/AdminToast";
import { AdminWorkForm } from "@/presentation/components/admin/works/AdminWorkForm";

interface AdminWorkEditPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const metadata = { title: "作品を編集" };
export const dynamic = "force-dynamic";

export default async function AdminWorkEditPage({ params, searchParams }: AdminWorkEditPageProps) {
  const { id } = await params;
  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    notFound();
  }

  await requireAdminPageSession(`/admin/works/${workId}/edit`);
  const services = await getAdminServices();
  const { status } = await searchParams;
  const [work, contextCategories] = await Promise.all([getWorkDetail(workId), services.useCases.getWorkContextCategoryList.execute()]);

  if (!work) {
    notFound();
  }

  return (
    <AdminPage>
      <AdminToast
        status={status}
        messages={{
          "caption-saved": { message: "画像の説明を保存しました。" },
          "image-deleted": { message: "画像を削除しました。" },
          error: { message: "保存に失敗しました。入力内容を確認してください。", tone: "error" },
        }}
      />
      <AdminWorkForm contextCategories={contextCategories} work={work} />
    </AdminPage>
  );
}