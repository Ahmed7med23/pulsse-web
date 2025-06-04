<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Notifications\TestPushNotification;
use Illuminate\Support\Facades\Schema;

class PushNotificationController extends Controller
{
    /**
     * حفظ اشتراك push notification جديد
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = Auth::user();
        $endpoint = $request->input('endpoint');
        $p256dh = $request->input('keys.p256dh');
        $auth = $request->input('keys.auth');

        try {
            // Debug information
            Log::info('Subscribe attempt', [
                'user_id' => $user->id,
                'endpoint' => substr($endpoint, 0, 50) . '...'
            ]);

            // Try to use webpush package method if available
            if (method_exists($user, 'updatePushSubscription')) {
                $user->updatePushSubscription($endpoint, $p256dh, $auth, 'aesgcm');
            } else {
                // Fallback to manual database insertion
                DB::table('push_subscriptions')->updateOrInsert(
                    [
                        'subscribable_id' => $user->id,
                        'subscribable_type' => get_class($user),
                        'endpoint' => $endpoint,
                    ],
                    [
                        'public_key' => $p256dh,
                        'auth_token' => $auth,
                        'content_encoding' => 'aesgcm',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            Log::info('Push subscription saved successfully', [
                'user_id' => $user->id,
                'endpoint' => substr($endpoint, 0, 50) . '...'
            ]);

            return response()->json([
                'message' => 'تم حفظ اشتراك الإشعارات بنجاح',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save push subscription', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'endpoint' => substr($endpoint, 0, 50) . '...'
            ]);

            return response()->json([
                'message' => 'فشل في حفظ اشتراك الإشعارات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إلغاء اشتراك push notification
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        $user = Auth::user();
        $endpoint = $request->input('endpoint');

        try {
            if (method_exists($user, 'deletePushSubscription')) {
                $user->deletePushSubscription($endpoint);
            } else {
                // Manual deletion
                DB::table('push_subscriptions')
                    ->where('subscribable_id', $user->id)
                    ->where('subscribable_type', get_class($user))
                    ->where('endpoint', $endpoint)
                    ->delete();
            }

            Log::info('Push subscription deleted', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'تم إلغاء اشتراك الإشعارات بنجاح'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to unsubscribe push notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'فشل في إلغاء اشتراك الإشعارات'
            ], 500);
        }
    }

    /**
     * الحصول على حالة اشتراك المستخدم
     */
    public function getSubscriptionStatus()
    {
        $user = Auth::user();

        $subscriptionsCount = DB::table('push_subscriptions')
            ->where('subscribable_id', $user->id)
            ->where('subscribable_type', get_class($user))
            ->where('is_active', true)
            ->count();

        return response()->json([
            'subscribed' => $subscriptionsCount > 0,
            'subscription_count' => $subscriptionsCount,
        ]);
    }

