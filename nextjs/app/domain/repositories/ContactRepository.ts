import type { Contact } from "../entities/Contact";

export interface ContactRepository {
  save(contact: Contact): Promise<Contact>;
  findAll(): Promise<readonly Contact[]>;
  delete(id: number): Promise<void>;
}