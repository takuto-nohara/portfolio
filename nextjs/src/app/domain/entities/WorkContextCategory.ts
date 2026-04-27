export interface WorkContextCategory {
  readonly id: number | null;
  readonly slug: string;
  readonly nameJa: string;
  readonly nameEn: string;
  readonly sortOrder: number;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}