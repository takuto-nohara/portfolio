<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Work as WorkEntity;
use App\Domain\Entities\WorkImage as WorkImageEntity;
use App\Domain\Repositories\WorkRepositoryInterface;
use App\Domain\ValueObjects\Category;
use App\Models\Work as WorkModel;
use App\Models\WorkImage as WorkImageModel;
use Illuminate\Support\Facades\Storage;

class EloquentWorkRepository implements WorkRepositoryInterface
{
    private function toImageEntity(WorkImageModel $model): WorkImageEntity
    {
        return new WorkImageEntity(
            id: $model->id,
            workId: $model->work_id,
            imagePath: $model->image_path,
            sortOrder: $model->sort_order,
            createdAt: $model->created_at?->toDateTimeString(),
            updatedAt: $model->updated_at?->toDateTimeString(),
        );
    }

    private function toEntity(WorkModel $model): WorkEntity
    {
        $images = $model->relationLoaded('images')
            ? $model->images->sortBy('sort_order')->values()->all()
            : $model->images()->orderBy('sort_order')->get()->all();

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
            images: array_map(fn (WorkImageModel $image): WorkImageEntity => $this->toImageEntity($image), $images),
        );
    }

    public function findAll(): array
    {
        return WorkModel::with('images')->get()->map(function ($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findByCategory(Category $category): array
    {
        return WorkModel::with('images')->where('category', $category->value)->get()->map(function ($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findFeatured(): array
    {
        return WorkModel::with('images')->where('is_featured', true)->get()->map(function ($model) {
            return $this->toEntity($model);
        })->all();
    }

    public function findById(int $id): ?WorkEntity
    {
        $model = WorkModel::with('images')->find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function save(WorkEntity $work): WorkEntity
    {
        $model = $work->id ? WorkModel::find($work->id) : null;
        $model ??= new WorkModel();

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

        return $this->findById($model->id) ?? $this->toEntity($model);
    }

    public function delete(int $id): void
    {
        $model = WorkModel::with('images')->find($id);

        if (!$model) {
            return;
        }

        if ($model->thumbnail) {
            Storage::disk('public')->delete($model->thumbnail);
        }

        foreach ($model->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $model->delete();
    }

    public function addImage(int $workId, string $imagePath): WorkImageEntity
    {
        $sortOrder = (int) WorkImageModel::where('work_id', $workId)->max('sort_order') + 1;

        $model = WorkImageModel::create([
            'work_id' => $workId,
            'image_path' => $imagePath,
            'sort_order' => $sortOrder,
        ]);

        return $this->toImageEntity($model);
    }

    public function deleteImage(int $imageId): void
    {
        $model = WorkImageModel::find($imageId);

        if (!$model) {
            return;
        }

        Storage::disk('public')->delete($model->image_path);
        $model->delete();
    }

    public function getImages(int $workId): array
    {
        return WorkImageModel::where('work_id', $workId)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (WorkImageModel $model): WorkImageEntity => $this->toImageEntity($model))
            ->all();
    }
}