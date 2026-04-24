import type { User, UserRepository } from "@/domain/publicApi";

import type { D1DatabaseLike } from "./D1Database";
import { mapUserRow, UserRow } from "./mappers";

export class D1UserRepository implements UserRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async findById(id: number): Promise<User | null> {
    const row = await this.database
      .prepare(
        `SELECT id, name, email, password, created_at, updated_at
         FROM users
         WHERE id = ?`,
      )
      .bind(id)
      .first<UserRow>();

    return row ? mapUserRow(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.database
      .prepare(
        `SELECT id, name, email, password, created_at, updated_at
         FROM users
         WHERE lower(email) = lower(?)`,
      )
      .bind(email)
      .first<UserRow>();

    return row ? mapUserRow(row) : null;
  }
}