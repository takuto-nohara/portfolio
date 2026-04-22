<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\WorkController as AdminWorkController;
use App\UseCases\Work\GetFeaturedWorksUseCase;

Route::get('/', function (GetFeaturedWorksUseCase $getFeaturedWorksUseCase) {
    $featuredWorks = $getFeaturedWorksUseCase->execute();
    return view('top', compact('featuredWorks'));
})->name('top');

Route::get('/about', function () {
    return view('about');
})->name('about');

Route::get('/works', [WorkController::class, 'index'])->name('works.index');
Route::get('/works/{id}', [WorkController::class, 'show'])->name('works.show');

Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::prefix('admin')->middleware('auth')->name('admin.')->group(function () {
    Route::get('/works', [AdminWorkController::class, 'index'])->name('works.index');
    Route::get('/works/create', [AdminWorkController::class, 'create'])->name('works.create');
    Route::post('/works', [AdminWorkController::class, 'store'])->name('works.store');
    Route::get('/works/{id}/edit', [AdminWorkController::class, 'edit'])->name('works.edit');
    Route::put('/works/{id}', [AdminWorkController::class, 'update'])->name('works.update');
    Route::delete('/works/{id}', [AdminWorkController::class, 'destroy'])->name('works.destroy');
});

require __DIR__.'/auth.php';
