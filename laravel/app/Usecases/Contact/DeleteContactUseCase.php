<?php

namespace App\UseCases\Contact;

use App\Domain\Repositories\ContactRepositoryInterface;

class DeleteContactUseCase
{
    public function __construct(
        private readonly ContactRepositoryInterface $contactRepository
    ) {
    }

    public function execute(int $id): void
    {
        $this->contactRepository->delete($id);
    }
}
