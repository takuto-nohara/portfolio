import type { WorkContextCategory, WorkContextCategoryRepository } from "@/domain/publicApi";

export class CreateWorkContextCategoryUseCase {
  constructor(private readonly workContextCategoryRepository: WorkContextCategoryRepository) {}

  execute(category: WorkContextCategory): Promise<WorkContextCategory> {
    return this.workContextCategoryRepository.save(category);
  }
}