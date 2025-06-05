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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            // المستخدم المستقبل للإشعار
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // المستخدم المرسل للإشعار (اختياري)
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('cascade');

            // نوع الإشعار
            $table->enum('type', [
                'pulse_received',     // استقبال نبضة
                'pulse_liked',        // إعجاب بالنبضة
                'pulse_replied',      // رد على النبضة
                'friend_request',     // طلب صداقة
                'friend_accepted',    // قبول صداقة
                'circle_invite',      // دعوة لدائرة
                'circle_joined',      // انضمام لدائرة
                'system_message'      // رسالة نظام
            ]);

            // عنوان الإشعار
            $table->string('title');

            // محتوى الإشعار
            $table->text('message');

            // البيانات الإضافية (JSON)
            $table->json('data')->nullable();

            // معرف العنصر المرتبط (pulse_id, friend_request_id, etc.)
            $table->unsignedBigInteger('related_id')->nullable();

            // نوع العنصر المرتبط
            $table->string('related_type')->nullable();

            // رابط الإجراء
            $table->string('action_url')->nullable();

            // حالة القراءة
            $table->boolean('is_read')->default(false);

            // تاريخ القراءة
            $table->timestamp('read_at')->nullable();

            // أولوية الإشعار
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');

            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'created_at']);
            $table->index(['related_id', 'related_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
