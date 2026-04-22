<?php
namespace App\Domain\Repositories;
use App\Domain\Entities\Contact;

interface ContactRepositoryInterface
{
    public function save(Contact $contact): Contact;

    /** @return Contact[] */
    public function findAll(): array;

    public function delete(int $id): void;
}
