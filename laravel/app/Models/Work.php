<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Work extends Model
{
    protected $fillable = [
        'title',
        'category',
        'description',
        'tech_stack',
        'thumbnail',
        'url',
        'github_url',
        'published_at',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'published_at' => 'date',
        'is_featured' => 'boolean',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(WorkImage::class);
    }
}
