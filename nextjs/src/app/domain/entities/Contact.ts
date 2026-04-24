export interface Contact {
  readonly id: number | null;
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}