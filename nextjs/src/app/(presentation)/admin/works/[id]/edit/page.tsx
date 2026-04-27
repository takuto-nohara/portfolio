import { notFound } from "next/navigation";

import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getWorkDetail } from "@worker/lib/site-data";
import { AdminShell } from "@/presentation/components/admin/AdminShell";
import { AdminWorkForm } from "@/presentation/components/admin/AdminWorkForm";

interface AdminWorkEditPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminWorkEditPage({ params, searchParams }: AdminWorkEditPageProps) {
  const { id } = await params;
  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    notFound();
  }

  const session = await requireAdminPageSession(`/admin/works/${workId}/edit`);
  const services = await getAdminServices();
  const { status } = await searchParams;
  const [work, contextCategories] = await Promise.all([getWorkDetail(workId), services.useCases.getWorkContextCategoryList.execute()]);

  if (!work) {
    notFound();
  }

  return (
    <AdminShell session={session} title={"> 作品編集"} activePath="works">
      <AdminWorkForm mode="edit" contextCategories={contextCategories} work={work} status={status} />
    </AdminShell>
  );
}