<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول إحصائيات الصداقة - منفصل للأداء الأفضل
     * Friendship Statistics - Separate for better performance
     */
    public function up(): void
    {
        Schema::create('friendship_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('المستخدم');
            $table->unsignedBigInteger('friend_id')->comment('الصديق');

            // إحصائيات النبضات
            $table->integer('pulses_sent')->default(0)->comment('النبضات المرسلة');
            $table->integer('pulses_received')->default(0)->comment('النبضات المستقبلة');
            $table->integer('total_pulses')->default(0)->comment('إجمالي النبضات');

            // إحصائيات الاستجابة
            $table->decimal('response_rate', 5, 2)->default(0.00)->comment('معدل الاستجابة');
            $table->integer('response_time_avg')->default(0)->comment('متوسط وقت الاستجابة بالدقائق');

            // إحصائيات التفاعل
            $table->integer('reactions_given')->default(0)->comment('ردود الأفعال المعطاة');
            $table->integer('reactions_received')->default(0)->comment('ردود الأفعال المستقبلة');
            $table->integer('streak_days')->default(0)->comment('أيام التواصل المتتالية');

            // تواريخ مهمة
            $table->timestamp('last_pulse_at')->nullable()->comment('آخر نبضة');
            $table->timestamp('last_interaction_at')->nullable()->comment('آخر تفاعل');
            $table->date('streak_started_at')->nullable()->comment('بداية سلسلة التواصل');

            // إعدادات شخصية
            $table->boolean('is_favorite')->default(false)->comment('مفضل');
            $table->boolean('notifications_enabled')->default(true)->comment('تفعيل الإشعارات');
            $table->string('custom_nickname', 50)->nullable()->comment('لقب مخصص');

            $table->timestamps();

            // فهارس محسنة
            $table->unique(['user_id', 'friend_id'], 'unique_friendship_stats');
            $table->index(['user_id', 'is_favorite'], 'idx_user_favorites');
            $table->index(['user_id', 'total_pulses'], 'idx_user_pulse_count');
            $table->index(['user_id', 'last_pulse_at'], 'idx_user_last_pulse');
            $table->index('streak_days', 'idx_streak_days');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('friend_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friendship_stats');
    }
};
