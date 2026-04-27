import type { WorkContextCategory, WorkContextCategoryRepository } from "@/domain/publicApi";

export class GetWorkContextCategoryListUseCase {
  constructor(private readonly workContextCategoryRepository: WorkContextCategoryRepository) {}

  execute(): Promise<readonly WorkContextCategory[]> {
    return this.workContextCategoryRepository.findAll();
  }
}