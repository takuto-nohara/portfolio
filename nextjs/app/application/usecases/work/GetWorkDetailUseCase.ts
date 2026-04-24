import type { Work, WorkRepository } from "@/domain/publicApi";

export class GetWorkDetailUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(id: number): Promise<Work | null> {
    return this.workRepository.findById(id);
  }
}