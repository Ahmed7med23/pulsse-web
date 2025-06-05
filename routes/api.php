<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PulsesController;
use App\Http\Controllers\PulseReactionController;
use App\Http\Controllers\PushNotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:web')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Friend routes
    Route::post('/pulses/send', [PulsesController::class, 'send']);

    // Pulse routes
    Route::get('/pulses/sent', [PulsesController::class, 'sentPulses']);
    Route::get('/pulses/received', [PulsesController::class, 'receivedPulses']);
    Route::get('/pulses/all', [PulsesController::class, 'allPulses']);

    // Pulse Reaction routes
    Route::post('/pulses/{pulse}/reactions', [PulseReactionController::class, 'toggleReaction']);
    Route::get('/pulses/{pulse}/reactions', [PulseReactionController::class, 'getPulseReactions']);
    Route::get('/pulses/{pulse}/reactions/user', [PulseReactionController::class, 'getUserReaction']);
    Route::delete('/pulses/{pulse}/reactions', [PulseReactionController::class, 'removeAllReactions']);

    // Push Notification routes
    Route::post('/push-notifications/subscribe', [PushNotificationController::class, 'subscribe']);
    Route::post('/push-notifications/unsubscribe', [PushNotificationController::class, 'unsubscribe']);
    Route::get('/push-notifications/status', [PushNotificationController::class, 'getSubscriptionStatus']);
    Route::post('/push-notifications/test', [PushNotificationController::class, 'sendTestNotification']);
    Route::post('/push-notifications/debug-test', [PushNotificationController::class, 'debugTestNotification']);
    Route::get('/push-notifications/diagnose', [PushNotificationController::class, 'diagnose']);
    Route::get('/push-notifications/quick-diagnose', [PushNotificationController::class, 'quickDiagnose']);
    Route::post('/push-notifications/generate-vapid', [PushNotificationController::class, 'generateVapidKeys']);
    Route::post('/push-notifications/test-simple', [PushNotificationController::class, 'testSimpleNotification']);

    // Notifications API routes
    Route::get('/notifications/unread', [App\Http\Controllers\NotificationController::class, 'getUnread']);
    Route::post('/notifications/{notification}/mark-read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy']);
    Route::post('/notifications/clear-read', [App\Http\Controllers\NotificationController::class, 'clearRead']);
    Route::get('/notifications/stats', [App\Http\Controllers\NotificationController::class, 'getStats']);
});

// Public routes (لا تحتاج authentication)
Route::get('/push-notifications/vapid-key', [PushNotificationController::class, 'getVapidPublicKey']);
