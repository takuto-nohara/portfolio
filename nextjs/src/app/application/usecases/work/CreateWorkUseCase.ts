import type { Work, WorkRepository } from "@/domain/publicApi";

export class CreateWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(work: Work): Promise<Work> {
    return this.workRepository.save(work);
  }
}