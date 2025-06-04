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
        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('receiver_id');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'blocked'])->default('pending');
            $table->integer('pulses_count')->default(0);
            $table->timestamp('last_pulse_at')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->decimal('response_rate', 5, 2)->default(0.00);
            $table->timestamp('blocked_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['sender_id', 'receiver_id'], 'idx_sender_receiver');
            $table->index('status', 'idx_status');
            $table->index('is_favorite', 'idx_is_favorite');

            // Foreign key constraints
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friendships');
    }
};