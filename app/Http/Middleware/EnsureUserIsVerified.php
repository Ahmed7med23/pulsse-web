<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnsureUserIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // التحقق من أن المستخدم مسجل دخول
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // التحقق من أن المستخدم قد تم التحقق منه (OTP = null)
        if (!is_null($user->otp)) {
            // المستخدم لم يتم التحقق منه - إرساله لصفحة OTP
            Auth::logout();

            return Inertia::render('auth/VerifyOtpPage', [
                'phone' => $user->phone,
                'maskedPhone' => $this->maskPhone($user->phone),
                'whatsappSent' => false,
                'userName' => $user->name,
                'countries' => $this->getCountries(),
                'flash' => [
                    'type' => 'warning',
                    'message' => [
                        'en' => 'Please verify your account first with the OTP sent to your WhatsApp.',
                        'ar' => 'يرجى التحقق من حسابك أولاً باستخدام الرمز المرسل على الواتساب.'
                    ]
                ]
            ]);
        }

        return $next($request);
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
     * قائمة الدول
     */
    private function getCountries()
    {
        return [
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
    }
}
