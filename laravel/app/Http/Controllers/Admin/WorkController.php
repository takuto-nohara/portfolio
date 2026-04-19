<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\UseCases\Work\GetWorkListUseCase;
use App\UseCases\Work\GetWorkDetailUseCase;
use App\UseCases\Work\CreateWorkUseCase;
use App\UseCases\Work\UpdateWorkUseCase;
use App\UseCases\Work\DeleteWorkUseCase;

class WorkController extends Controller
{
    public function __construct(
        private GetWorkListUseCase $getWorkListUseCase,
        private GetWorkDetailUseCase $getWorkDetailUseCase,
        private CreateWorkUseCase $createWorkUseCase,
        private UpdateWorkUseCase $updateWorkUseCase,
        private DeleteWorkUseCase $deleteWorkUseCase
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
            'thumbnail' => 'nullable|string|max:2048',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ]);

        $this->createWorkUseCase->execute(
            title: $request->title,
            description: $request->description,
            category: $request->category,
            techStack: $request->tech_stack,
            sortOrder: (int) $request->input('sort_order'),
            thumbnail: $request->thumbnail,
            url: $request->url,
            githubUrl: $request->github_url,
            publishedAt: $request->published_at,
            isFeatured: (bool) $request->boolean('is_featured')
        );
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
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:app,web,video,graphic',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'sort_order' => 'required|integer|min:0',
            'thumbnail' => 'nullable|string|max:2048',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ]);

        $this->updateWorkUseCase->execute(
            id: $id,
            title: $request->title,
            description: $request->description,
            category: $request->category,
            techStack: $request->tech_stack,
            sortOrder: (int) $request->input('sort_order'),
            thumbnail: $request->thumbnail,
            url: $request->url,
            githubUrl: $request->github_url,
            publishedAt: $request->published_at,
            isFeatured: (bool) $request->boolean('is_featured')
        );
        return redirect()->route('admin.works.index')->with('success', 'Work updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->deleteWorkUseCase->execute($id);
        return redirect()->route('admin.works.index')->with('success', 'Work deleted successfully.');
    }
}
