<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CirclesController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PulsesController;
use App\Http\Controllers\PulseReactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Routes requiring authentication and verification
Route::middleware(['auth', 'verified-user'])->group(function () {

    Route::get('/', [PulsesController::class, 'index'])->name('home');

    Route::get('/profile', [HomeController::class, 'profile'])->name('profile');


    Route::get('/circles', [CirclesController::class, 'index'])->name('circles');
    Route::post('/circles', [CirclesController::class, 'store'])->name('circles.store');
    Route::get('/circles/{circle}', [CirclesController::class, 'show'])->name('circles.show');
    Route::get('/api/circles/{circle}/members', [CirclesController::class, 'getCircleMembers'])->name('circles.members');
    Route::get('/api/circles/user-circles', [CirclesController::class, 'getUserCircles'])->name('circles.user-circles');
    Route::get('/api/circles/friend-circles', [CirclesController::class, 'getFriendCircles'])->name('circles.friend-circles');
    Route::post('/api/circles/add-member', [CirclesController::class, 'addMember'])->name('circles.add-member');
    Route::post('/api/circles/remove-member', [CirclesController::class, 'removeMember'])->name('circles.remove-member');


    Route::get('/friends', [FriendsController::class, 'index'])->name('friends');
    Route::get('/friends/search-by-phone', [FriendsController::class, 'searchByPhone']);
    Route::post('/friends/send-request', [FriendsController::class, 'sendRequest']);
    Route::post('/friends/accept-request', [FriendsController::class, 'acceptRequest']);
    Route::post('/friends/reject-request', [FriendsController::class, 'rejectRequest']);
    Route::post('/friends/cancel-request', [FriendsController::class, 'cancelRequest']);
    Route::post('/friends/send-invitation', [FriendsController::class, 'sendInvitation']);



    Route::post('/pulses/send', [PulsesController::class, 'send'])->name('pulses.send');

    // API routes for pulses (protected)
    Route::get('/api/pulses/sent', [PulsesController::class, 'sentPulses'])->name('api.pulses.sent');
    Route::get('/api/pulses/received', [PulsesController::class, 'receivedPulses'])->name('api.pulses.received');
    Route::get('/api/pulses/all', [PulsesController::class, 'allPulses'])->name('api.pulses.all');

    // Pulses API routes (simplified paths for frontend)
    Route::get('/pulses/all', [PulsesController::class, 'allPulses'])->name('pulses.all');
    Route::post('/pulses/react', [PulsesController::class, 'toggleReaction'])->name('pulses.react');
    Route::get('/pulses/{pulse}/reactions/{reactionType}', [PulsesController::class, 'getReactionUsers'])->name('pulses.reaction-users');
    Route::get('/pulses/{pulse}/reactions/all', [PulsesController::class, 'getAllReactions'])->name('pulses.all-reactions');
    Route::post('/pulses/{pulse}/mark-seen', [PulsesController::class, 'markAsSeen'])->name('pulses.mark-seen');

    // Pulse Reactions
    Route::post('/pulse-reactions/react', [PulseReactionController::class, 'react'])->name('pulse-reactions.react');
    Route::get('/pulse-reactions/get', [PulseReactionController::class, 'getReactions'])->name('pulse-reactions.get');
    Route::get('/pulse-reactions/users', [PulseReactionController::class, 'getReactionUsers'])->name('pulse-reactions.users');
});

