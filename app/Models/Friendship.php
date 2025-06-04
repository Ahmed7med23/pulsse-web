<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Friendship extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'status',
        'pulses_count',
        'last_pulse_at',
        'is_favorite',
        'response_rate',
        'blocked_at'
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
        'pulses_count' => 'integer',
        'response_rate' => 'decimal:2',
        'last_pulse_at' => 'datetime',
        'blocked_at' => 'datetime',
    ];

    /**
     * Get the sender of the friendship.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver of the friendship.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Scope a query to only include accepted friendships.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope a query to only include pending friendships.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include blocked friendships.
     */
    public function scopeBlocked($query)
    {
        return $query->where('status', 'blocked');
    }

    /**
     * Scope a query to only include favorite friendships.
     */
    public function scopeFavorite($query)
    {
        return $query->where('is_favorite', true);
    }
}
