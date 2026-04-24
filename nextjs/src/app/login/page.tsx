import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@/lib/auth/admin";
import { AdminLoginForm } from "@/presentation/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin/works");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-secondary px-6 text-foreground-primary antialiased sm:px-8">
      <AdminLoginForm />
    </main>
  );
}