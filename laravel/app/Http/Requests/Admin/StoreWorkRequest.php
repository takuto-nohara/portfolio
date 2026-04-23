<?php

namespace App\Http\Requests\Admin;

use App\Domain\ValueObjects\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => ['required', Rule::enum(Category::class)],
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'sort_order' => 'required|integer|min:0',
            'thumbnail' => 'nullable|image|max:2048',
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|image|max:4096',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ];
    }
}
