<?php
namespace App\UseCases\Contact;

use App\Domain\Entities\Contact;
use App\Domain\Repositories\ContactRepositoryInterface;

class SendContactUseCase
{
    public function __construct(
        private readonly ContactRepositoryInterface $contactRepository
    ){}

    public function execute(string $name, string $email, string $message): Contact
    {
        $contact = new Contact(
            id: null,
            name: $name,
            email: $email,
            message: $message,
            createdAt: null,
            updatedAt: null
        );
        return $this->contactRepository->save($contact);
    }
}