// Auth routes for guests only (authenticated users will be redirected to home)
Route::middleware(['guest'])->group(function () {
    // login
    Route::get('/login', [AuthController::class, 'loginPage'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');

    // register
    Route::get('/register', [AuthController::class, 'registerPage'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');

    // OTP Verification Routes
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('verify.otp');
    Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->name('resend.otp');

    // Legacy verify route (for WhatsApp links)
    Route::get('/verify/{phone}/{otp}', [AuthController::class, 'verify'])->name('verify');
});

// logout (accessible for authenticated users)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

Route::get('/test-friends', function () {
    return Inertia::render('friends/FriendsPage', [
        'acceptedFriends' => [
            [
                'id' => 1,
                'name' => 'أحمد محمود',
                'avatar' => 'https://ui-avatars.com/api/?name=أحمد+محمود&background=6366f1&color=fff',
                'phone' => '****5678',
                'isOnline' => true,
                'lastActive' => null,
                'friendshipStarted' => 'منذ شهرين',
                'totalPulses' => 25,
                'lastPulse' => 'منذ ساعتين',
                'isFavorite' => true,
                'streakDays' => 7,
                'responseRate' => 95,
                'status' => 'accepted'
            ],
            [
                'id' => 2,
                'name' => 'فاطمة علي',
                'avatar' => 'https://ui-avatars.com/api/?name=فاطمة+علي&background=8b5cf6&color=fff',
                'phone' => '****9876',
                'isOnline' => false,
                'lastActive' => 'منذ 30 دقيقة',
                'friendshipStarted' => 'منذ أسبوع',
                'totalPulses' => 12,
                'lastPulse' => 'منذ يوم',
                'isFavorite' => false,
                'streakDays' => 3,
                'responseRate' => 80,
                'status' => 'accepted'
            ],
            [
                'id' => 3,
                'name' => 'محمد حسن',
                'avatar' => 'https://ui-avatars.com/api/?name=محمد+حسن&background=10b981&color=fff',
                'phone' => '****1234',
                'isOnline' => true,
                'lastActive' => null,
                'friendshipStarted' => 'منذ 3 أيام',
                'totalPulses' => 5,
                'lastPulse' => 'لم يرسل نبضة',
                'isFavorite' => false,
                'streakDays' => 0,
                'responseRate' => 60,
                'status' => 'accepted'
            ]
        ],
        'receivedRequests' => [
            [
                'id' => 4,
                'requestId' => 101,
                'userId' => 4,
                'name' => 'سارة أحمد',
                'avatar' => 'https://ui-avatars.com/api/?name=سارة+أحمد&background=f59e0b&color=fff',
                'phone' => '****5555',
                'isOnline' => false,
                'lastActive' => 'منذ 5 دقائق',
                'message' => 'أريد أن أكون صديقك في نبض!',
                'sentAt' => 'منذ ساعة',
                'mutualFriends' => 2,
                'status' => 'received_pending'
            ]
        ],
        'sentRequests' => [
            [
                'id' => 5,
                'requestId' => 102,
                'userId' => 5,
                'name' => 'عمر خالد',
                'avatar' => 'https://ui-avatars.com/api/?name=عمر+خالد&background=ef4444&color=fff',
                'phone' => '****7777',
                'isOnline' => true,
                'lastActive' => null,
                'message' => 'مرحباً، دعنا نكون أصدقاء!',
                'sentAt' => 'منذ يومين',
                'mutualFriends' => 1,
                'status' => 'sent_pending'
            ]
        ],
        'favoriteFriends' => [
            [
                'id' => 1,
                'name' => 'أحمد محمود',
                'avatar' => 'https://ui-avatars.com/api/?name=أحمد+محمود&background=6366f1&color=fff',
                'totalPulses' => 25,
                'lastPulse' => 'منذ ساعتين',
                'streakDays' => 7,
            ]
        ],
        'friendsStats' => [
            'totalFriends' => 3,
            'pendingReceived' => 1,
            'pendingSent' => 1,
            'favoriteFriends' => 1,
            'activeFriendsToday' => 2,
            'totalPulsesSent' => 45,
            'totalPulsesReceived' => 32,
            'averageResponseTime' => '15 دقيقة'
        ]
    ]);
})->name('test.friends');

// Test pulse send endpoint (without auth for testing)
Route::post('/test-pulse/send', function (Illuminate\Http\Request $request) {
    // Simulate a successful pulse send
    sleep(1); // Simulate processing time

    return response()->json([
        'message' => 'تم إرسال النبضة بنجاح! 🎉',
        'pulse' => [
            'id' => rand(1000, 9999),
            'type' => 'direct',
            'message' => $request->message,
            'sent_to' => 'اختبار',
            'recipients_count' => 1,
            'sent_at' => 'منذ لحظات',
        ]
    ]);
})->name('test.pulse.send');

// Quick login for testing (REMOVE IN PRODUCTION!)
Route::get('/test-login/{userId?}', function ($userId = 1) {
    $user = App\Models\User::find($userId);
    if ($user) {
        Auth::login($user);
        return redirect('/test-friends')->with('message', 'تم تسجيل الدخول كـ ' . $user->name);
    }
    return redirect('/')->with('error', 'المستخدم غير موجود');
})->name('test.login');

// Test circles route
Route::get('/test-circles', function () {
    return Inertia::render('circles/CirclesPage', [
        'circles' => [
            [
                'id' => 1,
                'name' => 'دائرة الأصدقاء',
                'description' => 'دائرة للأصدقاء المقربين والعائلة',
                'color' => 'from-blue-400 to-indigo-500',
                'icon' => 'users',
                'privacy_type' => 'private',
                'members_count' => 5,
                'pulses_count' => 12,
                'is_favorite' => true,
                'created_at' => 'منذ أسبوع',
                'lastActivity' => 'منذ ساعتين'
            ],
            [
                'id' => 2,
                'name' => 'دائرة العمل',
                'description' => 'زملاء العمل والمشاريع المهنية',
                'color' => 'from-green-400 to-emerald-500',
                'icon' => 'settings',
                'privacy_type' => 'private',
                'members_count' => 8,
                'pulses_count' => 25,
                'is_favorite' => false,
                'created_at' => 'منذ شهر',
                'lastActivity' => 'منذ يوم'
            ],
            [
                'id' => 3,
                'name' => 'دائرة الهوايات',
                'description' => 'أصدقاء يشاركونني نفس الاهتمامات',
                'color' => 'from-purple-400 to-pink-500',
                'icon' => 'heart',
                'privacy_type' => 'public',
                'members_count' => 12,
                'pulses_count' => 45,
                'is_favorite' => true,
                'created_at' => 'منذ أسبوعين',
                'lastActivity' => 'منذ 30 دقيقة'
            ]
        ]
    ]);
})->name('test.circles');

// Temporary test route without authentication for testing circle members
Route::get('/test-api/circles/{circleId}/members', function ($circleId) {
    // Simulate being logged in as the circle owner
    // Circle 1 is owned by user 4
    $userId = $circleId == 1 ? 4 : 1;

    $circle = App\Models\Circle::where('id', $circleId)
        ->where('user_id', $userId)
        ->first();

    if (!$circle) {
        return response()->json([
            'message' => 'Circle not found or you do not have permission to view it.',
            'debug' => [
                'circleId' => $circleId,
                'userId' => $userId,
                'circleExists' => App\Models\Circle::where('id', $circleId)->exists(),
                'circleOwner' => App\Models\Circle::where('id', $circleId)->value('user_id')
            ]
        ], 403);
    }

    $members = DB::table('circle_members')
        ->join('users', 'circle_members.user_id', '=', 'users.id')
        ->where('circle_members.circle_id', $circleId)
        ->select(
            'users.id',
            'users.name',
            'users.avatar_url',
            'circle_members.added_at'
        )
        ->orderBy('circle_members.created_at', 'desc')
        ->get()
        ->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'avatar' => $member->avatar_url ?: 'https://ui-avatars.com/api/?name=' . urlencode($member->name) . '&background=random',
                'added_at' => \Carbon\Carbon::parse($member->added_at)->diffForHumans(),
            ];
        });

    return response()->json($members);
})->name('test.circles.members');
