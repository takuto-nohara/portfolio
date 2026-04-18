<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Work;

class WorkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Work::create([
            'title'=>'ポートフォリオテスト',
            'category'=>'web',
            'description'=>'ポートフォリオテスト',
            'thumbnail'=>'https://placehold.jp/150x150.png',
            'url'=>'http://example.com',
            'tech_stack'=>'PHP, Laravel, Vite',
            'is_featured'=>true,
            'sort_order'=>1
        ]);
    }
}
