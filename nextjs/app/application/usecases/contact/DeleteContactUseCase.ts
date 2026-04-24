import type { ContactRepository } from "@/domain/publicApi";

export class DeleteContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  execute(id: number): Promise<void> {
    return this.contactRepository.delete(id);
  }
}