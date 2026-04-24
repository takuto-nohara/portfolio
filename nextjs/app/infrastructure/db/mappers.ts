import type {
  Contact,
  OAuthToken,
  Setting,
  User,
  Work,
  WorkImage,
} from "@/domain/publicApi";

export interface ContactRow {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface OAuthTokenRow {
  readonly provider: "google";
  readonly email: string | null;
  readonly access_token: string;
  readonly refresh_token: string | null;
  readonly expires_at: string | null;
  readonly scope: string | null;
  readonly token_type: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface SettingRow {
  readonly key: string;
  readonly value: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface UserRow {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface WorkImageRow {
  readonly id: number;
  readonly work_id: number;
  readonly image_path: string;
  readonly caption: string | null;
  readonly sort_order: number;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface WorkRow {
  readonly id: number;
  readonly title: string;
  readonly category: Work["category"];
  readonly description: string;
  readonly tech_stack: string;
  readonly thumbnail: string | null;
  readonly url: string | null;
  readonly github_url: string | null;
  readonly published_at: string | null;
  readonly is_featured: number;
  readonly sort_order: number;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export function mapContactRow(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOAuthTokenRow(row: OAuthTokenRow): OAuthToken {
  return {
    provider: row.provider,
    email: row.email,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scope: row.scope,
    tokenType: row.token_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSettingRow(row: SettingRow): Setting {
  return {
    key: row.key,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWorkImageRow(row: WorkImageRow): WorkImage {
  return {
    id: row.id,
    workId: row.work_id,
    imagePath: row.image_path,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWorkRow(row: WorkRow, images: readonly WorkImage[]): Work {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    techStack: row.tech_stack,
    thumbnail: row.thumbnail,
    url: row.url,
    githubUrl: row.github_url,
    publishedAt: row.published_at,
    isFeatured: row.is_featured === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
  };
}