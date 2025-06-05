<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FriendRequest;
use App\Models\FriendshipStats;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FriendsController extends Controller
{
    /**
     * Display the friends page with all categories
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $userId = Auth::id();

        return Inertia::render('friends/FriendsPage', [
            'acceptedFriends' => $this->getAcceptedFriends($userId),
            'receivedRequests' => $this->getReceivedRequests($userId),
            'sentRequests' => $this->getSentRequests($userId),
            'favoriteFriends' => $this->getFavoriteFriends($userId),
            'friendsStats' => $this->getFriendsStats($userId),
        ]);
    }

    /**
     * جلب الأصدقاء المقبولين (المؤكدين)
     */
    private function getAcceptedFriends($userId)
    {
        return User::query()
            ->join('user_friendships', function ($join) use ($userId) {
                $join->on('users.id', '=', 'user_friendships.friend_id')
                    ->where('user_friendships.user_id', '=', $userId)
                    ->where('user_friendships.is_blocked', '=', false);
            })
            ->leftJoin('friendship_stats', function ($join) use ($userId) {
                $join->on('users.id', '=', 'friendship_stats.friend_id')
                    ->where('friendship_stats.user_id', '=', $userId);
            })
            ->select([
                'users.id',
                'users.name',
                'users.avatar_url',
                'users.phone',
                'users.last_active',
                'users.is_online',
                'user_friendships.friendship_started_at',
                'friendship_stats.total_pulses',
                'friendship_stats.last_pulse_at',
                'friendship_stats.is_favorite',
                'friendship_stats.custom_nickname',
                'friendship_stats.streak_days',
                'friendship_stats.response_rate'
            ])
            ->orderBy('friendship_stats.is_favorite', 'desc')
            ->orderBy('friendship_stats.last_pulse_at', 'desc')
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->custom_nickname ?: $friend->name,
                    'originalName' => $friend->name,
                    'avatar' => $friend->avatar_url ?: $this->generateAvatar($friend->name),
                    'phone' => $this->maskPhone($friend->phone),
                    'isOnline' => $friend->is_online,
                    'lastActive' => $friend->last_active ? \Carbon\Carbon::parse($friend->last_active)->diffForHumans() : null,
                    'friendshipStarted' => $friend->friendship_started_at ? \Carbon\Carbon::parse($friend->friendship_started_at)->diffForHumans() : 'غير محدد',
                    'totalPulses' => $friend->total_pulses ?: 0,
                    'lastPulse' => $friend->last_pulse_at ? \Carbon\Carbon::parse($friend->last_pulse_at)->diffForHumans() : 'لم يرسل نبضة',
                    'isFavorite' => (bool) $friend->is_favorite,
                    'streakDays' => $friend->streak_days ?: 0,
                    'responseRate' => $friend->response_rate ?: 0,
                    'status' => 'accepted'
                ];
            });
    }

    /**
     * جلب طلبات الصداقة المستقبلة (المعلقة)
     */
    private function getReceivedRequests($userId)
    {
        return FriendRequest::where('receiver_id', $userId)
            ->where('status', 'pending')
            ->with(['sender' => function ($query) {
                $query->select('id', 'name', 'avatar_url', 'phone', 'last_active', 'is_online');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) use ($userId) {
                return [
                    'id' => $request->id,
                    'requestId' => $request->id,
                    'userId' => $request->sender->id,
                    'name' => $request->sender->name,
                    'avatar' => $request->sender->avatar_url ?: $this->generateAvatar($request->sender->name),
                    'phone' => $this->maskPhone($request->sender->phone),
                    'isOnline' => $request->sender->is_online,
                    'lastActive' => $request->sender->last_active ? \Carbon\Carbon::parse($request->sender->last_active)->diffForHumans() : null,
                    'message' => $request->message,
                    'sentAt' => $request->created_at->diffForHumans(),
                    'mutualFriends' => $this->getMutualFriendsCount($request->sender->id, $userId),
                    'status' => 'received_pending'
                ];
            });
    }

    /**
     * جلب طلبات الصداقة المرسلة (المعلقة)
     */
    private function getSentRequests($userId)
    {
        return FriendRequest::where('sender_id', $userId)
            ->where('status', 'pending')
            ->with(['receiver' => function ($query) {
                $query->select('id', 'name', 'avatar_url', 'phone', 'last_active', 'is_online');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) use ($userId) {
                return [
                    'id' => $request->id,
                    'requestId' => $request->id,
                    'userId' => $request->receiver->id,
                    'name' => $request->receiver->name,
                    'avatar' => $request->receiver->avatar_url ?: $this->generateAvatar($request->receiver->name),
                    'phone' => $this->maskPhone($request->receiver->phone),
                    'isOnline' => $request->receiver->is_online,
                    'lastActive' => $request->receiver->last_active ? \Carbon\Carbon::parse($request->receiver->last_active)->diffForHumans() : null,
                    'message' => $request->message,
                    'sentAt' => $request->created_at->diffForHumans(),
                    'mutualFriends' => $this->getMutualFriendsCount($request->receiver->id, $userId),
                    'status' => 'sent_pending'
                ];
            });
    }

    /**
     * جلب الأصدقاء المفضلين
     */
    private function getFavoriteFriends($userId)
    {
        return User::query()
            ->join('user_friendships', function ($join) use ($userId) {
                $join->on('users.id', '=', 'user_friendships.friend_id')
                    ->where('user_friendships.user_id', '=', $userId)
                    ->where('user_friendships.is_blocked', '=', false);
            })
            ->join('friendship_stats', function ($join) use ($userId) {
                $join->on('users.id', '=', 'friendship_stats.friend_id')
                    ->where('friendship_stats.user_id', '=', $userId)
                    ->where('friendship_stats.is_favorite', '=', true);
            })
            ->select([
                'users.id',
                'users.name',
                'users.avatar_url',
                'friendship_stats.custom_nickname',
                'friendship_stats.total_pulses',
                'friendship_stats.last_pulse_at',
                'friendship_stats.streak_days'
            ])
            ->orderBy('friendship_stats.last_pulse_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->custom_nickname ?: $friend->name,
                    'avatar' => $friend->avatar_url ?: $this->generateAvatar($friend->name),
                    'totalPulses' => $friend->total_pulses ?: 0,
                    'lastPulse' => $friend->last_pulse_at ? \Carbon\Carbon::parse($friend->last_pulse_at)->diffForHumans() : 'لم يرسل نبضة',
                    'streakDays' => $friend->streak_days ?: 0,
                ];
            });
    }

    /**
     * جلب إحصائيات الأصدقاء العامة
     */
    private function getFriendsStats($userId)
    {
        $totalFriends = DB::table('user_friendships')
            ->where('user_id', $userId)
            ->where('is_blocked', false)
            ->count();

        $pendingReceived = FriendRequest::where('receiver_id', $userId)
            ->where('status', 'pending')
            ->count();

        $pendingSent = FriendRequest::where('sender_id', $userId)
            ->where('status', 'pending')
            ->count();

        $favorites = FriendshipStats::where('user_id', $userId)
            ->where('is_favorite', true)
            ->count();

        $totalPulsesSent = FriendshipStats::where('user_id', $userId)
            ->sum('pulses_sent');

        $totalPulsesReceived = FriendshipStats::where('user_id', $userId)
            ->sum('pulses_received');

        return [
            'totalFriends' => $totalFriends,
            'pendingReceived' => $pendingReceived,
            'pendingSent' => $pendingSent,
            'favorites' => $favorites,
            'totalPulsesSent' => $totalPulsesSent,
            'totalPulsesReceived' => $totalPulsesReceived,
            'averageResponseRate' => FriendshipStats::where('user_id', $userId)->avg('response_rate') ?: 0,
        ];
    }

    /**
     * Search for a user by phone number
     */
    public function searchByPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        // Clean phone number - remove spaces and any special characters
        $cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $request->phone);

        $user = User::where('phone', $cleanPhone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'لم يتم العثور على مستخدم بهذا الرقم'
            ], 404);
        }

        // Check if current user is blocked by the target user
        $isCurrentUserBlocked = $this->isBlockedByUser($user->id, Auth::id());
        if ($isCurrentUserBlocked) {
            return response()->json([
                'message' => 'عفواً، هذا المستخدم غير موجود'
            ], 404);
        }

        // Check if there's already a friendship or request
        $existingFriendship = $this->checkExistingRelationship($user->id);

        // If there's a previous cancelled/rejected request, show appropriate message
        if (in_array($existingFriendship, ['previously_cancelled', 'previously_rejected'])) {
            return response()->json([
                'message' => 'لا يمكن إرسال طلب صداقة لهذا المستخدم في الوقت الحالي'
            ], 422);
        }

        // Get request ID if there's a pending request
        $requestId = $this->getRelatedRequestId($user->id, $existingFriendship);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $this->maskPhone($user->phone),
            'avatar' => $user->avatar_url ?: $this->generateAvatar($user->name),
            'isOnline' => $user->is_online,
            'lastActive' => $user->last_active ? \Carbon\Carbon::parse($user->last_active)->diffForHumans() : null,
            'relationshipStatus' => $existingFriendship,
            'requestId' => $requestId,
            'mutualFriends' => $this->getMutualFriendsCount($user->id, Auth::id())
        ]);
    }

    /**
     * Send a friend request
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $receiverId = $request->userId;
        $senderId = Auth::id();

        // Check if current user is blocked by the target user
        $isCurrentUserBlocked = $this->isBlockedByUser($receiverId, $senderId);
        if ($isCurrentUserBlocked) {
            return response()->json([
                'message' => 'عفواً، لا يمكن إرسال طلب صداقة لهذا المستخدم'
            ], 422);
        }

        // Check if friendship already exists
        $existingRelationship = $this->checkExistingRelationship($receiverId);

        if ($existingRelationship !== 'none') {
            $messages = [
                'accepted' => 'أنتما أصدقاء بالفعل',
                'pending_sent' => 'تم إرسال طلب الصداقة مسبقاً',
                'pending_received' => 'لديك طلب صداقة من هذا المستخدم، يمكنك قبوله',
                'blocked' => 'لا يمكن إرسال طلب صداقة لهذا المستخدم',
                'previously_cancelled' => 'لا يمكن إرسال طلب صداقة لهذا المستخدم في الوقت الحالي',
                'previously_rejected' => 'لا يمكن إرسال طلب صداقة لهذا المستخدم في الوقت الحالي'
            ];

            return response()->json([
                'message' => $messages[$existingRelationship] ?? 'يوجد علاقة موجودة بالفعل'
            ], 422);
        }

        // Create new friend request
        $friendRequest = FriendRequest::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        // إرسال إشعار للمستخدم المستهدف
        NotificationService::sendFriendRequestNotification($receiverId, $senderId, $friendRequest->id);

        return response()->json([
            'message' => 'تم إرسال طلب الصداقة بنجاح',
            'request' => [
                'id' => $friendRequest->id,
                'sentAt' => $friendRequest->created_at->diffForHumans()
            ]
        ]);
    }

    /**
     * Accept a friend request
     */
    public function acceptRequest(Request $request)
    {
        $request->validate([
            'requestId' => 'required|exists:friend_requests,id',
        ]);

        $friendRequest = FriendRequest::where('id', $request->requestId)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'طلب الصداقة غير موجود أو تم الرد عليه مسبقاً'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Update friend request status
            $friendRequest->update([
                'status' => 'accepted',
                'responded_at' => now()
            ]);

            // Create bidirectional friendship
            $this->createBidirectionalFriendship(Auth::id(), $friendRequest->sender_id);

            // إرسال إشعار لمرسل الطلب بأنه تم قبوله
            NotificationService::sendFriendAcceptedNotification($friendRequest->sender_id, Auth::id());

            DB::commit();

            return response()->json([
                'message' => 'تم قبول طلب الصداقة بنجاح'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to accept friend request', [
                'requestId' => $request->requestId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'حدث خطأ أثناء قبول طلب الصداقة'
            ], 500);
        }
    }

    /**
     * Reject a friend request
     */
    public function rejectRequest(Request $request)
    {
        $request->validate([
            'requestId' => 'required|exists:friend_requests,id',
        ]);

        $friendRequest = FriendRequest::where('id', $request->requestId)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'طلب الصداقة غير موجود أو تم الرد عليه مسبقاً'
            ], 404);
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
     * Cancel a sent friend request
     */
    public function cancelRequest(Request $request)
    {
        $request->validate([
            'requestId' => 'required|exists:friend_requests,id',
        ]);

        $friendRequest = FriendRequest::where('id', $request->requestId)
            ->where('sender_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'طلب الصداقة غير موجود أو تم الرد عليه مسبقاً'
            ], 404);
        }

        $friendRequest->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'تم إلغاء طلب الصداقة'
        ]);
    }

    /**
     * Send WhatsApp invitation to non-user
     */
    public function sendInvitation(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        // Clean phone number - remove spaces and any special characters
        $cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $request->phone);

        // Normalize Saudi phone numbers
        if (strlen($cleanPhone) === 9 && substr($cleanPhone, 0, 1) === '5') {
            $cleanPhone = '966' . $cleanPhone;
        } elseif (strlen($cleanPhone) === 10 && substr($cleanPhone, 0, 2) === '05') {
            $cleanPhone = '966' . substr($cleanPhone, 1);
        }

        // Check if invitation already exists
        $existingInvitation = \App\Models\Invitation::where('inviter_id', Auth::id())
            ->where('invited_phone', $cleanPhone)
            ->where('status', 'sent')
            ->first();

        if ($existingInvitation) {
            return redirect()->back()->with('error', 'تم إرسال دعوة لهذا الرقم مسبقاً في ' . $existingInvitation->sent_at->format('Y-m-d'));
        }

        // Create invitation record
        $invitation = \App\Models\Invitation::create([
            'inviter_id' => Auth::id(),
            'invited_phone' => $cleanPhone,
            'status' => 'sent',
            'invitation_code' => 'INV-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'sent_at' => now(),
        ]);

        $inviterName = Auth::user()->name;
        $registrationLink = "https://pulsse.online/register?invitation=" . $invitation->invitation_code;

        $message = "مرحباً! 🎉\n\nتم دعوتك للانضمام إلى منصة نبض من قبل {$inviterName}\n\nسجل الآن واستمتع بتجربة التواصل المميزة:\n{$registrationLink}\n\nكود الدعوة: {$invitation->invitation_code}\n\nنبض - منصة التواصل الاجتماعي المميزة 🌟";

        try {
            $response = Http::get('https://whatsapp.fatora.sd/send-message', [
                'api_key' => "aijQZatAsXOxodJZZ9Y2xF4ObpDHij",
                'sender' => "249915903708",
                'number' => $cleanPhone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info('Invitation message sent successfully', [
                    'invitation_id' => $invitation->id,
                    'original_phone' => $request->phone,
                    'cleaned_phone' => $cleanPhone,
                    'invitation_code' => $invitation->invitation_code,
                    'response' => $response->json()
                ]);

                return redirect()->back()->with('success', 'تم إرسال دعوة للمستخدم بنجاح عبر WhatsApp! 📱 يمكنك متابعة حالة الدعوة من صفحة الدعوات.');
            } else {
                // Delete invitation if WhatsApp sending failed
                $invitation->delete();

                Log::error('WhatsApp API returned unsuccessful response', [
                    'original_phone' => $request->phone,
                    'cleaned_phone' => $cleanPhone,
                    'response' => $response->json()
                ]);

                return redirect()->back()->with('error', 'فشل إرسال الدعوة عبر WhatsApp. يرجى المحاولة مرة أخرى.');
            }
        } catch (\Exception $e) {
            // Delete invitation if sending failed
            $invitation->delete();

            Log::error('Failed to send invitation message', [
                'original_phone' => $request->phone,
                'cleaned_phone' => $cleanPhone,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'لم يتم إرسال دعوة للمستخدم. يرجى المحاولة مرة أخرى.');
        }

        return redirect()->back()->with('error', 'فشل إرسال الدعوة. يرجى المحاولة مرة أخرى.');
    }

    /**
     * Display sent invitations page
     */
    public function invitations()
    {
        $userId = Auth::id();

        $sentInvitations = \App\Models\Invitation::where('inviter_id', $userId)
            ->orderBy('sent_at', 'desc')
            ->get()
            ->map(function ($invitation) {
                return [
                    'id' => $invitation->id,
                    'phone' => $invitation->invited_phone,
                    'status' => $invitation->status,
                    'invitation_code' => $invitation->invitation_code,
                    'sent_at' => $invitation->sent_at->diffForHumans(),
                    'registered_at' => $invitation->registered_at ? $invitation->registered_at->diffForHumans() : null,
                    'invited_user' => $invitation->invitedUser ? [
                        'id' => $invitation->invitedUser->id,
                        'name' => $invitation->invitedUser->name,
                        'avatar' => $invitation->invitedUser->avatar_url ?: $this->generateAvatar($invitation->invitedUser->name),
                    ] : null,
                ];
            });

        $stats = [
            'total_sent' => $sentInvitations->count(),
            'registered' => $sentInvitations->where('status', 'registered')->count(),
            'pending' => $sentInvitations->where('status', 'sent')->count(),
        ];

        return Inertia::render('friends/InvitationsPage', [
            'sentInvitations' => $sentInvitations,
            'stats' => $stats,
        ]);
    }

    // Helper Methods

    /**
     * Check existing relationship between current user and target user
     */
    private function checkExistingRelationship($targetUserId)
    {
        $currentUserId = Auth::id();

        // Check if they're already friends
        $friendship = DB::table('user_friendships')
            ->where('user_id', $currentUserId)
            ->where('friend_id', $targetUserId)
            ->where('is_blocked', false)
            ->first();

        if ($friendship) {
            return 'accepted';
        }

        // Check for blocked relationship (from current user's side)
        $blockedByCurrentUser = DB::table('user_friendships')
            ->where('user_id', $currentUserId)
            ->where('friend_id', $targetUserId)
            ->where('is_blocked', true)
            ->first();

        // Check for blocked relationship (from target user's side)
        $blockedByTargetUser = DB::table('user_friendships')
            ->where('user_id', $targetUserId)
            ->where('friend_id', $currentUserId)
            ->where('is_blocked', true)
            ->first();

        if ($blockedByCurrentUser || $blockedByTargetUser) {
            return 'blocked';
        }

        // Check for pending friend requests
        $sentRequest = FriendRequest::where('sender_id', $currentUserId)
            ->where('receiver_id', $targetUserId)
            ->where('status', 'pending')
            ->first();

        if ($sentRequest) {
            return 'pending_sent';
        }

        $receivedRequest = FriendRequest::where('sender_id', $targetUserId)
            ->where('receiver_id', $currentUserId)
            ->where('status', 'pending')
            ->first();

        if ($receivedRequest) {
            return 'pending_received';
        }

        // Check for cancelled or rejected requests (indicating previous interaction)
        $previousRequest = FriendRequest::where(function ($query) use ($currentUserId, $targetUserId) {
            $query->where('sender_id', $currentUserId)
                ->where('receiver_id', $targetUserId);
        })->orWhere(function ($query) use ($currentUserId, $targetUserId) {
            $query->where('sender_id', $targetUserId)
                ->where('receiver_id', $currentUserId);
        })->whereIn('status', ['cancelled', 'rejected'])
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($previousRequest) {
            if ($previousRequest->status === 'cancelled') {
                return 'previously_cancelled';
            } elseif ($previousRequest->status === 'rejected') {
                return 'previously_rejected';
            }
        }

        return 'none';
    }

    /**
     * Create bidirectional friendship
     */
    private function createBidirectionalFriendship($userId1, $userId2)
    {
        $friendshipDate = now();

        // Create friendship records in both directions
        DB::table('user_friendships')->insert([
            [
                'user_id' => $userId1,
                'friend_id' => $userId2,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => false,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ],
            [
                'user_id' => $userId2,
                'friend_id' => $userId1,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => false,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ]
        ]);

        // Create friendship stats for both users
        FriendshipStats::insert([
            [
                'user_id' => $userId1,
                'friend_id' => $userId2,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ],
            [
                'user_id' => $userId2,
                'friend_id' => $userId1,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ]
        ]);
    }

    /**
     * Generate avatar URL for user
     */
    private function generateAvatar($name)
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=EC4899&color=ffffff&size=128';
    }

    /**
     * Mask phone number for privacy
     */
    private function maskPhone($phone)
    {
        if (strlen($phone) <= 4) {
            return $phone;
        }

        $visible = substr($phone, 0, 3);
        $hidden = str_repeat('*', strlen($phone) - 6);
        $end = substr($phone, -3);

        return $visible . $hidden . $end;
    }

    /**
     * Get mutual friends count between two users
     */
    private function getMutualFriendsCount($friendId, $userId)
    {
        // Get friends of the current user
        $userFriends = DB::table('user_friendships')
            ->where('user_id', $userId)
            ->where('is_blocked', false)
            ->pluck('friend_id')
            ->toArray();

        // Get friends of the target user
        $targetFriends = DB::table('user_friendships')
            ->where('user_id', $friendId)
            ->where('is_blocked', false)
            ->pluck('friend_id')
            ->toArray();

        // Count mutual friends
        return count(array_intersect($userFriends, $targetFriends));
    }

    /**
     * Format last pulse time for display
     */
    private function formatLastPulseTime($lastPulseAt)
    {
        if (!$lastPulseAt) {
            return 'لم يرسل نبضة';
        }

        $diffInHours = Carbon::parse($lastPulseAt)->diffInHours(now());

        if ($diffInHours < 1) {
            return 'منذ دقائق';
        } elseif ($diffInHours < 24) {
            return 'منذ ' . $diffInHours . ' ساعة';
        } elseif ($diffInHours < 168) { // أسبوع
            $days = intval($diffInHours / 24);
            return 'منذ ' . $days . ' يوم';
        } else {
            return Carbon::parse($lastPulseAt)->format('Y-m-d');
        }
    }

    /**
     * Get related request ID based on existing relationship
     */
    private function getRelatedRequestId($userId, $relationship)
    {
        switch ($relationship) {
            case 'pending_sent':
                return FriendRequest::where('sender_id', Auth::id())
                    ->where('receiver_id', $userId)
                    ->where('status', 'pending')
                    ->value('id');
            case 'pending_received':
                return FriendRequest::where('sender_id', $userId)
                    ->where('receiver_id', Auth::id())
                    ->where('status', 'pending')
                    ->value('id');
            case 'previously_cancelled':
            case 'previously_rejected':
                // Return the most recent request for reference
                return FriendRequest::where(function ($query) use ($userId) {
                    $query->where('sender_id', Auth::id())
                        ->where('receiver_id', $userId);
                })->orWhere(function ($query) use ($userId) {
                    $query->where('sender_id', $userId)
                        ->where('receiver_id', Auth::id());
                })->whereIn('status', ['cancelled', 'rejected'])
                    ->orderBy('updated_at', 'desc')
                    ->value('id');
            default:
                return null;
        }
    }

    /**
     * Check if current user is blocked by the target user or vice versa
     */
    private function isBlockedByUser($targetUserId, $currentUserId)
    {
        // Check if current user is blocked by target user
        $blockedByTarget = DB::table('user_friendships')
            ->where('user_id', $targetUserId)
            ->where('friend_id', $currentUserId)
            ->where('is_blocked', true)
            ->first();

        // Check if target user is blocked by current user
        $blockedByCurrentUser = DB::table('user_friendships')
            ->where('user_id', $currentUserId)
            ->where('friend_id', $targetUserId)
            ->where('is_blocked', true)
            ->first();

        return $blockedByTarget || $blockedByCurrentUser ? true : false;
    }
}
