<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:app,web,video,graphic',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'sort_order' => 'required|integer|min:0',
            'thumbnail' => 'nullable|image|max:2048',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|max:4096',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ]);

        $thumbnailPath = $request->file('thumbnail')?->store('works/thumbnails', 'public');

        $work = $this->createWorkUseCase->execute(
            title: $request->title,
            description: $request->description,
            category: $request->category,
            techStack: $request->tech_stack,
            sortOrder: (int) $request->input('sort_order'),
            thumbnail: $thumbnailPath,
            url: $request->url,
            githubUrl: $request->github_url,
            publishedAt: $request->published_at,
            isFeatured: (bool) $request->boolean('is_featured')
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

    public function update(Request $request, int $id)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($id);

        if (!$workDetail) {
            abort(404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:app,web,video,graphic',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'sort_order' => 'required|integer|min:0',
            'thumbnail' => 'nullable|image|max:2048',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|max:4096',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ]);

        $thumbnailPath = $workDetail->thumbnail;

        if ($request->hasFile('thumbnail')) {
            if ($workDetail->thumbnail) {
                Storage::disk('public')->delete($workDetail->thumbnail);
            }

            $thumbnailPath = $request->file('thumbnail')->store('works/thumbnails', 'public');
        }

        $this->updateWorkUseCase->execute(
            id: $id,
            title: $request->title,
            description: $request->description,
            category: $request->category,
            techStack: $request->tech_stack,
            sortOrder: (int) $request->input('sort_order'),
            thumbnail: $thumbnailPath,
            url: $request->url,
            githubUrl: $request->github_url,
            publishedAt: $request->published_at,
            isFeatured: (bool) $request->boolean('is_featured')
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
