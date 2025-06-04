<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * جدول الصداقات الفعلية - Pivot Table للعلاقة many-to-many
     * Actual Friendships Table - Many-to-Many Pivot
     */
    public function up(): void
    {
        Schema::create('user_friendships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('المستخدم الأول');
            $table->unsignedBigInteger('friend_id')->comment('المستخدم الثاني');
            $table->timestamp('friendship_started_at')->useCurrent()->comment('بداية الصداقة');
            $table->boolean('is_blocked')->default(false)->comment('محظور من جانب user_id');
            $table->timestamp('blocked_at')->nullable()->comment('وقت الحظر');
            $table->timestamps();

            // منع تكرار العلاقات
            $table->unique(['user_id', 'friend_id'], 'unique_friendship');

            // فهارس محسنة
            $table->index('user_id', 'idx_user_friendships');
            $table->index('friend_id', 'idx_friend_friendships');
            $table->index(['user_id', 'is_blocked'], 'idx_user_blocked');
            $table->index('friendship_started_at', 'idx_friendship_date');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('friend_id')->references('id')->on('users')->onDelete('cascade');
        });

        // إضافة constraint لمنع المستخدم من إضافة نفسه كصديق باستخدام Raw SQL
        DB::statement('ALTER TABLE user_friendships ADD CONSTRAINT chk_user_not_self CHECK (user_id != friend_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('user_friendships');
    }
};
