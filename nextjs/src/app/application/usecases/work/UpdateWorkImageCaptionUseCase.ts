import type { WorkRepository } from "@/domain/publicApi";

export class UpdateWorkImageCaptionUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  execute(imageId: number, caption?: string | null): Promise<void> {
    return this.workRepository.updateImageCaption(imageId, caption ?? null);
  }
}