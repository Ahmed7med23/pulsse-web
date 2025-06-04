<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulseRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'pulse_id',
        'recipient_id',
        'seen_at',
    ];

    protected $casts = [
        'seen_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function pulse()
    {
        return $this->belongsTo(Pulse::class);
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function markAsSeen()
    {
        $this->update(['seen_at' => now()]);
    }

    public function isSeen()
    {
        return !is_null($this->seen_at);
    }
}
