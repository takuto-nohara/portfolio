import type { Work, WorkRepository } from "@/domain/publicApi";

export class GetFeaturedWorksUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(): Promise<readonly Work[]> {
    return this.workRepository.findFeatured();
  }
}