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
        Schema::create('pulse_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pulse_id');
            $table->unsignedBigInteger('recipient_id');
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();

            // Unique constraint
            $table->unique(['pulse_id', 'recipient_id'], 'unique_pulse_recipient');

            // Indexes
            $table->index('recipient_id', 'idx_pulse_recipients_recipient_id');
            $table->index('pulse_id', 'idx_pulse_recipients_pulse_id');

            // Foreign key constraints
            $table->foreign('pulse_id')->references('id')->on('pulses')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulse_recipients');
    }
};
