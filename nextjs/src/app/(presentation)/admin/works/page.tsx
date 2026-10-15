import Link from "next/link";

import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminIcon } from "@/presentation/components/admin/AdminIcon";
import { AdminPage, AdminPageHeader } from "@/presentation/components/admin/AdminPageHeader";
import { AdminToast } from "@/presentation/components/admin/AdminToast";
import { adminPrimaryButton } from "@/presentation/components/admin/adminStyles";
import { AdminWorkList } from "@/presentation/components/admin/works/AdminWorkList";

interface AdminWorksPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const metadata = { title: "作品" };
export const dynamic = "force-dynamic";

export default async function AdminWorksPage({ searchParams }: AdminWorksPageProps) {
  await requireAdminPageSession("/admin/works");
  const services = await getAdminServices();
  const [works, contextCategories] = await Promise.all([services.useCases.getWorkList.execute(), services.useCases.getWorkContextCategoryList.execute()]);
  const { status } = await searchParams;

  return (
    <AdminPage>
      <AdminToast
        status={status}
        messages={{
          created: { message: "作品を作成しました。" },
          updated: { message: "作品を更新しました。" },
          deleted: { message: "作品を削除しました。" },
          featured: { message: "トップに掲載しました。" },
          unfeatured: { message: "トップ掲載を外しました。" },
          error: { message: "操作に失敗しました。時間を置いて再度お試しください。", tone: "error" },
        }}
      />
      <AdminPageHeader
        command="ls works --all"
        title="作品"
        description="公開サイトの「作品一覧」に表示される順で並んでいます。行を選ぶと内容を確認できます。"
        actions={
          <Link href="/admin/works/create" className={adminPrimaryButton}>
            <AdminIcon name="plus" />
            新しい作品
          </Link>
        }
      />
      <AdminWorkList works={works} contextCategories={contextCategories} />
    </AdminPage>
  );
}
