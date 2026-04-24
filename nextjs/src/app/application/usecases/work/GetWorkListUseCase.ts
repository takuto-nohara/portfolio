import type { Category, Work, WorkRepository } from "@/domain/publicApi";

export class GetWorkListUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(category?: Category | null): Promise<readonly Work[]> {
    if (category) {
      return this.workRepository.findByCategory(category);
    }

    return this.workRepository.findAll();
  }
}