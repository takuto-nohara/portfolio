<?php
namespace App\UseCases\Work;
use App\Domain\Repositories\WorkRepositoryInterface;
use App\Domain\Entities\Work;

class DeleteWorkUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ){}

    public function execute(int $id): void
    {
        $this->workRepository->delete($id);
    }
}
