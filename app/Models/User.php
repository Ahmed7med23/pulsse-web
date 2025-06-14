<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasPushSubscriptions;

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
        'avatar_url',
        'city',
        'bio',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp',
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
            'last_active' => 'datetime',
            'last_pulse_time' => 'datetime',
            'is_online' => 'boolean',
            'is_active' => 'boolean',
            'notification_enabled' => 'boolean',
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
        return $this->belongsToMany(User::class, 'user_friendships', 'user_id', 'friend_id')
            ->withPivot([
                'friendship_started_at',
                'is_blocked',
                'blocked_at'
            ])
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

    /**
     * طلبات الصداقة المرسلة
     */
    public function sentFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    /**
     * طلبات الصداقة المستقبلة
     */
    public function receivedFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id');
    }

    /**
     * الأصدقاء من جانب الصديق
     */
    public function friendsReverse()
    {
        return $this->belongsToMany(
            User::class,
            'user_friendships',
            'friend_id',
            'user_id'
        )->withPivot([
            'friendship_started_at',
            'is_blocked',
            'blocked_at'
        ])->withTimestamps();
    }

    /**
     * جميع الأصدقاء (من الجانبين)
     */
    public function allFriends()
    {
        return $this->friends()->union($this->friendsReverse());
    }

    /**
     * الأصدقاء غير المحظورين
     */
    public function activeFriends()
    {
        return $this->allFriends()->wherePivot('is_blocked', false);
    }

    /**
     * إحصائيات الصداقات
     */
    public function friendshipStats()
    {
        return $this->hasMany(FriendshipStats::class, 'user_id');
    }

    /**
     * الأصدقاء المفضلين
     */
    public function favoriteFriends()
    {
        return $this->hasManyThrough(
            User::class,
            FriendshipStats::class,
            'user_id',
            'id',
            'id',
            'friend_id'
        )->where('friendship_stats.is_favorite', true);
    }

    /**
     * فحص الصداقة مع مستخدم آخر
     */
    public function isFriendWith(User $user): bool
    {
        return $this->allFriends()->where('users.id', $user->id)->exists();
    }

    /**
     * فحص طلب الصداقة المعلق
     */
    public function hasPendingFriendRequestWith(User $user): bool
    {
        return $this->sentFriendRequests()
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * إرسال طلب صداقة
     */
    public function sendFriendRequestTo(User $user, ?string $message = null): FriendRequest
    {
        return $this->sentFriendRequests()->create([
            'receiver_id' => $user->id,
            'message' => $message
        ]);
    }

    /**
     * قبول طلب صداقة
     */
    public function acceptFriendRequestFrom(User $user): bool
    {
        $request = $this->receivedFriendRequests()
            ->where('sender_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$request) {
            return false;
        }

        // تحديث حالة الطلب
        $request->update([
            'status' => 'accepted',
            'responded_at' => now()
        ]);

        // إنشاء الصداقة في الاتجاهين
        $this->createBidirectionalFriendship($user);

        return true;
    }

    /**
     * إنشاء صداقة في الاتجاهين
     */
    private function createBidirectionalFriendship(User $friend): void
    {
        $friendshipDate = now();

        // إنشاء العلاقة من جانبي
        $this->friends()->attach($friend->id, [
            'friendship_started_at' => $friendshipDate
        ]);

        $friend->friends()->attach($this->id, [
            'friendship_started_at' => $friendshipDate
        ]);

        // إنشاء الإحصائيات
        FriendshipStats::create([
            'user_id' => $this->id,
            'friend_id' => $friend->id
        ]);

        FriendshipStats::create([
            'user_id' => $friend->id,
            'friend_id' => $this->id
        ]);
    }

    public function pulses()
    {
        return $this->hasMany(Pulse::class, 'sender_id');
    }

    public function receivedPulses()
    {
        return $this->hasManyThrough(
            Pulse::class,
            PulseRecipient::class,
            'recipient_id',
            'id',
            'id',
            'pulse_id'
        );
    }
}