import type { WorkRepository } from "@/domain/publicApi";

export class DeleteWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(id: number): Promise<void> {
    return this.workRepository.delete(id);
  }
}