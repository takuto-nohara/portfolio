import { redirect } from "next/navigation";

import { getRequestOrigin } from "@worker/lib/api/origin";
import { getCurrentAdminSession } from "@worker/lib/auth/admin";
import { authorizeParams, consentQuery } from "@worker/lib/mcp-auth/oauth-http";
import { SCOPE_DESCRIPTIONS } from "@worker/lib/mcp-auth/oauth-params";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import type { ApiScope } from "@worker/lib/mcp-auth/types";
import { OAuthConsentCard } from "@/presentation/components/admin/OAuthConsentCard";

interface OAuthConsentPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "AI ツールの接続", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function firstValues(params: Record<string, string | string[] | undefined>): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
}

/** MCP の OAuth 同意画面。管理者がログインした状態で、AI ツールに管理操作を許すかを選ぶ */
export default async function OAuthConsentPage({ searchParams }: OAuthConsentPageProps) {
  const params = authorizeParams(firstValues(await searchParams));
  const query = consentQuery(params);
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/oauth/consent?${query}`)}`);
  }

  const { oauth } = await getMcpAuthServices();
  const prepared = await oauth.prepareAuthorization(params, await getRequestOrigin());

  return (
    <main className="site-grid grid min-h-dvh place-items-center bg-paper p-6 text-sm text-ink">
      {prepared.status === "ok" ? (
        <OAuthConsentCard
          clientName={prepared.request.clientName}
          redirectHost={new URL(prepared.request.redirectUri).host}
          accountEmail={session.email}
          scopes={prepared.request.scope.split(" ").map((name) => ({ name, description: SCOPE_DESCRIPTIONS[name as ApiScope] }))}
          fields={params}
        />
      ) : (
        <OAuthConsentCard error={prepared.status === "invalid_client" ? prepared.message : prepared.description} />
      )}
    </main>
  );
}
