import type { Contact, ContactRepository } from "@/domain/publicApi";

export class GetContactListUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  execute(): Promise<readonly Contact[]> {
    return this.contactRepository.findAll();
  }
}