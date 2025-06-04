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
        Schema::create('pulses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->enum('type', ['direct', 'circle'])->default('direct');
            $table->string('message');
            $table->unsignedBigInteger('circle_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['sender_id', 'type'], 'idx_pulses_sender_type');
            $table->index('circle_id', 'idx_pulses_circle_id');

            // Foreign key constraints
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('circle_id')->references('id')->on('circles')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulses');
    }
};
