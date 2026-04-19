<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\UseCases\Work\GetWorkListUseCase;
use App\UseCases\Work\GetWorkDetailUseCase;

class WorkController extends Controller
{
    public function __construct(
        private GetWorkListUseCase $getWorkListUseCase,
        private GetWorkDetailUseCase $getWorkDetailUseCase
    ) {}

    public function index()
    {
        $workList = $this->getWorkListUseCase->execute();

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
