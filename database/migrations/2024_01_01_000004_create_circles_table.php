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
        Schema::create('circles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->string('privacy_type');
            $table->unsignedBigInteger('user_id');
            $table->boolean('is_active')->default(true);
            $table->integer('members_count')->default(0);
            $table->integer('pulses_count')->default(0);
            $table->string('image_url', 2048)->nullable();
            $table->integer('pulse_strength')->default(0);
            $table->json('friend_ids')->nullable();
            $table->timestamp('last_pulse_at')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('circles');
    }
};
