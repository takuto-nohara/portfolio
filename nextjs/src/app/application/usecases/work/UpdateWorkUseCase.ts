import type { Work, WorkRepository } from "@/domain/publicApi";

export class UpdateWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(work: Work): Promise<Work> {
    if (work.id === null) {
      throw new Error("Cannot update a work without an id.");
    }

    return this.workRepository.save(work);
  }
}