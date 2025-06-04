<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        // return Hash::make($request->password);

        if (!Auth::attempt([
            'phone' => $phone,
            'password' => $request->password,
        ], true)) {
            throw ValidationException::withMessages([
                'phone' => __('auth.failed'),
            ]);
        }

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
        $phone = ltrim($request->country['code'], '+') . $request->phone;
        $request->merge(['phone_number' => $phone]);


        $validate = $request->validate([
            'name' => 'required|string',
            'phone_number' => 'required|numeric|unique:users,phone',
            'password' => 'required|string',
            'country' => 'required',
        ]);


        $otp = rand(1000, 9999);

        // check if user already exists
        $user = User::where('phone', $phone)->first();
        if ($user) {
            throw ValidationException::withMessages([
                'phone' => ['الرقم المحمول مستخدم من قبل'],
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'phone' => $phone,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'country' => $request->country['name'],
        ]);
        $message = "مرحباً بك في منصة نبض! 🎉\n\nرمز التحقق الخاص بك هو: " . $otp . "\n\nيمكنك إدخال الرمز أو الضغط على الرابط التالي للتعريف بمنصتنا:\nhttps://pulsse.com/verify/$phone/$otp\n\nنبض - منصة التواصل الاجتماعي المميزة 🌟";
        // Send WhatsApp message



        $response = Http::get('https://whatsapp.fatora.sd/send-message', [
            'api_key' => "aijQZatAsXOxodJZZ9Y2xF4ObpDHij",
            'sender' => "249915903708",
            'number' => $phone,
            // 'number' => $phone,
            'message' => $message,
        ]);



        if ($response->successful()) {
            Log::info('WhatsApp message sent successfully', [
                'phone' => $request->phone,
                'response' => $response->json()
            ]);
        } else {
            Log::error('Failed to send WhatsApp message', [
                'phone' => $request->phone,
                'error' => $response->json()
            ]);
        }

        // Return your registration response
        return response()->json([
            'message' => 'تم التسجيل بنجاح',
            'whatsapp_sent' => $response->successful()
        ]);
    }

    // verify
    public function verify($phone, $otp)
    {
        $user = User::where('phone', $phone)->where('otp', $otp)->first();
        if (!$user) {
            return Inertia::render('auth/LoginPage', [
                'countries' => $this->countries,
                'flash' => [
                    'type' => 'error',
                    'message' => [
                        'en' => 'Invalid verification code. Please try again.',
                        'ar' => 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.'
                    ]
                ]
            ]);
        }

        $user->update([
            'otp' => null,
        ]);

        // auth and go to /
        Auth::login($user);

        return Inertia::render('auth/LoginPage', [
            'countries' => $this->countries,
            'flash' => [
                'type' => 'success',
                'message' => [
                    'en' => 'Account verified successfully!',
                    'ar' => 'تم التحقق من الحساب بنجاح!'
                ]
            ]
        ]);
    }
}