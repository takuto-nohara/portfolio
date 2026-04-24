/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    // D1 database binding
    readonly DB: D1Database;

    // R2 storage bindings
    readonly R2_BUCKET: R2Bucket;
    readonly NEXT_INC_CACHE_R2_BUCKET: R2Bucket;

    // Static assets binding (OpenNext)
    readonly ASSETS: Fetcher;

    // Service binding (self-reference for OpenNext)
    readonly WORKER_SELF_REFERENCE: Fetcher;

    // Google OAuth credentials (required)
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;

    // Session security (optional - defaults provided for dev)
    readonly ADMIN_SESSION_SECRET?: string;
    readonly ADMIN_EMAILS?: string;

    // Optional overrides
    readonly R2_PUBLIC_BASE_URL?: string;
    readonly GOOGLE_OAUTH_SCOPES?: string;
  }
}

export {};
