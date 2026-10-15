import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@worker/lib/auth/admin";
import { AdminLoginForm } from "@/presentation/components/admin/AdminLoginForm";

export const metadata = { title: "ログイン", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin/works");
  }

  return (
    <main className="site-grid grid min-h-dvh place-items-center bg-paper p-6 text-sm text-ink">
      <AdminLoginForm />
    </main>
  );
}