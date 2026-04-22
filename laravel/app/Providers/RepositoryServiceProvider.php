<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Domain\Repositories\WorkRepositoryInterface::class,
            \App\Infrastructure\Repositories\EloquentWorkRepository::class,
        );

        $this->app->bind(
            \App\Domain\Repositories\ContactRepositoryInterface::class,
            \App\Infrastructure\Repositories\EloquentContactRepository::class,
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
