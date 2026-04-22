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

        foreach ($request->file('images', []) as $image) {
            $imagePath = $image->store('works/gallery', 'public');
            $this->addWorkImageUseCase->execute($work->id, $imagePath);
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

        foreach ($request->file('images', []) as $image) {
            $imagePath = $image->store('works/gallery', 'public');
            $this->addWorkImageUseCase->execute($id, $imagePath);
        }

        return redirect()->route('admin.works.index')->with('success', 'Work updated successfully.');
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
