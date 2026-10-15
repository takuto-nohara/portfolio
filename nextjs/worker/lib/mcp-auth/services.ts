import { getCloudflareContext } from "@opennextjs/cloudflare";

import { D1UserRepository } from "@/infrastructure/publicApi";
import { isAdminEmail } from "@worker/lib/auth/session";

import { createApiTokenService } from "./api-token.service";
import { D1ApiTokenRepository } from "./d1-api-token.repository";
import { D1OauthClientRepository, D1OauthCodeRepository, D1OauthRefreshTokenRepository } from "./d1-oauth.repository";
import { createOauthService } from "./oauth.service";
import type { McpUserLookup } from "./types";

/** MCP の認証まわり（トークン・OAuth）を D1 につないで組み立てる */
export async function getMcpAuthServices() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("DB binding is not configured.");
  }

  const userRepository = new D1UserRepository(env.DB);
  const users: McpUserLookup = {
    async findAdmin(userId) {
      const user = await userRepository.findById(userId);

      if (!user || !(await isAdminEmail(user.email))) {
        return null;
      }

      return { id: user.id, name: user.name, email: user.email };
    },
  };
  const tokens = new D1ApiTokenRepository(env.DB);
  const refreshTokens = new D1OauthRefreshTokenRepository(env.DB);

  return {
    apiTokens: createApiTokenService({
      tokens,
      users,
      refreshTokens: {
        async findFamilyByAccessTokenId(accessTokenId) {
          return refreshTokens.findByAccessTokenId(accessTokenId);
        },
        deleteFamily: (familyId) => refreshTokens.deleteFamily(familyId),
        listLiveAccessTokenIds: (userId, now) => refreshTokens.listLiveAccessTokenIds(userId, now),
      },
    }),
    oauth: createOauthService({
      clients: new D1OauthClientRepository(env.DB),
      codes: new D1OauthCodeRepository(env.DB),
      refreshTokens,
      tokens,
    }),
    users,
  };
}
