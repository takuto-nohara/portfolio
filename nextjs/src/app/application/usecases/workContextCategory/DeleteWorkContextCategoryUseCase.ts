import type { WorkContextCategoryRepository } from "@/domain/publicApi";

export class DeleteWorkContextCategoryUseCase {
  constructor(private readonly workContextCategoryRepository: WorkContextCategoryRepository) {}

  execute(id: number): Promise<void> {
    return this.workContextCategoryRepository.delete(id);
  }
}