<?php

namespace App\UseCases\Contact;

use App\Domain\Repositories\ContactRepositoryInterface;

class GetContactListUseCase
{
    public function __construct(
        private readonly ContactRepositoryInterface $contactRepository
    ) {
    }

    public function execute(): array
    {
        return $this->contactRepository->findAll();
    }
}