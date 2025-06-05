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
        // فحص وجود الجدول أولاً لتجنب الخطأ
        if (!Schema::hasTable('push_subscriptions')) {
            Schema::create('push_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->text('endpoint');
                $table->string('public_key');
                $table->string('auth_token');
                $table->string('content_encoding')->default('aesgcm');
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Indexes
                $table->index(['user_id', 'is_active']);
                $table->index('endpoint');
            });
        } else {
            // إذا كان الجدول موجوداً، تأكد من وجود الأعمدة المطلوبة
            Schema::table('push_subscriptions', function (Blueprint $table) {
                if (!Schema::hasColumn('push_subscriptions', 'content_encoding')) {
                    $table->string('content_encoding')->default('aesgcm')->after('auth_token');
                }

                if (!Schema::hasColumn('push_subscriptions', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('content_encoding');
                }

                if (!Schema::hasColumn('push_subscriptions', 'auth_token')) {
                    $table->string('auth_token')->after('public_key');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
