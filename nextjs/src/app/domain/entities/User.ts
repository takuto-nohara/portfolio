export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}