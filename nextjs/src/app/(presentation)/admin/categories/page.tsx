import { requireAdminPageSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";

interface AdminCategoriesPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const session = await requireAdminPageSession("/admin/categories");
  const services = await getAdminServices();
  const { status } = await searchParams;
  const [contextCategories, workList] = await Promise.all([
    services.useCases.getWorkContextCategoryList.execute(),
    services.useCases.getWorkList.execute(),
  ]);

  const workCountByCategoryId = new Map<number, number>();

  for (const work of workList) {
    if (work.contextCategoryId === null) {
      continue;
    }

    workCountByCategoryId.set(work.contextCategoryId, (workCountByCategoryId.get(work.contextCategoryId) ?? 0) + 1);
  }

  return (
    <AdminShell session={session} title={"> 文脈カテゴリ管理"} activePath="categories">
      {status === "created" || status === "updated" || status === "deleted" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {status === "created" ? "文脈カテゴリを作成しました。" : status === "updated" ? "文脈カテゴリを更新しました。" : "文脈カテゴリを削除しました。"}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          文脈カテゴリの保存に失敗しました。入力内容や slug の重複を確認してください。
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_1fr]">
        <section className="rounded-lg border border-border-subtle bg-surface-primary p-6">
          <h2 className="text-base font-semibold text-foreground-primary">新規カテゴリ追加</h2>
          <p className="mt-2 text-sm leading-7 text-foreground-secondary">作品の背景文脈を整理する単位で管理します。slug は URL クエリでも使うため半角英数字とハイフンで統一します。</p>

          <form action="/api/admin/categories" method="post" className="mt-6 space-y-4">
            <div>
              <label htmlFor="slug" className="mb-2 block text-sm font-medium text-foreground-primary">slug</label>
              <input id="slug" name="slug" type="text" required placeholder="personal-project" className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary" />
            </div>
            <div>
              <label htmlFor="name_ja" className="mb-2 block text-sm font-medium text-foreground-primary">日本語ラベル</label>
              <input id="name_ja" name="name_ja" type="text" required placeholder="個人制作" className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary" />
            </div>
            <div>
              <label htmlFor="name_en" className="mb-2 block text-sm font-medium text-foreground-primary">英語ラベル</label>
              <input id="name_en" name="name_en" type="text" required placeholder="Personal Project" className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary" />
            </div>
            <div>
              <label htmlFor="sort_order" className="mb-2 block text-sm font-medium text-foreground-primary">表示順</label>
              <input id="sort_order" name="sort_order" type="number" defaultValue={contextCategories.length * 10 + 10} className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary" />
            </div>
            <button type="submit" className="rounded bg-accent-primary px-6 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary">
              追加する
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border-subtle bg-surface-primary p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground-primary">登録済みカテゴリ</h2>
              <p className="mt-2 text-sm text-foreground-secondary">各行で名称・表示順を更新できます。削除すると紐づく作品は未設定に戻ります。</p>
            </div>
            <p className="text-sm text-foreground-secondary">{`件数: ${contextCategories.length}`}</p>
          </div>

          <div className="space-y-4">
            {contextCategories.length > 0 ? (
              contextCategories.map((contextCategory) => (
                <div key={contextCategory.id} className="rounded-lg border border-border-subtle bg-surface-secondary p-4">
                  <form action={`/api/admin/categories/${contextCategory.id}`} method="post" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_auto] lg:items-end">
                    <input type="hidden" name="intent" value="update" />
                    <div>
                      <label htmlFor={`slug-${contextCategory.id}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground-secondary">slug</label>
                      <input id={`slug-${contextCategory.id}`} name="slug" type="text" defaultValue={contextCategory.slug} required className="w-full rounded border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-foreground-primary" />
                    </div>
                    <div>
                      <label htmlFor={`name-ja-${contextCategory.id}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground-secondary">日本語</label>
                      <input id={`name-ja-${contextCategory.id}`} name="name_ja" type="text" defaultValue={contextCategory.nameJa} required className="w-full rounded border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-foreground-primary" />
                    </div>
                    <div>
                      <label htmlFor={`name-en-${contextCategory.id}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground-secondary">English</label>
                      <input id={`name-en-${contextCategory.id}`} name="name_en" type="text" defaultValue={contextCategory.nameEn} required className="w-full rounded border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-foreground-primary" />
                    </div>
                    <div>
                      <label htmlFor={`sort-order-${contextCategory.id}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground-secondary">Sort</label>
                      <input id={`sort-order-${contextCategory.id}`} name="sort_order" type="number" defaultValue={contextCategory.sortOrder} className="w-full rounded border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-foreground-primary" />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xs text-foreground-muted">{`作品 ${workCountByCategoryId.get(contextCategory.id ?? -1) ?? 0} 件`}</span>
                      <button type="submit" className="rounded border border-border-subtle px-4 py-2 text-sm font-medium text-foreground-primary transition-colors hover:border-accent-primary hover:text-accent-primary">
                        更新
                      </button>
                    </div>
                  </form>

                  <form action={`/api/admin/categories/${contextCategory.id}`} method="post" className="mt-3 flex justify-end">
                    <input type="hidden" name="intent" value="delete" />
                    <button type="submit" className="text-xs text-red-500 transition-colors hover:text-red-700">
                      削除
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-border-subtle px-4 py-10 text-center text-sm text-foreground-muted">
                文脈カテゴリはまだ登録されていません。
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}