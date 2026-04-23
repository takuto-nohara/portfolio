<?php

namespace App\UseCases\Work;

use App\Domain\Repositories\WorkRepositoryInterface;

class UpdateWorkImageCaptionUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {
    }

    public function execute(int $imageId, ?string $caption): void
    {
        $this->workRepository->updateImageCaption($imageId, $caption);
    }
}
