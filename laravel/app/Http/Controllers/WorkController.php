<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\UseCases\Work\GetWorkListUseCase;
use App\UseCases\Work\GetWorkDetailUseCase;
use App\Domain\ValueObjects\Category;

class WorkController extends Controller
{
    public function __construct(
        private GetWorkListUseCase $getWorkListUseCase,
        private GetWorkDetailUseCase $getWorkDetailUseCase
    ) {}

    public function index(Request $request)
    {
        $categoryValue = $request->get('category');
        $category = $categoryValue ? Category::tryFrom($categoryValue) : null;

        $workList = $this->getWorkListUseCase->execute($category);

        return view('works.index', compact('workList'));
    }

    public function show(int $id)
    {
        $workDetail = $this->getWorkDetailUseCase->execute($id);

        if (!$workDetail) {
            abort(404);
        }

        return view('works.show', compact('workDetail'));
    }

}
