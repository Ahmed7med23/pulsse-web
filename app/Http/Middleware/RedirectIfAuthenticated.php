<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string|null  ...$guards
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // التحقق من أن المستخدم محقق (OTP = null)
                if (is_null($user->otp)) {
                    // المستخدم مسجل ومحقق - إعادة توجيه للصفحة الرئيسية
                    return redirect()->route('home')->with('flash', [
                        'type' => 'info',
                        'message' => [
                            'en' => 'You are already logged in.',
                            'ar' => 'أنت مسجل دخول بالفعل. إذا كنت تريد إنشاء حساب جديد، يرجى تسجيل الخروج أولاً.'
                        ]
                    ]);
                } else {
                    // المستخدم مسجل لكن غير محقق - تسجيل خروج تلقائي
                    Auth::guard($guard)->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }
            }
        }

        return $next($request);
    }
}
