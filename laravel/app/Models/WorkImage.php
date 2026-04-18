<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkImage extends Model
{
    protected $fillable = [
        'work_id',
        'image_path',
        'sort_order',
    ];

    public function work(): BelongsTo
    {
        return $this->belongsTo(Work::class);
    }
}
