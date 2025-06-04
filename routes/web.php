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

// Routes requiring authentication and verification
Route::middleware(['auth', 'verified-user'])->group(function () {

    Route::get('/', [PulsesController::class, 'index'])->name('home');

    Route::get('/profile', [HomeController::class, 'profile'])->name('profile');


    Route::get('/circles', [CirclesController::class, 'index'])->name('circles');
    Route::post('/circles', [CirclesController::class, 'store'])->name('circles.store');
    Route::get('/circles/{circle}', [CirclesController::class, 'show'])->name('circles.show');


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
