import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@worker/lib/auth/admin";
import { isSafeRedirectTarget } from "@worker/lib/auth/redirect";
import { AdminLoginForm } from "@/presentation/components/admin/AdminLoginForm";

export const metadata = { title: "ログイン", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface LoginPageProps {
  readonly searchParams: Promise<{ readonly redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentAdminSession();

  if (session) {
    const { redirectTo } = await searchParams;
    redirect(isSafeRedirectTarget(redirectTo) ? redirectTo : "/admin/works");
  }

  return (
    <main className="site-grid grid min-h-dvh place-items-center bg-paper p-6 text-sm text-ink">
      <AdminLoginForm />
    </main>
  );
}