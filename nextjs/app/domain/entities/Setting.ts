export interface Setting {
  readonly key: string;
  readonly value: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

export interface PublicSettings {
  readonly githubUrl: string | null;
  readonly contactEmail: string | null;
}