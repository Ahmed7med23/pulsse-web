<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * ترقية البيانات من النظام القديم للجديد
     * Migrate data from old friendship system to new improved system
     */
    public function up(): void
    {
        // التأكد من وجود الجداول الجديدة
        if (
            !Schema::hasTable('friend_requests') ||
            !Schema::hasTable('user_friendships') ||
            !Schema::hasTable('friendship_stats')
        ) {
            throw new Exception('الجداول الجديدة غير موجودة! يجب تشغيل migrations الجديدة أولاً');
        }

        // إذا كان الجدول القديم موجود وبه بيانات
        if (Schema::hasTable('friendships')) {
            $this->migrateFriendshipData();
        }
    }

    /**
     * ترقية بيانات الصداقات
     */
    private function migrateFriendshipData(): void
    {
        $friendships = DB::table('friendships')->get();

        foreach ($friendships as $friendship) {
            switch ($friendship->status) {
                case 'pending':
                    $this->createFriendRequest($friendship);
                    break;

                case 'accepted':
                    $this->createAcceptedFriendship($friendship);
                    break;

                case 'rejected':
                    $this->createRejectedFriendRequest($friendship);
                    break;

                case 'blocked':
                    $this->createBlockedFriendship($friendship);
                    break;
            }
        }

        echo "تم ترقية " . $friendships->count() . " سجل صداقة\n";
    }

    /**
     * إنشاء طلب صداقة معلق
     */
    private function createFriendRequest($friendship): void
    {
        // التحقق من عدم وجود الطلب مسبقاً
        $exists = DB::table('friend_requests')
            ->where('sender_id', $friendship->sender_id)
            ->where('receiver_id', $friendship->receiver_id)
            ->exists();

        if (!$exists) {
            DB::table('friend_requests')->insert([
                'sender_id' => $friendship->sender_id,
                'receiver_id' => $friendship->receiver_id,
                'status' => 'pending',
                'message' => null,
                'responded_at' => null,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
            ]);
        }
    }

    /**
     * إنشاء صداقة مقبولة
     */
    private function createAcceptedFriendship($friendship): void
    {
        // إنشاء Friend Request مقبول
        $this->createFriendRequest($friendship);
        DB::table('friend_requests')
            ->where('sender_id', $friendship->sender_id)
            ->where('receiver_id', $friendship->receiver_id)
            ->update([
                'status' => 'accepted',
                'responded_at' => $friendship->updated_at
            ]);

        // إنشاء الصداقة في الاتجاهين
        $this->createBidirectionalFriendship($friendship);
    }

    /**
     * إنشاء صداقة في الاتجاهين
     */
    private function createBidirectionalFriendship($friendship): void
    {
        $friendshipDate = $friendship->updated_at ?? $friendship->created_at;

        // الاتجاه الأول: sender -> receiver
        $exists1 = DB::table('user_friendships')
            ->where('user_id', $friendship->sender_id)
            ->where('friend_id', $friendship->receiver_id)
            ->exists();

        if (!$exists1) {
            DB::table('user_friendships')->insert([
                'user_id' => $friendship->sender_id,
                'friend_id' => $friendship->receiver_id,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => $friendship->status === 'blocked',
                'blocked_at' => $friendship->status === 'blocked' ? $friendship->blocked_at : null,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
            ]);
        }

        // الاتجاه الثاني: receiver -> sender
        $exists2 = DB::table('user_friendships')
            ->where('user_id', $friendship->receiver_id)
            ->where('friend_id', $friendship->sender_id)
            ->exists();

        if (!$exists2) {
            DB::table('user_friendships')->insert([
                'user_id' => $friendship->receiver_id,
                'friend_id' => $friendship->sender_id,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => false, // الحظر من جانب واحد فقط
                'blocked_at' => null,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
            ]);
        }

        // إنشاء الإحصائيات
        $this->createFriendshipStats($friendship);
    }

    /**
     * إنشاء إحصائيات الصداقة
     */
    private function createFriendshipStats($friendship): void
    {
        // للمرسل
        $exists1 = DB::table('friendship_stats')
            ->where('user_id', $friendship->sender_id)
            ->where('friend_id', $friendship->receiver_id)
            ->exists();

        if (!$exists1) {
            DB::table('friendship_stats')->insert([
                'user_id' => $friendship->sender_id,
                'friend_id' => $friendship->receiver_id,
                'pulses_sent' => $friendship->pulses_count ?? 0,
                'pulses_received' => 0,
                'total_pulses' => $friendship->pulses_count ?? 0,
                'response_rate' => $friendship->response_rate ?? 0,
                'last_pulse_at' => $friendship->last_pulse_at,
                'last_interaction_at' => $friendship->last_pulse_at,
                'is_favorite' => $friendship->is_favorite ?? false,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
            ]);
        }

        // للمستقبل (إحصائيات منعكسة)
        $exists2 = DB::table('friendship_stats')
            ->where('user_id', $friendship->receiver_id)
            ->where('friend_id', $friendship->sender_id)
            ->exists();

        if (!$exists2) {
            DB::table('friendship_stats')->insert([
                'user_id' => $friendship->receiver_id,
                'friend_id' => $friendship->sender_id,
                'pulses_sent' => 0,
                'pulses_received' => $friendship->pulses_count ?? 0,
                'total_pulses' => $friendship->pulses_count ?? 0,
                'response_rate' => 0,
                'last_pulse_at' => $friendship->last_pulse_at,
                'last_interaction_at' => $friendship->last_pulse_at,
                'is_favorite' => false,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
            ]);
        }
    }

    /**
     * إنشاء طلب صداقة مرفوض
     */
    private function createRejectedFriendRequest($friendship): void
    {
        $this->createFriendRequest($friendship);
        DB::table('friend_requests')
            ->where('sender_id', $friendship->sender_id)
            ->where('receiver_id', $friendship->receiver_id)
            ->update([
                'status' => 'rejected',
                'responded_at' => $friendship->updated_at
            ]);
    }

    /**
     * إنشاء صداقة محظورة
     */
    private function createBlockedFriendship($friendship): void
    {
        // إنشاء طلب مقبول أولاً
        $this->createAcceptedFriendship($friendship);

        // ثم تطبيق الحظر
        DB::table('user_friendships')
            ->where('user_id', $friendship->sender_id)
            ->where('friend_id', $friendship->receiver_id)
            ->update([
                'is_blocked' => true,
                'blocked_at' => $friendship->blocked_at
            ]);
    }

    /**
     * التراجع عن الترقية
     */
    public function down(): void
    {
        // تنبيه: هذا سيحذف جميع البيانات في الجداول الجديدة
        DB::table('friendship_stats')->truncate();
        DB::table('user_friendships')->truncate();
        DB::table('friend_requests')->truncate();

        echo "تم حذف جميع البيانات من الجداول الجديدة\n";
    }
};