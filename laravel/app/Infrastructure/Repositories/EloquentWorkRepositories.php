<?php
namespace App\Infrastructure\Repositories;
use App\Domain\Entities\Work as WorkEntity;
use App\Models\Work as WorkModel;
use App\Domain\ValueObjects\Category;
use App\Domain\Repositories\WorkRepositoryInterface;

class EloquentWorkRepositories implements WorkRepositoryInterface
{
        private function toEntity(WorkModel $model): WorkEntity
    {
        return new WorkEntity(
            id: $model->id,
            title: $model->title,
            description: $model->description,
            category: Category::from($model->category),
            isFeatured: $model->is_featured,
            techStack: $model->tech_stack,
            thumbnail: $model->thumbnail,
            url: $model->url,
            githubUrl: $model->github_url,
            publishedAt: $model->published_at?->toDateTimeString(),
            sortOrder: $model->sort_order,
            createdAt: $model->created_at?->toDateTimeString(),
            updatedAt: $model->updated_at?->toDateTimeString(),
        );
    }

    public function findAll(): array
    {
        return WorkModel::all()->map(function($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findByCategory(Category $category): array
    {
        return WorkModel::where('category', $category->value)->get()->map(function($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findFeatured(): array
    {
        return WorkModel::where('is_featured', true)->get()->map(function($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findById(int $id): ?WorkEntity
    {
        $model = WorkModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function save(WorkEntity $work): WorkEntity
    {
        $model = new WorkModel();
        $model->id = $work->id;
        $model->title = $work->title;
        $model->category = $work->category->value;
        $model->description = $work->description;
        $model->tech_stack = $work->techStack;
        $model->thumbnail = $work->thumbnail;
        $model->url = $work->url;
        $model->github_url = $work->githubUrl;
        $model->published_at = $work->publishedAt;
        $model->is_featured = $work->isFeatured;
        $model->sort_order = $work->sortOrder;
        $model->save();
        return $this->toEntity($model);
    }

    public function delete(int $id): void
    {
        WorkModel::destroy($id);
    }
}
