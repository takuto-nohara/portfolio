<?php
namespace App\Domain\Entities;

final class Contact
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $email,
        public readonly string $message,
        public readonly ?string $createdAt,
        public readonly ?string $updatedAt,
    ) {
    }
}
