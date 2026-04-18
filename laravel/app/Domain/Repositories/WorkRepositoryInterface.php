<?php
namespace App\Domain\Repositories;
use App\Domain\Entities\Work;
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
}
