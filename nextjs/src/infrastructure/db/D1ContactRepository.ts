import type { Contact, ContactRepository } from "@/domain/publicApi";

import { D1DatabaseLike, getLastInsertId, selectAll } from "./D1Database";
import { ContactRow, mapContactRow } from "./mappers";

export class D1ContactRepository implements ContactRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async save(contact: Contact): Promise<Contact> {
    await this.database
      .prepare(
        `INSERT INTO contacts (name, email, message, created_at, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
      .bind(contact.name, contact.email, contact.message)
      .run();

    const id = await getLastInsertId(this.database);
    const row = await this.database
      .prepare(
        `SELECT id, name, email, message, created_at, updated_at
         FROM contacts
         WHERE id = ?`,
      )
      .bind(id)
      .first<ContactRow>();

    if (!row) {
      throw new Error(`Contact ${id} could not be reloaded after insert.`);
    }

    return mapContactRow(row);
  }

  async findAll(): Promise<readonly Contact[]> {
    const rows = await selectAll<ContactRow>(
      this.database.prepare(
        `SELECT id, name, email, message, created_at, updated_at
         FROM contacts
         ORDER BY created_at DESC, id DESC`,
      ),
    );

    return rows.map(mapContactRow);
  }

  delete(id: number): Promise<void> {
    return this.database.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run().then(() => undefined);
  }
}