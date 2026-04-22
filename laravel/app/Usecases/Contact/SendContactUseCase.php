<?php
namespace App\UseCases\Contact;

use App\Domain\Entities\Contact;
use App\Domain\Repositories\ContactRepositoryInterface;
use App\Infrastructure\Mail\ContactMail;
use Illuminate\Support\Facades\Mail;

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

        $saved = $this->contactRepository->save($contact);

        Mail::to(config('mail.from.address'))->send(new ContactMail($saved));

        return $saved;
    }
}
