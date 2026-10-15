import type { PropsWithChildren } from "react";

import { getCurrentAdminSession } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { AdminShell } from "@/presentation/components/admin/AdminShell";

export const metadata = {
  title: { default: "管理画面", template: "%s | 管理画面" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await getCurrentAdminSession();

  // 未ログイン時は各ページの requireAdminPageSession がログイン画面へリダイレクトする
  if (!session) {
    return children;
  }

  const services = await getAdminServices();
  const [works, categories, contacts] = await Promise.all([
    services.useCases.getWorkList.execute(),
    services.useCases.getWorkContextCategoryList.execute(),
    services.useCases.getContactList.execute(),
  ]);

  return (
    <AdminShell session={session} counts={{ works: works.length, categories: categories.length, contacts: contacts.length }}>
      {children}
    </AdminShell>
  );
}
