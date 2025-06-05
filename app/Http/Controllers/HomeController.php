<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * Display the home page.
     */
    public function index(): Response
    {
        return Inertia::render('home/HomePage');
    }




    /**
     * Display the profile page.
     */
    public function profile()
    {
        $user = auth()->user();

        // حساب إحصائيات النبضات للمستخدم
        $pulseStats = $this->calculatePulseStats($user);

        return Inertia::render('profile/ProfilePage', [
            'user' => $user,
            'pulseStats' => $pulseStats,
        ]);
    }

    /**
     * حساب إحصائيات النبضات للمستخدم
     */
    private function calculatePulseStats($user)
    {
        // النبضات المرسلة
        $totalSent = DB::table('pulses')
            ->where('sender_id', $user->id)
            ->count();

        // النبضات المستقبلة (مباشرة + دوائر)
        $totalReceived = DB::table('pulses')
            ->where(function ($query) use ($user) {
                // النبضات المباشرة
                $query->where('recipient_id', $user->id)
                    ->where('type', 'direct');
            })
            ->orWhere(function ($query) use ($user) {
                // النبضات في الدوائر التي ينتمي إليها
                $query->where('type', 'circle')
                    ->whereExists(function ($subQuery) use ($user) {
                        $subQuery->select(DB::raw(1))
                            ->from('circle_members')
                            ->where('user_id', $user->id)
                            ->whereRaw('circle_members.circle_id = JSON_EXTRACT(pulses.metadata, "$.circle_id")');
                    });
            })
            ->count();

        // النبضات غير المقروءة
        $unreadCount = DB::table('pulses')
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                    ->where('type', 'direct');
            })
            ->orWhere(function ($query) use ($user) {
                $query->where('type', 'circle')
                    ->whereExists(function ($subQuery) use ($user) {
                        $subQuery->select(DB::raw(1))
                            ->from('circle_members')
                            ->where('user_id', $user->id)
                            ->whereRaw('circle_members.circle_id = JSON_EXTRACT(pulses.metadata, "$.circle_id")');
                    });
            })
            ->whereNull('seen_at')
            ->count();

        // الأصدقاء النشطون (أرسلوا نبضات في آخر 7 أيام)
        $activeFriends = DB::table('user_friendships')
            ->where('user_id', $user->id)
            ->where('is_blocked', false)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('pulses')
                    ->whereRaw('pulses.sender_id = user_friendships.friend_id')
                    ->where('pulses.created_at', '>=', now()->subDays(7));
            })
            ->count();

        // معدل التفاعل (نسبة النبضات المقروءة من المستقبلة)
        $engagementRate = $totalReceived > 0
            ? round((($totalReceived - $unreadCount) / $totalReceived) * 100, 1)
            : 0;

        return [
            'totalSent' => $totalSent,
            'totalReceived' => $totalReceived,
            'unreadCount' => $unreadCount,
            'activeFriends' => $activeFriends,
            'engagementRate' => $engagementRate,
        ];
    }
}
