<?php
namespace App\UseCases\Work;

use App\Domain\Repositories\WorkRepositoryInterface;
use App\Domain\ValueObjects\Category;

class GetWorkListUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {}

    public function execute(?Category $category = null): array
    {
        if ($category !== null) {
            return $this->workRepository->findByCategory($category);
        }

        return $this->workRepository->findAll();
    }
}
