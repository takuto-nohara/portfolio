import type { WorkRepository } from "@/domain/publicApi";

export class DeleteWorkImageUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(imageId: number): Promise<void> {
    return this.workRepository.deleteImage(imageId);
  }
}