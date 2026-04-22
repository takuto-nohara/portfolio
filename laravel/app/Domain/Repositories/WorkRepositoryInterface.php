<?php
namespace App\Domain\Repositories;
use App\Domain\Entities\Work;
use App\Domain\Entities\WorkImage;
use App\Domain\ValueObjects\Category;

interface WorkRepositoryInterface
{
    /** @return Work[] 配列を返す**/
    public function findAll(): array;
    public function findByCategory(Category $category): array;
    public function findFeatured(): array;

    public function findById(int $id): ?Work;
    public function save(Work $work): Work;
    public function delete(int $id): void;
    public function addImage(int $workId, string $imagePath): WorkImage;
    public function deleteImage(int $imageId): void;

    /** @return WorkImage[] */
    public function getImages(int $workId): array;
}
