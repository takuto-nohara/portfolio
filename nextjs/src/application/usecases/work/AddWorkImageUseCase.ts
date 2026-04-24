import type { WorkImage, WorkRepository } from "@/domain/publicApi";

export class AddWorkImageUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(workId: number, imagePath: string, caption?: string | null): Promise<WorkImage> {
    return this.workRepository.addImage(workId, imagePath, caption ?? null);
  }
}