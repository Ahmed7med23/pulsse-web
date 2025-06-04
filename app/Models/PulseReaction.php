<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulseReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'pulse_id',
        'user_id',
        'reaction_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Available reaction types
    const REACTION_TYPES = [
        'pray' => '🙏',
        'sparkles' => '✨',
        'smile' => '😊',
        'heart' => '❤️',
        'thumbs_up' => '👍',
        'sad' => '😢',
        'surprised' => '😮',
        'angry' => '😡',
    ];

    // Relationships
    public function pulse()
    {
        return $this->belongsTo(Pulse::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public static function getReactionIcon($type)
    {
        return self::REACTION_TYPES[$type] ?? $type;
    }

    public static function getReactionKey($icon)
    {
        return array_search($icon, self::REACTION_TYPES) ?: $icon;
    }

    // Scope to get reactions for a specific pulse
    public function scopeForPulse($query, $pulseId)
    {
        return $query->where('pulse_id', $pulseId);
    }

    // Scope to get reactions by a specific user
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
