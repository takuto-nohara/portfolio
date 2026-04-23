<?php

namespace App\Http\Requests\Admin;

use App\Domain\ValueObjects\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkRequest extends FormRequest
{
    /** @var int[] PHPレベルでサイズ超過により拒否されたファイルのインデックス */
    private array $oversizedImageIndexes = [];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $images = $this->file('images', []);
        if (!is_array($images)) {
            return;
        }

        $valid = [];
        foreach ($images as $index => $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                if ($file->isValid()) {
                    $valid[] = $file;
                } elseif (in_array($file->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
                    $this->oversizedImageIndexes[] = $index;
                }
                // UPLOAD_ERR_NO_FILE (未選択) は無視
            }
        }

        $this->files->set('images', $valid ?: []);
    }

    public function withValidator(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        if (!empty($this->oversizedImageIndexes)) {
            $validator->errors()->add('images', '2MBを超えるファイルはアップロードできません。ファイルサイズを確認してください。');
        }
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
            'images.*' => 'nullable|image|max:2048',
            'url' => 'nullable|url|max:2048',
            'github_url' => 'nullable|url|max:2048',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
        ];
    }
}
