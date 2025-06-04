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
            $table->bigInteger('pulse_id');
            $table->bigInteger('recipient_id');
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();

            $table->unique(['pulse_id', 'recipient_id']);
            $table->index(['recipient_id']);
            $table->index(['pulse_id']);
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