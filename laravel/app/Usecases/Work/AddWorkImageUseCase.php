<?php

namespace App\UseCases\Work;

use App\Domain\Entities\WorkImage;
use App\Domain\Repositories\WorkRepositoryInterface;

class AddWorkImageUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {
    }

    public function execute(int $workId, string $imagePath): WorkImage
    {
        return $this->workRepository->addImage($workId, $imagePath);
    }
}
