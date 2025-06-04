<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FriendshipStats extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'friend_id',
        'pulses_sent',
        'pulses_received',
        'total_pulses',
        'response_rate',
        'response_time_avg',
        'reactions_given',
        'reactions_received',
        'streak_days',
        'last_pulse_at',
        'last_interaction_at',
        'streak_started_at',
        'is_favorite',
        'notifications_enabled',
        'custom_nickname'
    ];

    protected $casts = [
        'last_pulse_at' => 'datetime',
        'last_interaction_at' => 'datetime',
        'streak_started_at' => 'date',
        'is_favorite' => 'boolean',
        'notifications_enabled' => 'boolean',
        'response_rate' => 'decimal:2'
    ];

    // العلاقات
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    // Scopes
    public function scopeFavorites($query)
    {
        return $query->where('is_favorite', true);
    }

    public function scopeByStreak($query, $days = null)
    {
        if ($days) {
            return $query->where('streak_days', '>=', $days);
        }
        return $query->orderBy('streak_days', 'desc');
    }

    public function scopeActive($query)
    {
        return $query->whereNotNull('last_interaction_at');
    }
}
