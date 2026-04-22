<?php

namespace App\UseCases\Work;

use App\Domain\Repositories\WorkRepositoryInterface;

class DeleteWorkImageUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {
    }

    public function execute(int $imageId): void
    {
        $this->workRepository->deleteImage($imageId);
    }
}