    /**
     * إرسال إشعار تجريبي
     */
    public function sendTestNotification()
    {
        $user = Auth::user();

        try {
            $subscriptionsCount = DB::table('push_subscriptions')
                ->where('subscribable_id', $user->id)
                ->where('subscribable_type', get_class($user))
                ->where('is_active', true)
                ->count();

            if ($subscriptionsCount === 0) {
                return response()->json([
                    'message' => 'لا توجد اشتراكات نشطة للإشعارات'
                ], 404);
            }

            // محاولة إرسال إشعار بطريقة مبسطة
            Log::info('Attempting to send test notification', [
                'user_id' => $user->id,
                'user_has_trait' => in_array('NotificationChannels\WebPush\HasPushSubscriptions', class_uses($user)),
                'subscriptions_count' => $subscriptionsCount
            ]);

            // التحقق من VAPID keys
            $vapidPublic = config('webpush.vapid.public_key');
            $vapidPrivate = config('webpush.vapid.private_key');

            if (empty($vapidPublic) || empty($vapidPrivate)) {
                throw new \Exception('VAPID keys are not properly configured');
            }

            // محاولة إرسال الإشعار
            try {
                $user->notify(new TestPushNotification($user->name));

                Log::info('Test notification sent successfully', [
                    'user_id' => $user->id,
                    'subscriptions_count' => $subscriptionsCount
                ]);

                return response()->json([
                    'message' => 'تم إرسال الإشعار التجريبي بنجاح',
                    'total_subscriptions' => $subscriptionsCount,
                ]);
            } catch (\Exception $notificationError) {
                Log::error('Notification sending failed', [
                    'user_id' => $user->id,
                    'error' => $notificationError->getMessage(),
                    'vapid_configured' => !empty($vapidPublic) && !empty($vapidPrivate)
                ]);

                // إرجاع رسالة مفصلة عن الخطأ
                return response()->json([
                    'message' => 'فشل في إرسال الإشعار التجريبي',
                    'error' => $notificationError->getMessage(),
                    'debug_info' => [
                        'vapid_public_configured' => !empty($vapidPublic),
                        'vapid_private_configured' => !empty($vapidPrivate),
                        'subscriptions_count' => $subscriptionsCount,
                        'user_has_trait' => in_array('NotificationChannels\WebPush\HasPushSubscriptions', class_uses($user))
                    ]
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send test notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'فشل في إرسال الإشعار التجريبي',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على VAPID public key للعميل
     */
    public function getVapidPublicKey()
    {
        return response()->json([
            'vapid_public_key' => config('webpush.vapid.public_key')
        ]);
    }

    /**
     * تشخيص إعدادات الإشعارات
     */
    public function diagnose()
    {
        $user = Auth::user();
        $diagnostics = [];

        // فحص إعدادات VAPID
        $vapidPublic = config('webpush.vapid.public_key');
        $vapidPrivate = config('webpush.vapid.private_key');
        $vapidSubject = config('webpush.vapid.subject');

        $diagnostics['vapid'] = [
            'public_key_set' => !empty($vapidPublic),
            'private_key_set' => !empty($vapidPrivate),
            'subject_set' => !empty($vapidSubject),
            'public_key_length' => strlen($vapidPublic ?? ''),
            'public_key_preview' => $vapidPublic ? substr($vapidPublic, 0, 20) . '...' : 'NOT SET'
        ];

        // فحص إعدادات قاعدة البيانات
        $subscriptionsCount = DB::table('push_subscriptions')
            ->where('subscribable_id', $user->id)
            ->where('subscribable_type', get_class($user))
            ->count();

        $diagnostics['database'] = [
            'table_exists' => Schema::hasTable('push_subscriptions'),
            'required_columns' => [
                'subscribable_id' => Schema::hasColumn('push_subscriptions', 'subscribable_id'),
                'subscribable_type' => Schema::hasColumn('push_subscriptions', 'subscribable_type'),
                'endpoint' => Schema::hasColumn('push_subscriptions', 'endpoint'),
                'public_key' => Schema::hasColumn('push_subscriptions', 'public_key'),
                'auth_token' => Schema::hasColumn('push_subscriptions', 'auth_token'),
                'content_encoding' => Schema::hasColumn('push_subscriptions', 'content_encoding'),
                'is_active' => Schema::hasColumn('push_subscriptions', 'is_active'),
            ],
            'subscriptions_count' => $subscriptionsCount
        ];

        // فحص إعدادات PHP
        $diagnostics['php'] = [
            'openssl_loaded' => extension_loaded('openssl'),
            'curl_loaded' => extension_loaded('curl'),
            'gmp_loaded' => extension_loaded('gmp'),
            'mbstring_loaded' => extension_loaded('mbstring'),
            'openssl_version' => extension_loaded('openssl') ? OPENSSL_VERSION_TEXT : 'NOT AVAILABLE'
        ];

        // فحص User trait
        $diagnostics['user_model'] = [
            'has_notifiable_trait' => in_array('Illuminate\Notifications\Notifiable', class_uses($user)),
            'has_webpush_trait' => in_array('NotificationChannels\WebPush\HasPushSubscriptions', class_uses($user)),
            'notify_method_exists' => method_exists($user, 'notify'),
            'updatePushSubscription_method_exists' => method_exists($user, 'updatePushSubscription'),
        ];

        return response()->json([
            'diagnostics' => $diagnostics,
            'status' => 'تم تشغيل التشخيص بنجاح'
        ]);
    }

    /**
     * إنشاء مفاتيح VAPID جديدة (للطوارئ)
     */
    public function generateVapidKeys()
    {
        try {
            // استخدام مكتبة web-push إذا كانت متوفرة
            if (class_exists('Minishlink\WebPush\VAPID')) {
                $keys = \Minishlink\WebPush\VAPID::createVapidKeys();

                return response()->json([
                    'message' => 'تم إنشاء مفاتيح VAPID جديدة',
                    'keys' => $keys,
                    'instructions' => [
                        'أضف هذه القيم إلى ملف .env:',
                        'VAPID_PUBLIC_KEY=' . $keys['publicKey'],
                        'VAPID_PRIVATE_KEY=' . $keys['privateKey'],
                        'VAPID_SUBJECT=mailto:admin@pulsse.app'
                    ]
                ]);
            }

            return response()->json([
                'error' => 'مكتبة VAPID غير متوفرة'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'فشل في إنشاء مفاتيح VAPID: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * اختبار الإشعارات بدون webpush package
     */
    public function testSimpleNotification()
    {
        $user = Auth::user();

        try {
            // إنشاء إشعار بسيط بدون استخدام webpush
            $subscriptionsCount = DB::table('push_subscriptions')
                ->where('subscribable_id', $user->id)
                ->where('subscribable_type', get_class($user))
                ->where('is_active', true)
                ->count();

            if ($subscriptionsCount === 0) {
                return response()->json([
                    'message' => 'لا توجد اشتراكات نشطة للإشعارات'
                ], 404);
            }

            // محاكاة إرسال إشعار
            Log::info('Simple notification test', [
                'user_id' => $user->id,
                'subscriptions_count' => $subscriptionsCount,
                'timestamp' => now()
            ]);

            return response()->json([
                'message' => 'تم اختبار نظام الإشعارات بنجاح',
                'details' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'subscriptions_count' => $subscriptionsCount,
                    'test_time' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'فشل في اختبار الإشعارات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
