import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { D1UserRepository } from "@/infrastructure/publicApi";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionMaxAge,
  isAdminEmail,
} from "@worker/lib/auth/session";

interface LoginRequestBody {
  readonly email?: unknown;
  readonly password?: unknown;
  readonly remember?: unknown;
  readonly redirectTo?: unknown;
}

function isSafeRedirectTarget(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/admin");
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequestBody;

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください。" }, { status: 400 });
    }

    const email = body.email.trim();
    const password = body.password;
    const remember = body.remember === true;
    const redirectTo = isSafeRedirectTarget(body.redirectTo) ? body.redirectTo : "/admin/works";

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください。" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const userRepository = new D1UserRepository(env.DB);
    const user = await userRepository.findByEmail(email);

    if (!user || !(await isAdminEmail(user.email))) {
      return NextResponse.json({ error: "認証情報が正しくありません。" }, { status: 401 });
    }

    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "認証情報が正しくありません。" }, { status: 401 });
    }

    const token = await createAdminSessionToken(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      remember,
    );

    const response = NextResponse.json({ redirectTo });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
      path: "/",
      maxAge: getAdminSessionMaxAge(remember),
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ログインに失敗しました。" }, { status: 500 });
  }
}