<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp',
        'country',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the circles owned by the user.
     */
    public function circles(): HasMany
    {
        return $this->hasMany(Circle::class);
    }

    /**
     * Get the friendships where the user is the sender.
     */
    public function sentFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id');
    }

    /**
     * Get the friendships where the user is the receiver.
     */
    public function receivedFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'receiver_id');
    }

    /**
     * Get all accepted friendships for the user.
     */
    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'sender_id', 'receiver_id')
            ->wherePivot('status', 'accepted')
            ->withPivot(['pulses_count', 'last_pulse_at', 'is_favorite', 'response_rate'])
            ->withTimestamps();
    }

    /**
     * Get all pending friend requests sent by the user.
     */
    public function pendingSentFriendRequests(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'sender_id', 'receiver_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    /**
     * Get all pending friend requests received by the user.
     */
    public function pendingReceivedFriendRequests(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'receiver_id', 'sender_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    /**
     * Get all blocked friendships for the user.
     */
    public function blockedFriends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'sender_id', 'receiver_id')
            ->wherePivot('status', 'blocked')
            ->withTimestamps();
    }
}
