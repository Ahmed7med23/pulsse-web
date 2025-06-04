<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\FriendRequest;
use App\Models\FriendshipStats;
use Inertia\Inertia;

class FriendshipsController extends Controller
{
    /**
     * عرض قائمة الأصدقاء
     */
    public function index()
    {
        $user = Auth::user();

        // الأصدقاء النشطين مع الإحصائيات
        $friends = $user->activeFriends()
            ->with(['friendshipStats' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($friend) use ($user) {
                $stats = $friend->friendshipStats->first();

                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'avatar' => $friend->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($friend->name),
                    'is_online' => $friend->is_online,
                    'last_active' => $friend->last_active?->diffForHumans(),
                    'pulse_strength' => $friend->pulse_strength,
                    'is_favorite' => $stats?->is_favorite ?? false,
                    'custom_nickname' => $stats?->custom_nickname,
                    'streak_days' => $stats?->streak_days ?? 0,
                    'total_pulses' => $stats?->total_pulses ?? 0,
                    'last_pulse_at' => $stats?->last_pulse_at?->diffForHumans(),
                ];
            });

        return Inertia::render('Friends/FriendsPage', [
            'friends' => $friends,
            'totalFriends' => $friends->count(),
            'favoriteFriends' => $friends->where('is_favorite', true)->count(),
        ]);
    }

