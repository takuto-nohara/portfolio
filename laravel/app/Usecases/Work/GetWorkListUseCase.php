<?php
namespace App\UseCases\Work;

use App\Domain\Repositories\WorkRepositoryInterface;

class GetWorkListUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {}

    public function execute(): array
    {
        return $this->workRepository->findAll();
    }
}
