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
        Schema::table('push_subscriptions', function (Blueprint $table) {
            // Check and add missing columns if they don't exist
            if (!Schema::hasColumn('push_subscriptions', 'content_encoding')) {
                $table->string('content_encoding')->default('aesgcm')->after('auth_token');
            }

            if (!Schema::hasColumn('push_subscriptions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('content_encoding');
            }

            // Ensure auth_token column exists
            if (!Schema::hasColumn('push_subscriptions', 'auth_token')) {
                $table->string('auth_token')->after('public_key');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            // Only drop columns if they exist
            if (Schema::hasColumn('push_subscriptions', 'content_encoding')) {
                $table->dropColumn('content_encoding');
            }

            if (Schema::hasColumn('push_subscriptions', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