    /**
     * عرض طلبات الصداقة
     */
    public function requests()
    {
        $user = Auth::user();

        // الطلبات الواردة
        $receivedRequests = $user->receivedFriendRequests()
            ->pending()
            ->with('sender')
            ->latest()
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'sender' => [
                        'id' => $request->sender->id,
                        'name' => $request->sender->name,
                        'avatar' => $request->sender->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($request->sender->name),
                        'city' => $request->sender->city,
                        'mutual_friends' => 0, // TODO: حساب الأصدقاء المشتركين
                    ],
                    'message' => $request->message,
                    'sent_at' => $request->created_at->diffForHumans(),
                ];
            });

        // الطلبات المرسلة
        $sentRequests = $user->sentFriendRequests()
            ->pending()
            ->with('receiver')
            ->latest()
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'receiver' => [
                        'id' => $request->receiver->id,
                        'name' => $request->receiver->name,
                        'avatar' => $request->receiver->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($request->receiver->name),
                    ],
                    'message' => $request->message,
                    'sent_at' => $request->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Friends/RequestsPage', [
            'receivedRequests' => $receivedRequests,
            'sentRequests' => $sentRequests,
        ]);
    }

    /**
     * إرسال طلب صداقة
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:255',
        ]);

        $currentUser = Auth::user();
        $targetUser = User::findOrFail($request->user_id);

        // التحقق من عدم إرسال طلب لنفس المستخدم
        if ($currentUser->id === $targetUser->id) {
            return response()->json([
                'message' => 'لا يمكنك إرسال طلب صداقة لنفسك'
            ], 400);
        }

        // التحقق من عدم وجود صداقة مسبقة
        if ($currentUser->isFriendWith($targetUser)) {
            return response()->json([
                'message' => 'أنتما أصدقاء بالفعل'
            ], 400);
        }

        // التحقق من عدم وجود طلب معلق
        if ($currentUser->hasPendingFriendRequestWith($targetUser)) {
            return response()->json([
                'message' => 'لديك طلب صداقة معلق مع هذا المستخدم'
            ], 400);
        }

        // إرسال الطلب
        $friendRequest = $currentUser->sendFriendRequestTo($targetUser, $request->message);

        return response()->json([
            'message' => 'تم إرسال طلب الصداقة بنجاح',
            'request' => [
                'id' => $friendRequest->id,
                'receiver_name' => $targetUser->name,
                'sent_at' => $friendRequest->created_at->diffForHumans(),
            ]
        ]);
    }

    /**
     * قبول طلب صداقة
     */
    public function acceptRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friend_requests,id',
        ]);

        $currentUser = Auth::user();
        $friendRequest = FriendRequest::findOrFail($request->request_id);

        // التحقق من أن الطلب موجه للمستخدم الحالي
        if ($friendRequest->receiver_id !== $currentUser->id) {
            return response()->json([
                'message' => 'غير مخول لك قبول هذا الطلب'
            ], 403);
        }

        // التحقق من أن الطلب لا يزال معلقاً
        if ($friendRequest->status !== 'pending') {
            return response()->json([
                'message' => 'هذا الطلب لم يعد معلقاً'
            ], 400);
        }

        $sender = $friendRequest->sender;
        $success = $currentUser->acceptFriendRequestFrom($sender);

        if ($success) {
            return response()->json([
                'message' => 'تم قبول طلب الصداقة بنجاح',
                'friend' => [
                    'id' => $sender->id,
                    'name' => $sender->name,
                    'avatar' => $sender->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($sender->name),
                ]
            ]);
        }

        return response()->json([
            'message' => 'حدث خطأ أثناء قبول طلب الصداقة'
        ], 500);
    }

    /**
     * رفض طلب صداقة
     */
    public function rejectRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friend_requests,id',
        ]);

        $currentUser = Auth::user();
        $friendRequest = FriendRequest::findOrFail($request->request_id);

        // التحقق من الصلاحيات
        if ($friendRequest->receiver_id !== $currentUser->id) {
            return response()->json([
                'message' => 'غير مخول لك رفض هذا الطلب'
            ], 403);
        }

        $friendRequest->update([
            'status' => 'rejected',
            'responded_at' => now()
        ]);

        return response()->json([
            'message' => 'تم رفض طلب الصداقة'
        ]);
    }

    /**
     * إلغاء طلب صداقة مرسل
     */
    public function cancelRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friend_requests,id',
        ]);

        $currentUser = Auth::user();
        $friendRequest = FriendRequest::findOrFail($request->request_id);

        // التحقق من الصلاحيات
        if ($friendRequest->sender_id !== $currentUser->id) {
            return response()->json([
                'message' => 'غير مخول لك إلغاء هذا الطلب'
            ], 403);
        }

        $friendRequest->update([
            'status' => 'cancelled',
            'responded_at' => now()
        ]);

        return response()->json([
            'message' => 'تم إلغاء طلب الصداقة'
        ]);
    }

    /**
     * حظر/إلغاء حظر صديق
     */
    public function toggleBlock(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $currentUser = Auth::user();
        $friend = User::findOrFail($request->friend_id);

        // التحقق من وجود صداقة
        if (!$currentUser->isFriendWith($friend)) {
            return response()->json([
                'message' => 'لستما أصدقاء'
            ], 400);
        }

        $friendship = $currentUser->friends()
            ->where('friend_id', $friend->id)
            ->first();

        $isBlocked = $friendship->pivot->is_blocked;

        // تبديل حالة الحظر
        $currentUser->friends()->updateExistingPivot($friend->id, [
            'is_blocked' => !$isBlocked,
            'blocked_at' => !$isBlocked ? now() : null,
        ]);

        $action = !$isBlocked ? 'حظر' : 'إلغاء حظر';

        return response()->json([
            'message' => "تم {$action} {$friend->name} بنجاح",
            'is_blocked' => !$isBlocked
        ]);
    }

    /**
     * تبديل المفضلة
     */
    public function toggleFavorite(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $currentUser = Auth::user();
        $friendId = $request->friend_id;

        $stats = FriendshipStats::where('user_id', $currentUser->id)
            ->where('friend_id', $friendId)
            ->first();

        if (!$stats) {
            return response()->json([
                'message' => 'إحصائيات الصداقة غير موجودة'
            ], 404);
        }

        $stats->update([
            'is_favorite' => !$stats->is_favorite
        ]);

        $action = $stats->is_favorite ? 'إضافة إلى' : 'إزالة من';

        return response()->json([
            'message' => "تم {$action} المفضلة بنجاح",
            'is_favorite' => $stats->is_favorite
        ]);
    }
}
