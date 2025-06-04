<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->comment('اسم المستخدم');
            $table->string('email')->nullable()->unique()->comment('البريد الإلكتروني');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone', 20)->nullable()->unique()->comment('رقم الهاتف');
            $table->string('password')->comment('كلمة المرور (مشفرة)');
            $table->string('avatar_url', 1024)->nullable()->comment('رابط الصورة الشخصية');
            $table->char('avatar_fallback', 1)->nullable()->comment('الحرف الأول للاسم (يظهر عند عدم وجود صورة)');
            $table->string('city', 100)->nullable()->comment('المدينة');
            $table->string('country', 200)->nullable();
            $table->text('bio')->nullable()->comment('نبذة شخصية');
            $table->integer('otp')->nullable();
            $table->integer('pulse_score')->default(0)->comment('نقاط النبض');
            $table->integer('pulse_level')->default(1)->comment('مستوى النبض');
            $table->integer('pulse_strength')->default(0)->comment('قوة النبض (0-100)');
            $table->integer('pulses_count')->default(0)->comment('عدد النبضات');
            $table->decimal('response_rate', 5, 2)->default(0.00)->comment('معدل الاستجابة');
            $table->string('birth_date', 20)->nullable();
            $table->string('gender', 20)->nullable();
            $table->integer('streak_days')->default(0)->comment('أيام التواصل المتتالية');
            $table->rememberToken();
            $table->boolean('is_online')->default(false)->comment('متصل حالياً');
            $table->boolean('is_active')->default(true)->comment('الحساب نشط');
            $table->timestamp('last_active')->nullable()->comment('آخر نشاط');
            $table->timestamp('last_pulse_time')->nullable()->comment('وقت آخر نبضة');
            $table->boolean('notification_enabled')->default(true)->comment('تفعيل الإشعارات');
            $table->enum('privacy_level', ['public', 'private'])->default('public')->comment('مستوى الخصوصية');
            $table->string('language', 10)->default('ar')->comment('اللغة المفضلة');
            $table->timestamps();

            // Indexes
            $table->index('email', 'idx_users_email');
            $table->index('phone', 'idx_users_phone');
            $table->index('pulse_score', 'idx_users_pulse_score');
            $table->index('last_active', 'idx_users_last_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
