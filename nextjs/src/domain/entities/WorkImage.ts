export interface WorkImage {
  readonly id: number | null;
  readonly workId: number;
  readonly imagePath: string;
  readonly caption: string | null;
  readonly sortOrder: number;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}