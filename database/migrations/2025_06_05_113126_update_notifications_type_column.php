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
        Schema::table('notifications', function (Blueprint $table) {
            // تغيير عمود type من enum إلى varchar لاستيعاب أنواع إشعارات أكثر
            $table->string('type', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // إرجاع العمود إلى enum (إذا كان كذلك في الأصل)
            $table->enum('type', [
                'pulse_received',
                'pulse_liked',
                'pulse_replied',
                'friend_request',
                'friend_accepted',
                'circle_invite',
                'system_message'
            ])->change();
        });
    }
};
