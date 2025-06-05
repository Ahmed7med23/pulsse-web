<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FriendshipStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    private $countries = [
        ["code" => "+249", "name" => "السودان", "flagUrl" => "https://flagcdn.com/sd.svg"],
        ["code" => "+20", "name" => "مصر", "flagUrl" => "https://flagcdn.com/eg.svg"],
        ["code" => "+966", "name" => "السعودية", "flagUrl" => "https://flagcdn.com/sa.svg"],
        ["code" => "+971", "name" => "الإمارات", "flagUrl" => "https://flagcdn.com/ae.svg"],
        ["code" => "+974", "name" => "قطر", "flagUrl" => "https://flagcdn.com/qa.svg"],
        ["code" => "+965", "name" => "الكويت", "flagUrl" => "https://flagcdn.com/kw.svg"],
        ["code" => "+962", "name" => "الأردن", "flagUrl" => "https://flagcdn.com/jo.svg"],
        ["code" => "+963", "name" => "سوريا", "flagUrl" => "https://flagcdn.com/sy.svg"],
        ["code" => "+964", "name" => "العراق", "flagUrl" => "https://flagcdn.com/iq.svg"],
        ["code" => "+968", "name" => "عمان", "flagUrl" => "https://flagcdn.com/om.svg"],
        ["code" => "+212", "name" => "المغرب", "flagUrl" => "https://flagcdn.com/ma.svg"],
        ["code" => "+213", "name" => "الجزائر", "flagUrl" => "https://flagcdn.com/dz.svg"],
        ["code" => "+216", "name" => "تونس", "flagUrl" => "https://flagcdn.com/tn.svg"],
        ["code" => "+218", "name" => "ليبيا", "flagUrl" => "https://flagcdn.com/ly.svg"],
    ];

    public function loginPage()
    {
        return Inertia::render('auth/LoginPage', [
            'countries' => $this->countries,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
            'country' => 'required',
        ]);

        $phone = ltrim($request->country['code'], '+') . $request->phone;

        // البحث عن المستخدم أولاً
        $user = User::where('phone', $phone)->first();

        // return Hash::make($request->password);

        // التحقق من وجود المستخدم وكلمة المرور
        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => 'رقم الهاتف غير موجود. يرجى التأكد من الرقم أو إنشاء حساب جديد.',
            ]);
        }

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
            ]);
        }

        // التحقق من أن المستخدم قد تم التحقق منه (OTP = null)
        if (!is_null($user->otp)) {
            // المستخدم لم يتم التحقق منه بعد - إرساله لصفحة OTP
            return Inertia::render('auth/VerifyOtpPage', [
                'phone' => $phone,
                'maskedPhone' => $this->maskPhone($phone),
                'whatsappSent' => false, // لأننا لم נرسل رسالة جديدة
                'userName' => $user->name,
                'countries' => $this->countries,
                'flash' => [
                    'type' => 'warning',
                    'message' => [
                        'en' => 'Please verify your account first with the OTP sent to your WhatsApp.',
                        'ar' => 'يرجى التحقق من حسابك أولاً باستخدام الرمز المرسل على الواتساب.'
                    ]
                ]
            ]);
        }

        // تسجيل الدخول للمستخدمين المحققين فقط
        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    public function registerPage()
    {
        return Inertia::render('auth/RegisterPage', [
            'countries' => $this->countries,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login');
    }

    public function register(Request $request)
    {
        // إضافة logging للتحقق من البيانات المستلمة
        Log::info('Registration attempt:', [
            'name' => $request->name,
            'phone' => $request->phone,
            'country' => $request->country,
            'invitation_code' => $request->invitation_code,
            'ip' => $request->ip()
        ]);

        // التحقق من البيانات الأساسية أولاً
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'country' => 'required|array',
            'country.code' => 'required|string',
            'country.name' => 'required|string',
            'invitation_code' => 'nullable|string',
        ]);

        $phone = ltrim($request->country['code'], '+') . $request->phone;

        Log::info('Final phone number:', ['phone' => $phone]);

        // التحقق من أن رقم الهاتف غير مستخدم من قبل
        $existingUser = User::where('phone', $phone)->first();
        if ($existingUser) {
            Log::warning('Duplicate phone number attempt:', [
                'phone' => $phone,
                'existing_user_id' => $existingUser->id
            ]);

            throw ValidationException::withMessages([
                'phone' => [
                    'رقم الهاتف ' . $this->maskPhone($phone) . ' مسجل بالفعل. إذا كان هذا رقمك، يمكنك تسجيل الدخول أو استعادة كلمة المرور.'
                ],
            ]);
        }

        // التحقق من صحة تنسيق رقم الهاتف
        if (!is_numeric($phone) || strlen($phone) < 10) {
            throw ValidationException::withMessages([
                'phone' => ['رقم الهاتف غير صحيح. يرجى التأكد من الرقم والمحاولة مرة أخرى.'],
            ]);
        }

        $otp = rand(1000, 9999);

        $user = User::create([
            'name' => $request->name,
            'phone' => $phone,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'country' => $request->country['name'],
        ]);

        // التعامل مع كود الدعوة إذا كان موجوداً
        $invitation = null;
        if ($request->invitation_code) {
            $invitation = \App\Models\Invitation::where('invitation_code', $request->invitation_code)
                ->where('status', 'sent')
                ->first();

            if ($invitation) {
                // تحديث الدعوة لتشير إلى المستخدم الجديد
                $invitation->update([
                    'invited_user_id' => $user->id,
                    'status' => 'registered',
                    'registered_at' => now(),
                ]);

                Log::info('User registered through invitation', [
                    'user_id' => $user->id,
                    'invitation_id' => $invitation->id,
                    'inviter_id' => $invitation->inviter_id
                ]);
            }
        }

        $message = "مرحباً بك في منصة نبض! 🎉\n\nرمز التحقق الخاص بك هو: " . $otp . "\n\nيمكنك إدخال الرمز أو الضغط على الرابط التالي للتعريف بمنصتنا:\nhttps://pulsse.online/verify/$phone/$otp\n\nنبض - منصة التواصل الاجتماعي المميزة 🌟";

        // Send WhatsApp message
        $whatsappSent = false;
        try {
            $response = Http::timeout(10)->get('https://whatsapp.fatora.sd/send-message', [
                'api_key' => "aijQZatAsXOxodJZZ9Y2xF4ObpDHij",
                'sender' => "249915903708",
                'number' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                $whatsappSent = true;
                Log::info('WhatsApp message sent successfully', [
                    'phone' => $phone,
                    'response' => $response->json()
                ]);
            } else {
                Log::error('Failed to send WhatsApp message', [
                    'phone' => $phone,
                    'error' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('WhatsApp API exception', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
        }

        // إرجاع صفحة التحقق من OTP مع Inertia
        return Inertia::render('auth/VerifyOtpPage', [
            'phone' => $phone,
            'maskedPhone' => $this->maskPhone($phone),
            'whatsappSent' => $whatsappSent,
            'userName' => $request->name,
            'countries' => $this->countries,
            'flash' => [
                'type' => 'success',
                'message' => [
                    'en' => 'Account created successfully! Please check your WhatsApp for verification code.',
                    'ar' => 'تم إنشاء الحساب بنجاح! يرجى التحقق من رسالة الواتساب للحصول على رمز التحقق.'
                ]
            ]
        ]);
    }

    /**
     * إخفاء جزء من رقم الهاتف للأمان
     */
    private function maskPhone($phone)
    {
        if (strlen($phone) > 4) {
            return substr($phone, 0, 4) . str_repeat('*', strlen($phone) - 8) . substr($phone, -4);
        }
        return $phone;
    }

    /**
     * التحقق من OTP عبر صفحة منفصلة
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|numeric|digits:4'
        ]);

        $user = User::where('phone', $request->phone)
            ->where('otp', $request->otp)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'otp' => ['رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.']
            ]);
        }

        // مسح OTP وتفعيل الحساب
        $user->update([
            'otp' => null,
            'email_verified_at' => now(), // أو phone_verified_at إذا كان لديك هذا الحقل
        ]);

        // التحقق من وجود دعوة مرتبطة بهذا المستخدم (بناءً على رقم الهاتف)
        $invitation = \App\Models\Invitation::where('invited_phone', $user->phone)
            ->where('status', 'sent')
            ->first();

        // إذا وُجدت دعوة، قم بتحديثها لتشير للمستخدم الجديد
        if ($invitation) {
            $invitation->update([
                'invited_user_id' => $user->id,
                'status' => 'registered',
                'registered_at' => now(),
            ]);
        }

        if ($invitation && $invitation->inviter_id) {
            try {
                // إنشاء صداقة تلقائية بين المدعو والمدعي
                $this->createBidirectionalFriendship($invitation->inviter_id, $user->id);

                // إرسال إشعار للمدعي بأن صديقه انضم
                \App\Services\NotificationService::sendFriendJoinedNotification(
                    $invitation->inviter_id,
                    $user->id
                );

                Log::info('Automatic friendship created through invitation', [
                    'inviter_id' => $invitation->inviter_id,
                    'invited_user_id' => $user->id,
                    'invitation_id' => $invitation->id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create automatic friendship', [
                    'inviter_id' => $invitation->inviter_id,
                    'invited_user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // تسجيل الدخول التلقائي
        Auth::login($user, true);

        return redirect()->route('home')->with('flash', [
            'type' => 'success',
            'message' => [
                'en' => 'Account verified successfully! Welcome to Pulse!',
                'ar' => 'تم التحقق من الحساب بنجاح! مرحباً بك في نبض!'
            ]
        ]);
    }

    /**
     * إعادة إرسال OTP
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string'
        ]);

        $user = User::where('phone', $request->phone)
            ->whereNotNull('otp')
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['لم يتم العثور على المستخدم أو تم التحقق من الحساب بالفعل.']
            ]);
        }

        // توليد OTP جديد
        $newOtp = rand(1000, 9999);
        $user->update(['otp' => $newOtp]);

        $message = "رمز التحقق الجديد لحسابك في نبض هو: " . $newOtp . "\n\nنبض - منصة التواصل الاجتماعي المميزة 🌟";

        // إرسال الرسالة مرة أخرى
        $whatsappSent = false;
        try {
            $response = Http::timeout(10)->get('https://whatsapp.fatora.sd/send-message', [
                'api_key' => "aijQZatAsXOxodJZZ9Y2xF4ObpDHij",
                'sender' => "249915903708",
                'number' => $request->phone,
                'message' => $message,
            ]);

            $whatsappSent = $response->successful();

            if ($whatsappSent) {
                Log::info('OTP resent successfully', [
                    'phone' => $request->phone,
                    'new_otp' => $newOtp
                ]);
            }
        } catch (\Exception $e) {
            Log::error('WhatsApp resend OTP failed', [
                'phone' => $request->phone,
                'error' => $e->getMessage()
            ]);
        }

        // إرجاع صفحة التحقق مع رسالة النجاح/الخطأ
        return Inertia::render('auth/VerifyOtpPage', [
            'phone' => $request->phone,
            'maskedPhone' => $this->maskPhone($request->phone),
            'whatsappSent' => $whatsappSent,
            'userName' => $user->name,
            'countries' => $this->countries,
            'flash' => [
                'type' => $whatsappSent ? 'success' : 'warning',
                'message' => [
                    'en' => $whatsappSent ? 'New verification code sent successfully!' : 'Code generated but WhatsApp delivery failed.',
                    'ar' => $whatsappSent ? 'تم إرسال رمز التحقق الجديد بنجاح!' : 'تم توليد الرمز الجديد ولكن فشل إرسال الواتساب.'
                ]
            ]
        ]);
    }

    // Legacy verify route (for WhatsApp links)
    public function verify($phone, $otp)
    {
        $user = User::where('phone', $phone)->where('otp', $otp)->first();

        if (!$user) {
            return redirect()->route('login')->with('flash', [
                'type' => 'error',
                'message' => [
                    'en' => 'Invalid verification code. Please try again.',
                    'ar' => 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.'
                ]
            ]);
        }

        // مسح OTP وتفعيل الحساب
        $user->update([
            'otp' => null,
            'email_verified_at' => now(),
        ]);

        // التحقق من وجود دعوة مرتبطة بهذا المستخدم (بناءً على رقم الهاتف)
        $invitation = \App\Models\Invitation::where('invited_phone', $user->phone)
            ->where('status', 'sent')
            ->first();

        // إذا وُجدت دعوة، قم بتحديثها لتشير للمستخدم الجديد
        if ($invitation) {
            $invitation->update([
                'invited_user_id' => $user->id,
                'status' => 'registered',
                'registered_at' => now(),
            ]);

            // إنشاء صداقة تلقائية وإرسال إشعار
            if ($invitation->inviter_id) {
                try {
                    // إنشاء صداقة تلقائية بين المدعو والمدعي
                    $this->createBidirectionalFriendship($invitation->inviter_id, $user->id);

                    // إرسال إشعار للمدعي بأن صديقه انضم
                    \App\Services\NotificationService::sendFriendJoinedNotification(
                        $invitation->inviter_id,
                        $user->id
                    );

                    Log::info('Automatic friendship created through invitation (legacy verify)', [
                        'inviter_id' => $invitation->inviter_id,
                        'invited_user_id' => $user->id,
                        'invitation_id' => $invitation->id
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create automatic friendship (legacy verify)', [
                        'inviter_id' => $invitation->inviter_id,
                        'invited_user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // تسجيل الدخول التلقائي
        Auth::login($user, true);

        return redirect()->route('home')->with('flash', [
            'type' => 'success',
            'message' => [
                'en' => 'Account verified successfully! Welcome to Pulse!',
                'ar' => 'تم التحقق من الحساب بنجاح! مرحباً بك في نبض!'
            ]
        ]);
    }

    /**
     * إنشاء صداقة في الاتجاهين
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
}