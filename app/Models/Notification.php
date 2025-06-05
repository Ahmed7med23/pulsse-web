<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'from_user_id',
        'type',
        'title',
        'message',
        'data',
        'related_id',
        'related_type',
        'action_url',
        'is_read',
        'read_at',
        'priority'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // العلاقات
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    // الحصول على العنصر المرتبط (Polymorphic)
    public function related()
    {
        if ($this->related_type && $this->related_id) {
            $modelClass = 'App\\Models\\' . $this->related_type;
            if (class_exists($modelClass)) {
                return $modelClass::find($this->related_id);
            }
        }
        return null;
    }

    // تحديد الإشعار كمقروء
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    // تحديد الإشعار كغير مقروء
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null
        ]);
    }

    // Scopes للاستعلامات الشائعة
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'high');
    }

    // دوال مساعدة لإنشاء إشعارات محددة
    public static function createPulseNotification($toUserId, $fromUserId, $pulseId, $type = 'pulse_received')
    {
        $fromUser = User::find($fromUserId);
        $pulse = Pulse::find($pulseId);

        if (!$fromUser || !$pulse) return null;

        $titles = [
            'pulse_received' => '💙 نبضة جديدة!',
            'pulse_liked' => '❤️ إعجاب بنبضتك!',
            'pulse_replied' => '💬 رد على نبضتك!'
        ];

        $messages = [
            'pulse_received' => "أرسل لك {$fromUser->name} نبضة جديدة: \"{$pulse->content}\"",
            'pulse_liked' => "أعجب {$fromUser->name} بنبضتك: \"{$pulse->content}\"",
            'pulse_replied' => "رد {$fromUser->name} على نبضتك: \"{$pulse->content}\""
        ];

        return self::create([
            'user_id' => $toUserId,
            'from_user_id' => $fromUserId,
            'type' => $type,
            'title' => $titles[$type] ?? '🔔 إشعار جديد',
            'message' => $messages[$type] ?? 'لديك إشعار جديد',
            'data' => [
                'pulse_id' => $pulseId,
                'pulse_content' => $pulse->content,
                'from_user_name' => $fromUser->name,
                'from_user_avatar' => $fromUser->avatar_url
            ],
            'related_id' => $pulseId,
            'related_type' => 'Pulse',
            'action_url' => "/pulse/{$pulseId}",
            'priority' => 'normal'
        ]);
    }

    public static function createFriendRequestNotification($toUserId, $fromUserId, $friendRequestId)
    {
        $fromUser = User::find($fromUserId);
        if (!$fromUser) return null;

        return self::create([
            'user_id' => $toUserId,
            'from_user_id' => $fromUserId,
            'type' => 'friend_request',
            'title' => '👥 طلب صداقة جديد!',
            'message' => "أرسل لك {$fromUser->name} طلب صداقة",
            'data' => [
                'friend_request_id' => $friendRequestId,
                'from_user_name' => $fromUser->name,
                'from_user_avatar' => $fromUser->avatar_url
            ],
            'related_id' => $friendRequestId,
            'related_type' => 'FriendRequest',
            'action_url' => "/friends/requests",
            'priority' => 'normal'
        ]);
    }

    public static function createFriendAcceptedNotification($toUserId, $fromUserId)
    {
        $fromUser = User::find($fromUserId);
        if (!$fromUser) return null;

        return self::create([
            'user_id' => $toUserId,
            'from_user_id' => $fromUserId,
            'type' => 'friend_accepted',
            'title' => '🎉 تم قبول طلب الصداقة!',
            'message' => "قبل {$fromUser->name} طلب صداقتك. أصبحتما أصدقاء الآن!",
            'data' => [
                'from_user_name' => $fromUser->name,
                'from_user_avatar' => $fromUser->avatar_url
            ],
            'related_id' => $fromUserId,
            'related_type' => 'User',
            'action_url' => "/profile/{$fromUserId}",
            'priority' => 'high'
        ]);
    }

    // دالة لحذف الإشعارات القديمة
    public static function cleanupOldNotifications($days = 30)
    {
        return self::where('created_at', '<', now()->subDays($days))
            ->where('is_read', true)
            ->delete();
    }

    // دالة لحساب عدد الإشعارات غير المقروءة
    public static function getUnreadCountForUser($userId)
    {
        return self::forUser($userId)->unread()->count();
    }
}
