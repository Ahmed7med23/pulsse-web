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
            $table->bigInteger('sender_id');
            $table->enum('type', ['direct', 'circle'])->default('direct');
            $table->string('message');
            $table->bigInteger('circle_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'type']);
            $table->index(['circle_id']);
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