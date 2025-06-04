<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pulse extends Model
{
    use HasFactory;

    const TYPE_DIRECT = 'direct';
    const TYPE_CIRCLE = 'circle';

    protected $fillable = [
        'sender_id',
        'type',
        'message',
        'circle_id',
        'metadata',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function circle()
    {
        return $this->belongsTo(Circle::class);
    }

    public function recipients()
    {
        return $this->hasMany(PulseRecipient::class);
    }

    public function recipientUsers()
    {
        return $this->belongsToMany(User::class, 'pulse_recipients', 'pulse_id', 'recipient_id')
            ->withTimestamps()
            ->withPivot('seen_at');
    }

    public function reactions()
    {
        return $this->hasMany(PulseReaction::class);
    }

    public function reactionsSummary()
    {
        return $this->reactions()
            ->selectRaw('reaction_type, COUNT(*) as count')
            ->groupBy('reaction_type')
            ->pluck('count', 'reaction_type');
    }

    public function getUserReaction($userId)
    {
        return $this->reactions()->where('user_id', $userId)->first();
    }

    // Scope for direct pulses
    public function scopeDirect($query)
    {
        return $query->where('type', self::TYPE_DIRECT);
    }

    // Scope for circle pulses
    public function scopeCircle($query)
    {
        return $query->where('type', self::TYPE_CIRCLE);
    }

    // Check if pulse is direct
    public function isDirect()
    {
        return $this->type === self::TYPE_DIRECT;
    }

    // Check if pulse is circle
    public function isCircle()
    {
        return $this->type === self::TYPE_CIRCLE;
    }
}
