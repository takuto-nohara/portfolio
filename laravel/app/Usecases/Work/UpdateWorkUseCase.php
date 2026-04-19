<?php
namespace App\UseCases\Work;
use App\Domain\Repositories\WorkRepositoryInterface;
use App\Domain\Entities\Work;
use App\Domain\ValueObjects\Category;

class UpdateWorkUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ){}

    public function execute(int $id, string $title, string $category, string $description, string $techStack,
         int $sortOrder, ?string $thumbnail = null, ?string $url = null, ?string $githubUrl = null,
         ?string $publishedAt = null, bool $isFeatured = false): ?Work
    {
        $work = new Work(
            id: $id,
            title: $title,
            category: Category::from($category),
            description: $description,
            techStack: $techStack,
            sortOrder: $sortOrder,
            thumbnail: $thumbnail,
            url: $url,
            githubUrl: $githubUrl,
            publishedAt: $publishedAt,
            isFeatured: $isFeatured,
            createdAt: null,
            updatedAt: null
        );
        return $this->workRepository->save($work);
    }
}
