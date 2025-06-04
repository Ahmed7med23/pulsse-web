<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Circle extends Model
{
    protected $fillable = [
        'name',
        'description',
        'color',
        'icon',
        'privacy_type',
        'user_id',
        'is_active',
        'members_count',
        'pulses_count',
        'image_url',
        'pulse_strength',
        'last_pulse_at',
        'is_favorite'
    ];

    protected $casts = [
        'privacy' => 'string',
    ];

    /**
     * Get the user that owns the circle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the members of the circle.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'circle_members', 'circle_id', 'user_id');
    }

    /**
     * Get the pulses sent to this circle.
     */
    public function pulses(): HasMany
    {
        return $this->hasMany(Pulse::class)->where('type', 'circle')
            ->whereRaw("JSON_EXTRACT(metadata, '$.circle_id') = ?", [$this->id]);
    }
}
