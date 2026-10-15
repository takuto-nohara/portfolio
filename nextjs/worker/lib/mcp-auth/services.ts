import { getCloudflareContext } from "@opennextjs/cloudflare";

import { D1UserRepository } from "@/infrastructure/publicApi";
import { isAdminEmail } from "@worker/lib/auth/session";

import { createApiTokenService } from "./api-token.service";
import { D1ApiTokenRepository } from "./d1-api-token.repository";
import type { McpUserLookup } from "./types";

/** MCP の認証まわり（トークン）を D1 につないで組み立てる */
export async function getMcpAuthServices() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("DB binding is not configured.");
  }

  const userRepository = new D1UserRepository(env.DB);
  const users: McpUserLookup = {
    async findAdmin(userId) {
      const user = await userRepository.findById(userId);

      if (!user ||!(await isAdminEmail(user.email))) {
        return null;
      }

      return { id: user.id, name: user.name, email: user.email };
    },
  };
  const tokens = new D1ApiTokenRepository(env.DB);

  return {
    apiTokens: createApiTokenService({ tokens, users }),
  };
}
