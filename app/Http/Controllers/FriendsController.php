<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
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
     * Display the friends page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get all accepted friendships for the current user
        $userId = Auth::id();

        $friends = Friendship::with(['sender', 'receiver'])
            ->where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->whereNull('deleted_at')
            ->whereNull('blocked_at')
            ->get();



        // Get received friend requests
        $receivedRequests = Friendship::where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->with('sender')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->id,
                    'name' => $friendship->sender->name,
                    'avatar' => $friendship->sender->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($friendship->sender->name),
                    'mutualFriends' => 0,
                    'status' => 'online',
                    'lastPulseSent' => 'منذ يومين',
                    'sentAt' => $friendship->created_at->diffForHumans(),
                    'friendship_status' => $friendship->status,
                ];
            });

        // Get sent friend requests
        $sentRequests = Friendship::where('sender_id', Auth::id())
            ->where('status', 'pending')
            ->with('receiver')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->id,
                    'name' => $friendship->receiver->name,
                    'avatar' => $friendship->receiver->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($friendship->receiver->name),
                    'mutualFriends' => 0,
                    'status' => 'online',
                    'lastPulseSent' => 'منذ يومين',
                    'sentAt' => $friendship->created_at->diffForHumans(),
                    'friendship_status' => $friendship->status,
                ];
            });

        return Inertia::render('friends/FriendsPage', [
            'friends' => $friends,
            'receivedRequests' => $receivedRequests,
            'sentRequests' => $sentRequests,
        ]);
    }


    /**
     * Search for a user by phone number
     */
    public function searchByPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        // if (!$user) {
        //     // Send invitation message
        //     $message = "مرحباً! 🎉\n\nتم دعوتك للانضمام إلى منصة نبض من قبل " . Auth::user()->name . "\n\nيمكنك تحميل التطبيق والانضمام إلينا:\nhttps://pulsse.com/download\n\nنبض - منصة التواصل الاجتماعي المميزة 🌟";

        //     try {
        //         $response = Http::get('https://whatsapp.fatora.sd/send-message', [
        //             'api_key' => "aijQZatAsXOxodJZZ9Y2xF4ObpDHij",
        //             'sender' => "249915903708",
        //             'number' => $request->phone,
        //             'message' => $message,
        //         ]);

        //         if ($response->successful()) {
        //             Log::info('Invitation message sent successfully', [
        //                 'phone' => $request->phone,
        //                 'response' => $response->json()
        //             ]);

        //             return response()->json([
        //                 'message' => 'تم إرسال دعوة للمستخدم بنجاح',
        //                 'isInvitationSent' => true
        //             ]);
        //         }
        //     } catch (\Exception $e) {
        //         Log::error('Failed to send invitation message', [
        //             'phone' => $request->phone,
        //             'error' => $e->getMessage()
        //         ]);

        //         return redirect()->back()->with('error', 'لم يتم إرسال دعوة للمستخدم');
        //     }

        //     return response()->json([
        //         'message' => 'لم يتم العثور على مستخدم بهذا الرقم'
        //     ], 404);
        // }

        // Check if the user is already a friend
        $isFriend = Friendship::where(function ($query) use ($user) {
            $query->where('sender_id', Auth::id())
                ->where('receiver_id', $user->id);
            // ->where('status', 'accepted');
        })->orWhere(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', Auth::id());
            // ->where('status', 'accepted');
        })->first();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'avatar' => $user->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($user->name),
            'friendship_status' => $isFriend ? $isFriend->status : null,
            'isFriend' => $isFriend ? true : false
        ]);
    }

    /**
     * Send a friend request
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
        ]);

        // Check if friendship already exists
        $existingFriendship = Friendship::where(function ($query) use ($request) {
            $query->where('sender_id', Auth::id())
                ->where('receiver_id', $request->userId);
        })->orWhere(function ($query) use ($request) {
            $query->where('sender_id', $request->userId)
                ->where('receiver_id', Auth::id());
        })->first();

        if ($existingFriendship) {
            if ($existingFriendship->status === 'accepted') {
                return response()->json([
                    'message' => 'أنتما أصدقاء بالفعل'
                ], 422);
            } elseif ($existingFriendship->status === 'pending') {
                return response()->json([
                    'message' => 'تم إرسال طلب الصداقة مسبقاً'
                ], 422);
            }
        }

        // Create new friendship
        Friendship::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->userId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب الصداقة بنجاح'
        ]);
    }

    public function sendInvitation(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            // create user
            $user = User::create([
                'phone' => $request->phone,
                'name' => $request->name ?? 'مستخدم جديد',
                'password' => Hash::make('12345678'),
                'avatar' => $request->avatar ?? 'https://ui-avatars.com/api/?name=' . "مستخدم جديد",
            ]);
        }

        // add to friends table
        Friendship::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'تم إرسال دعوة للمستخدم بنجاح');
    }


    private function getMutualFriendsCount($friendId)
    {
        $userId = Auth::id();

        // الحصول على أصدقاء المستخدم الحالي
        $userFriends = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->whereNull('deleted_at')
            ->whereNull('blocked_at')
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->sender_id == $userId ? $friendship->receiver_id : $friendship->sender_id;
            });

        // الحصول على أصدقاء الصديق
        $friendFriends = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($query) use ($friendId) {
                $query->where('sender_id', $friendId)
                    ->orWhere('receiver_id', $friendId);
            })
            ->whereNull('deleted_at')
            ->whereNull('blocked_at')
            ->get()
            ->map(function ($friendship) use ($friendId) {
                return $friendship->sender_id == $friendId ? $friendship->receiver_id : $friendship->sender_id;
            });

        // حساب الأصدقاء المشتركين
        return $userFriends->intersect($friendFriends)->count();
    }

    private function formatLastPulseTime($lastPulseAt)
    {
        if (!$lastPulseAt) {
            return 'لم يرسل أي pulse';
        }

        $lastPulse = Carbon::parse($lastPulseAt);
        $now = Carbon::now();

        $diffInDays = $now->diffInDays($lastPulse);

        if ($diffInDays == 0) {
            return 'اليوم';
        } elseif ($diffInDays == 1) {
            return 'أمس';
        } elseif ($diffInDays == 2) {
            return 'منذ يومين';
        } elseif ($diffInDays < 7) {
            return "منذ {$diffInDays} أيام";
        } elseif ($diffInDays < 30) {
            $weeks = floor($diffInDays / 7);
            return $weeks == 1 ? 'منذ أسبوع' : "منذ {$weeks} أسابيع";
        } else {
            $months = floor($diffInDays / 30);
            return $months == 1 ? 'منذ شهر' : "منذ {$months} أشهر";
        }
    }
}
