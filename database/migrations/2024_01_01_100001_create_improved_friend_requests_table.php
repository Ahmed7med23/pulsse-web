<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول طلبات الصداقة - منفصل عن الصداقات الفعلية
     * Friend Requests Table - Separate from actual friendships
     */
    public function up(): void
    {
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id')->comment('من أرسل الطلب');
            $table->unsignedBigInteger('receiver_id')->comment('من استقبل الطلب');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])
                ->default('pending')
                ->comment('حالة الطلب');
            $table->text('message')->nullable()->comment('رسالة مع الطلب');
            $table->timestamp('responded_at')->nullable()->comment('وقت الرد على الطلب');
            $table->timestamps();

            // منع إرسال طلبات متكررة
            $table->unique(['sender_id', 'receiver_id'], 'unique_friend_request');

            // فهارس للأداء
            $table->index('sender_id', 'idx_sender_requests');
            $table->index('receiver_id', 'idx_receiver_requests');
            $table->index(['receiver_id', 'status'], 'idx_receiver_status');
            $table->index('status', 'idx_request_status');

            // Foreign keys
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_requests');
    }
};
