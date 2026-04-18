<?php
namespace App\Domain\Entities;
use App\Domain\ValueObjects\Category;

final class Work
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $title,
        public readonly Category $category,
        public readonly string $description,
        public readonly string $techStack,
        public readonly ?string $thumbnail,
        public readonly ?string $url,
        public readonly ?string $githubUrl,
        public readonly ?string $publishedAt,
        public readonly bool $isFeatured,
        public readonly int $sortOrder,
        public readonly ?string $createdAt,
        public readonly ?string $updatedAt,
    ) {
    }
}
