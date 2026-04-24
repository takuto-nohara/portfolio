import type { D1DatabaseLike, R2BucketLike } from "@/infrastructure/publicApi";

declare global {
  interface CloudflareEnv {
    DB: D1DatabaseLike;
    R2_BUCKET: R2BucketLike;
    GOOGLE_OAUTH_CLIENT_ID?: string;
    GOOGLE_OAUTH_CLIENT_SECRET?: string;
    GOOGLE_OAUTH_REDIRECT_URI?: string;
    GOOGLE_OAUTH_SCOPES?: string;
    GMAIL_FROM_EMAIL?: string;
    GMAIL_SENDER_NAME?: string;
    GMAIL_SUBJECT_PREFIX?: string;
    R2_PUBLIC_BASE_URL?: string;
  }
}

export {};