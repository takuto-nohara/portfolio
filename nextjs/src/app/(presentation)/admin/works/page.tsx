import Link from "next/link";

import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";

interface AdminWorksPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminWorksPage({ searchParams }: AdminWorksPageProps) {
  const session = await requireAdminPageSession("/admin/works");
  const services = await getAdminServices();
  const workList = await services.useCases.getWorkList.execute();
  const { status } = await searchParams;

  return (
    <AdminShell session={session} title={"> 制作物管理"} activePath="works">
      {status === "created" || status === "updated" || status === "deleted" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {status === "created" ? "作品を作成しました。" : status === "updated" ? "作品を更新しました。" : "作品を削除しました。"}
        </div>
      ) : null}

      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">{`登録作品数: ${workList.length}`}</p>
        <Link href="/admin/works/create" className="rounded bg-accent-primary px-6 py-2 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary">
          {"> new_work"}
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-primary">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-foreground-secondary">
              <th className="px-6 py-3 text-left">タイトル</th>
              <th className="px-6 py-3 text-left">カテゴリ</th>
              <th className="px-6 py-3 text-left">公開日</th>
              <th className="px-6 py-3 text-left">表示順</th>
              <th className="px-6 py-3 text-left">Featured</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {workList.map((work) => (
              <tr key={work.id ?? work.title} className="transition-colors hover:bg-surface-secondary/50">
                <td className="px-6 py-4 text-sm font-medium text-foreground-primary">{work.title}</td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded bg-surface-card px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-accent-primary">
                    {work.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground-secondary">{work.publishedAt ?? "-"}</td>
                <td className="px-6 py-4 text-sm text-foreground-secondary">{work.sortOrder}</td>
                <td className="px-6 py-4 text-sm">{work.isFeatured ? <span className="text-accent-primary">✓</span> : <span className="text-foreground-muted">-</span>}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/works/${work.id}/edit`} className="text-xs text-accent-primary transition-colors hover:text-accent-secondary">
                      edit
                    </Link>
                    <form action={`/api/admin/works/${work.id}`} method="post" className="inline">
                      <input type="hidden" name="intent" value="delete" />
                      <button type="submit" className="text-xs text-red-500 transition-colors hover:text-red-700">
                        delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}