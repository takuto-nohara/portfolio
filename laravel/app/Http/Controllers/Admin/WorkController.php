<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreWorkRequest;
use App\Http\Requests\Admin\UpdateWorkRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\UseCases\Work\GetWorkListUseCase;
use App\UseCases\Work\GetWorkDetailUseCase;
use App\UseCases\Work\CreateWorkUseCase;
use App\UseCases\Work\UpdateWorkUseCase;
use App\UseCases\Work\DeleteWorkUseCase;
use App\UseCases\Work\AddWorkImageUseCase;
use App\UseCases\Work\DeleteWorkImageUseCase;
use App\UseCases\Work\UpdateWorkImageCaptionUseCase;

class WorkController extends Controller
{
    public function __construct(
        private GetWorkListUseCase $getWorkListUseCase,
        private GetWorkDetailUseCase $getWorkDetailUseCase,
        private CreateWorkUseCase $createWorkUseCase,
        private UpdateWorkUseCase $updateWorkUseCase,
        private DeleteWorkUseCase $deleteWorkUseCase,
        private AddWorkImageUseCase $addWorkImageUseCase,
        private DeleteWorkImageUseCase $deleteWorkImageUseCase,
        private UpdateWorkImageCaptionUseCase $updateWorkImageCaptionUseCase,
    ) {}

    public function index()
    {
        $workList = $this->getWorkListUseCase->execute();

        return view('admin.works.index', compact('workList'));
    }

    public function create()
    {
        return view('admin.works.create');
    }

    public function store(StoreWorkRequest $request)
    {
        $validated = $request->validated();

        $thumbnailPath = $request->file('thumbnail')?->store('works/thumbnails', 'public');

        $work = $this->createWorkUseCase->execute(
            title: $validated['title'],
            description: $validated['description'],
            category: $validated['category'],
            techStack: $validated['tech_stack'],
            sortOrder: (int) $validated['sort_order'],
            thumbnail: $thumbnailPath,
            url: $validated['url'] ?? null,
            githubUrl: $validated['github_url'] ?? null,
            publishedAt: $validated['published_at'] ?? null,
            isFeatured: (bool) ($validated['is_featured'] ?? false)
        );

        foreach ($request->file('images', []) as $index => $image) {
            $imagePath = $image->store('works/gallery', 'public');
            $caption = $validated['captions'][$index] ?? null;
            $this->addWorkImageUseCase->execute($work->id, $imagePath, $caption ?: null);
        }

        return redirect()->route('admin.works.index')->with('success', 'Work created successfully.');
    }

    public function edit(int $id)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($id);

        if (!$workDetail) {
            abort(404);
        }

        return view('admin.works.edit', compact('workDetail'));
    }

    public function update(UpdateWorkRequest $request, int $id)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($id);

        if (!$workDetail) {
            abort(404);
        }

        $validated = $request->validated();

        $thumbnailPath = $workDetail->thumbnail;

        if ($request->hasFile('thumbnail')) {
            if ($workDetail->thumbnail) {
                Storage::disk('public')->delete($workDetail->thumbnail);
            }

            $thumbnailPath = $request->file('thumbnail')->store('works/thumbnails', 'public');
        }

        $this->updateWorkUseCase->execute(
            id: $id,
            title: $validated['title'],
            description: $validated['description'],
            category: $validated['category'],
            techStack: $validated['tech_stack'],
            sortOrder: (int) $validated['sort_order'],
            thumbnail: $thumbnailPath,
            url: $validated['url'] ?? null,
            githubUrl: $validated['github_url'] ?? null,
            publishedAt: $validated['published_at'] ?? null,
            isFeatured: (bool) ($validated['is_featured'] ?? false)
        );

        foreach ($request->file('images', []) as $index => $image) {
            $imagePath = $image->store('works/gallery', 'public');
            $caption = $validated['captions'][$index] ?? null;
            $this->addWorkImageUseCase->execute($id, $imagePath, $caption ?: null);
        }

        return redirect()->route('admin.works.index')->with('success', 'Work updated successfully.');
    }

    public function updateImage(int $workId, int $imageId)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($workId);

        if (!$workDetail) {
            abort(404);
        }

        $imageExists = collect($workDetail->images)->contains(fn ($image) => $image->id === $imageId);

        if (!$imageExists) {
            abort(404);
        }

        $caption = request()->validate([
            'caption' => ['nullable', 'string', 'max:255'],
        ])['caption'] ?? null;
        $this->updateWorkImageCaptionUseCase->execute($imageId, $caption ?: null);

        return redirect()->route('admin.works.edit', $workId)->with('success', 'キャプションを更新しました。');
    }

    public function destroy(int $id)
    {
        $this->deleteWorkUseCase->execute($id);
        return redirect()->route('admin.works.index')->with('success', 'Work deleted successfully.');
    }

    public function destroyImage(int $workId, int $imageId)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($workId);

        if (!$workDetail) {
            abort(404);
        }

        $imageExists = collect($workDetail->images)->contains(fn ($image) => $image->id === $imageId);

        if (!$imageExists) {
            abort(404);
        }

        $this->deleteWorkImageUseCase->execute($imageId);

        return redirect()->route('admin.works.edit', $workId)->with('success', '画像を削除しました。');
    }
}
