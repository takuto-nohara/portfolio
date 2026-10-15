import { NextRequest } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { authorizeParams, consentQuery, readForm, redirectTo, withParams } from "@worker/lib/mcp-auth/oauth-http";

function errorPage(message: string): Response {
  return new Response(message, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

/** 認可の要求。検査して同意画面へ送る（ログインしていなければ同意画面がログインへ回す） */
export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const params = authorizeParams(url.searchParams);
  const { oauth } = await getMcpAuthServices();
  const prepared = await oauth.prepareAuthorization(params, url.origin);

  switch (prepared.status) {
    case "ok":
      return redirectTo(`${url.origin}/oauth/consent?${consentQuery(params)}`);
    case "invalid_client":
      return errorPage(prepared.message);
    case "redirect_error":
      return redirectTo(withParams(prepared.redirectUri, { error: prepared.error, error_description: prepared.description, state: prepared.state }));
  }
}

/** 同意画面のフォーム（許可 / 拒否）。許可なら認可コードを作って戻り先へ送る */
export async function POST(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin !== null && origin !== url.origin) {
    // 同意はこのサイトの画面からだけ受ける（ほかのサイトのフォームから送らせない）
    return new Response("この Origin からは同意を送れません。", { status: 403 });
  }

  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return new Response("ログインしてください。", { status: 401 });
  }

  const form = await readForm(request);
  const { oauth } = await getMcpAuthServices();
  const prepared = await oauth.prepareAuthorization(authorizeParams(form), url.origin);

  if (prepared.status === "invalid_client") {
    return errorPage(prepared.message);
  }

  if (prepared.status === "redirect_error") {
    return redirectTo(withParams(prepared.redirectUri, { error: prepared.error, error_description: prepared.description, state: prepared.state }));
  }

  if (form.decision !== "allow") {
    return redirectTo(withParams(prepared.request.redirectUri, { error: "access_denied", error_description: "利用者が許可しませんでした。", state: prepared.request.state }));
  }

  const code = await oauth.issueCode(session.userId, prepared.request);
  return redirectTo(withParams(prepared.request.redirectUri, { code, state: prepared.request.state }));
}
