import { notFound } from "next/navigation";

import { requireAdminPageSession } from "@/lib/auth/admin";
import { getWorkDetail } from "@/lib/site-data";
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
  const work = await getWorkDetail(workId);
  const { status } = await searchParams;

  if (!work) {
    notFound();
  }

  return (
    <AdminShell session={session} title={"> 作品編集"} activePath="works">
      <AdminWorkForm mode="edit" work={work} status={status} />
    </AdminShell>
  );
}