<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * عرض قائمة الإشعارات
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Notification::forUser($user->id)
            ->with(['fromUser:id,name,avatar_url'])
            ->orderBy('created_at', 'desc');

        // فلترة حسب النوع
        if ($request->has('type') && $request->type !== 'all') {
            $query->ofType($request->type);
        }

        // فلترة حسب حالة القراءة
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        $notifications = $query->paginate(15);

        // إحصائيات
        $stats = [
            'total' => Notification::forUser($user->id)->count(),
            'unread' => Notification::forUser($user->id)->unread()->count(),
            'today' => Notification::forUser($user->id)->whereDate('created_at', today())->count(),
            'week' => Notification::forUser($user->id)->recent(7)->count(),
            'by_type' => [
                'pulse_received' => Notification::forUser($user->id)->ofType('pulse_received')->count(),
                'pulse_liked' => Notification::forUser($user->id)->ofType('pulse_liked')->count(),
                'pulse_replied' => Notification::forUser($user->id)->ofType('pulse_replied')->count(),
                'friend_request' => Notification::forUser($user->id)->ofType('friend_request')->count(),
                'friend_accepted' => Notification::forUser($user->id)->ofType('friend_accepted')->count(),
                'circle_invite' => Notification::forUser($user->id)->ofType('circle_invite')->count(),
                'circle_joined' => Notification::forUser($user->id)->ofType('circle_joined')->count(),
                'system_message' => Notification::forUser($user->id)->ofType('system_message')->count(),
            ]
        ];

        return Inertia::render('Notifications/NotificationsPage', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => [
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
            ]
        ]);
    }

    /**
     * الحصول على الإشعارات غير المقروءة (API)
     */
    public function getUnread(Request $request)
    {
        $user = Auth::user();

        $notifications = Notification::forUser($user->id)
            ->unread()
            ->with(['fromUser:id,name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->limit($request->get('limit', 10))
            ->get();

        $unreadCount = Notification::getUnreadCountForUser($user->id);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'has_more' => $notifications->count() >= ($request->get('limit', 10))
        ]);
    }

    /**
     * تحديد إشعار واحد كمقروء
     */
    public function markAsRead(Notification $notification)
    {
        // التحقق من أن الإشعار يخص المستخدم الحالي
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'تم تحديد الإشعار كمقروء',
            'notification' => $notification
        ]);
    }

    /**
     * تحديد جميع الإشعارات كمقروءة
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        $updated = Notification::forUser($user->id)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json([
            'message' => 'تم تحديد جميع الإشعارات كمقروءة',
            'updated_count' => $updated
        ]);
    }

    /**
     * حذف إشعار
     */
    public function destroy(Notification $notification)
    {
        // التحقق من أن الإشعار يخص المستخدم الحالي
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'تم حذف الإشعار'
        ]);
    }

    /**
     * حذف جميع الإشعارات المقروءة
     */
    public function clearRead()
    {
        $user = Auth::user();

        $deleted = Notification::forUser($user->id)
            ->read()
            ->delete();

        return response()->json([
            'message' => 'تم حذف الإشعارات المقروءة',
            'deleted_count' => $deleted
        ]);
    }

    /**
     * فتح إشعار وتوجيه المستخدم
     */
    public function open(Notification $notification)
    {
        // التحقق من أن الإشعار يخص المستخدم الحالي
        if ($notification->user_id !== Auth::id()) {
            return redirect()->back()->with('error', 'غير مصرح');
        }

        // تحديد الإشعار كمقروء
        $notification->markAsRead();

        // التوجيه حسب نوع الإشعار
        switch ($notification->type) {
            case 'pulse_received':
            case 'pulse_liked':
            case 'pulse_replied':
                if ($notification->related_id) {
                    return redirect()->route('pulse.show', $notification->related_id);
                }
                break;

            case 'friend_request':
                return redirect()->route('friends.requests');

            case 'friend_accepted':
                if ($notification->from_user_id) {
                    return redirect()->route('profile.show', $notification->from_user_id);
                }
                break;

            case 'circle_invite':
            case 'circle_joined':
                if ($notification->related_id) {
                    return redirect()->route('circles.show', $notification->related_id);
                }
                break;

            default:
                if ($notification->action_url) {
                    return redirect($notification->action_url);
                }
                break;
        }

        // إذا لم يوجد رابط محدد، العودة للصفحة الرئيسية
        return redirect()->route('home');
    }

    /**
     * الحصول على إحصائيات الإشعارات
     */
    public function getStats()
    {
        $user = Auth::user();

        $stats = [
            'total' => Notification::forUser($user->id)->count(),
            'unread' => Notification::forUser($user->id)->unread()->count(),
            'today' => Notification::forUser($user->id)->whereDate('created_at', today())->count(),
            'week' => Notification::forUser($user->id)->recent(7)->count(),
            'by_type' => [
                'pulse_received' => Notification::forUser($user->id)->ofType('pulse_received')->count(),
                'pulse_liked' => Notification::forUser($user->id)->ofType('pulse_liked')->count(),
                'pulse_replied' => Notification::forUser($user->id)->ofType('pulse_replied')->count(),
                'friend_request' => Notification::forUser($user->id)->ofType('friend_request')->count(),
                'friend_accepted' => Notification::forUser($user->id)->ofType('friend_accepted')->count(),
            ]
        ];

        return response()->json($stats);
    }

    /**
     * تفعيل/إيقاف نوع معين من الإشعارات
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'enabled' => 'required|boolean'
        ]);

        $user = Auth::user();

        // حفظ تفضيلات الإشعارات في جدول منفصل أو في بيانات المستخدم
        // يمكن تطوير هذا لاحقاً حسب الحاجة

        return response()->json([
            'message' => 'تم تحديث تفضيلات الإشعارات'
        ]);
    }

    /**
     * تنظيف الإشعارات القديمة (دالة للصيانة)
     */
    public function cleanup(Request $request)
    {
        $days = $request->get('days', 30);
        $deleted = Notification::cleanupOldNotifications($days);

        return response()->json([
            'message' => "تم حذف {$deleted} إشعار قديم",
            'deleted_count' => $deleted
        ]);
    }
}
