<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            // إضافة العمود subscribable_id و subscribable_type للتوافق مع webpush package
            $table->unsignedBigInteger('subscribable_id')->after('id');
            $table->string('subscribable_type')->after('subscribable_id');

            // إنشاء index مركب
            $table->index(['subscribable_id', 'subscribable_type']);
        });

        // نسخ البيانات من user_id إلى subscribable_id و subscribable_type
        DB::statement("
            UPDATE push_subscriptions
            SET subscribable_id = user_id,
                subscribable_type = 'App\\\\Models\\\\User'
            WHERE subscribable_id IS NULL
        ");

        Schema::table('push_subscriptions', function (Blueprint $table) {
            // حذف العمود القديم user_id بعد نسخ البيانات
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            // استعادة العمود user_id
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
        });

        // نسخ البيانات من subscribable_id إلى user_id
        DB::statement("
            UPDATE push_subscriptions
            SET user_id = subscribable_id
            WHERE subscribable_type = 'App\\\\Models\\\\User'
        ");

        Schema::table('push_subscriptions', function (Blueprint $table) {
            // حذف العمود الجديد
            $table->dropIndex(['subscribable_id', 'subscribable_type']);
            $table->dropColumn(['subscribable_id', 'subscribable_type']);
        });
    }
};
