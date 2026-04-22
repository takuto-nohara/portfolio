<?php

namespace App\Domain\Entities;

final class WorkImage
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $workId,
        public readonly string $imagePath,
        public readonly int $sortOrder,
        public readonly ?string $createdAt,
        public readonly ?string $updatedAt,
    ) {
    }
}