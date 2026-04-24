import type { Contact } from "@/domain/publicApi";

export interface EmailPort {
  sendContactEmail(contact: Contact, toEmail: string): Promise<void>;
}