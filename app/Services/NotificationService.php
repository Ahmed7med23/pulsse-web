<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Pulse;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * إرسال إشعار عند استقبال نبضة
     */
    public static function sendPulseReceivedNotification($pulse, $recipientId)
    {
        try {
            $sender = $pulse->sender;

            return Notification::create([
                'user_id' => $recipientId,
                'from_user_id' => $sender->id,
                'type' => 'pulse_received',
                'title' => '💙 نبضة جديدة!',
                'message' => "أرسل لك {$sender->name} نبضة: \"{$pulse->content}\"",
                'data' => [
                    'pulse_id' => $pulse->id,
                    'pulse_content' => $pulse->content,
                    'sender_name' => $sender->name,
                    'sender_avatar' => $sender->avatar_url
                ],
                'related_id' => $pulse->id,
                'related_type' => 'Pulse',
                'action_url' => "/pulse/{$pulse->id}",
                'priority' => 'normal'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send pulse received notification', [
                'pulse_id' => $pulse->id,
                'recipient_id' => $recipientId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار عند الإعجاب بنبضة
     */
    public static function sendPulseLikedNotification($pulse, $likerId)
    {
        try {
            // لا نرسل إشعار إذا كان الشخص أعجب بنبضته نفسه
            if ($pulse->sender_id === $likerId) {
                return null;
            }

            $liker = User::find($likerId);
            if (!$liker) return null;

            return Notification::create([
                'user_id' => $pulse->sender_id,
                'from_user_id' => $likerId,
                'type' => 'pulse_liked',
                'title' => '❤️ إعجاب بنبضتك!',
                'message' => "أعجب {$liker->name} بنبضتك: \"{$pulse->content}\"",
                'data' => [
                    'pulse_id' => $pulse->id,
                    'pulse_content' => $pulse->content,
                    'liker_name' => $liker->name,
                    'liker_avatar' => $liker->avatar_url
                ],
                'related_id' => $pulse->id,
                'related_type' => 'Pulse',
                'action_url' => "/pulse/{$pulse->id}",
                'priority' => 'normal'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send pulse liked notification', [
                'pulse_id' => $pulse->id,
                'liker_id' => $likerId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار عند الرد على نبضة
     */
    public static function sendPulseRepliedNotification($originalPulse, $replyPulse)
    {
        try {
            // لا نرسل إشعار إذا كان الشخص رد على نبضته نفسه
            if ($originalPulse->sender_id === $replyPulse->sender_id) {
                return null;
            }

            $replier = $replyPulse->sender;

            return Notification::create([
                'user_id' => $originalPulse->sender_id,
                'from_user_id' => $replyPulse->sender_id,
                'type' => 'pulse_replied',
                'title' => '💬 رد على نبضتك!',
                'message' => "رد {$replier->name} على نبضتك: \"{$replyPulse->content}\"",
                'data' => [
                    'original_pulse_id' => $originalPulse->id,
                    'reply_pulse_id' => $replyPulse->id,
                    'original_content' => $originalPulse->content,
                    'reply_content' => $replyPulse->content,
                    'replier_name' => $replier->name,
                    'replier_avatar' => $replier->avatar_url
                ],
                'related_id' => $originalPulse->id,
                'related_type' => 'Pulse',
                'action_url' => "/pulse/{$originalPulse->id}",
                'priority' => 'normal'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send pulse replied notification', [
                'original_pulse_id' => $originalPulse->id,
                'reply_pulse_id' => $replyPulse->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار طلب صداقة
     */
    public static function sendFriendRequestNotification($toUserId, $fromUserId, $friendRequestId = null)
    {
        try {
            $fromUser = User::find($fromUserId);
            if (!$fromUser) return null;

            return Notification::create([
                'user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'type' => 'friend_request',
                'title' => '👥 طلب صداقة جديد!',
                'message' => "أرسل لك {$fromUser->name} طلب صداقة",
                'data' => [
                    'friend_request_id' => $friendRequestId,
                    'from_user_name' => $fromUser->name,
                    'from_user_avatar' => $fromUser->avatar_url,
                    'from_user_phone' => $fromUser->phone_number
                ],
                'related_id' => $friendRequestId,
                'related_type' => 'FriendRequest',
                'action_url' => "/friends/requests",
                'priority' => 'normal'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send friend request notification', [
                'to_user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار قبول طلب الصداقة
     */
    public static function sendFriendAcceptedNotification($toUserId, $fromUserId)
    {
        try {
            $fromUser = User::find($fromUserId);
            if (!$fromUser) return null;

            return Notification::create([
                'user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'type' => 'friend_accepted',
                'title' => '🎉 تم قبول طلب الصداقة!',
                'message' => "قبل {$fromUser->name} طلب صداقتك. أصبحتما أصدقاء الآن!",
                'data' => [
                    'from_user_name' => $fromUser->name,
                    'from_user_avatar' => $fromUser->avatar_url,
                    'friendship_started' => now()->toISOString()
                ],
                'related_id' => $fromUserId,
                'related_type' => 'User',
                'action_url' => "/profile/{$fromUserId}",
                'priority' => 'high'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send friend accepted notification', [
                'to_user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار انضمام صديق عبر الدعوة
     */
    public static function sendFriendJoinedNotification($toUserId, $fromUserId)
    {
        try {
            $fromUser = User::find($fromUserId);
            if (!$fromUser) return null;

            return Notification::create([
                'user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'type' => 'friend_joined',
                'title' => '🎉 صديقك انضم للمنصة!',
                'message' => "انضم {$fromUser->name} إلى منصة نبض من خلال دعوتك! أصبحتما أصدقاء الآن.",
                'data' => [
                    'from_user_name' => $fromUser->name,
                    'from_user_avatar' => $fromUser->avatar_url,
                    'joined_through_invitation' => true,
                    'friendship_started' => now()->toISOString()
                ],
                'related_id' => $fromUserId,
                'related_type' => 'User',
                'action_url' => "/profile/{$fromUserId}",
                'priority' => 'high'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send friend joined notification', [
                'to_user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار دعوة لدائرة
     */
    public static function sendCircleInviteNotification($toUserId, $fromUserId, $circleId, $circleName)
    {
        try {
            $fromUser = User::find($fromUserId);
            if (!$fromUser) return null;

            return Notification::create([
                'user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'type' => 'circle_invite',
                'title' => '⭕ دعوة لانضمام لدائرة!',
                'message' => "دعاك {$fromUser->name} للانضمام لدائرة \"{$circleName}\"",
                'data' => [
                    'circle_id' => $circleId,
                    'circle_name' => $circleName,
                    'inviter_name' => $fromUser->name,
                    'inviter_avatar' => $fromUser->avatar_url
                ],
                'related_id' => $circleId,
                'related_type' => 'Circle',
                'action_url' => "/circles/{$circleId}",
                'priority' => 'normal'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send circle invite notification', [
                'to_user_id' => $toUserId,
                'from_user_id' => $fromUserId,
                'circle_id' => $circleId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعار نظام
     */
    public static function sendSystemNotification($userId, $title, $message, $data = [], $priority = 'normal')
    {
        try {
            return Notification::create([
                'user_id' => $userId,
                'from_user_id' => null,
                'type' => 'system_message',
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'related_id' => null,
                'related_type' => null,
                'action_url' => $data['action_url'] ?? null,
                'priority' => $priority
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send system notification', [
                'user_id' => $userId,
                'title' => $title,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * إرسال إشعارات متعددة (bulk)
     */
    public static function sendBulkNotifications($userIds, $notificationData)
    {
        try {
            $notifications = [];
            foreach ($userIds as $userId) {
                $notifications[] = array_merge($notificationData, [
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return Notification::insert($notifications);
        } catch (\Exception $e) {
            Log::error('Failed to send bulk notifications', [
                'user_ids' => $userIds,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * حذف الإشعارات القديمة تلقائياً
     */
    public static function cleanupOldNotifications($days = 30)
    {
        try {
            $deleted = Notification::where('created_at', '<', now()->subDays($days))
                ->where('is_read', true)
                ->delete();

            Log::info("Cleaned up {$deleted} old notifications");
            return $deleted;
        } catch (\Exception $e) {
            Log::error('Failed to cleanup old notifications', [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * إحصائيات الإشعارات للمستخدم
     */
    public static function getUserNotificationStats($userId)
    {
        try {
            return [
                'total' => Notification::forUser($userId)->count(),
                'unread' => Notification::forUser($userId)->unread()->count(),
                'today' => Notification::forUser($userId)->whereDate('created_at', today())->count(),
                'week' => Notification::forUser($userId)->recent(7)->count(),
                'high_priority' => Notification::forUser($userId)->highPriority()->count(),
                'by_type' => [
                    'pulse_received' => Notification::forUser($userId)->ofType('pulse_received')->count(),
                    'pulse_liked' => Notification::forUser($userId)->ofType('pulse_liked')->count(),
                    'pulse_replied' => Notification::forUser($userId)->ofType('pulse_replied')->count(),
                    'friend_request' => Notification::forUser($userId)->ofType('friend_request')->count(),
                    'friend_accepted' => Notification::forUser($userId)->ofType('friend_accepted')->count(),
                    'friend_joined' => Notification::forUser($userId)->ofType('friend_joined')->count(),
                    'circle_invite' => Notification::forUser($userId)->ofType('circle_invite')->count(),
                    'system_message' => Notification::forUser($userId)->ofType('system_message')->count(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get user notification stats', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
