<?php
namespace App\UseCases\Work;
use App\Domain\Repositories\WorkRepositoryInterface;
use App\Domain\Entities\Work;

class GetWorkDetailUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ){}

    public function execute(int $id): ?Work
    {
        return $this->workRepository->findById($id);
    }
}
