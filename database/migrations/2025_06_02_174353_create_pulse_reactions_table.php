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
        Schema::create('pulse_reactions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('pulse_id');
            $table->bigInteger('user_id');
            $table->enum('reaction_type', ['🙏', '✨', '😊', '❤️', '👍', '😢', '😮', '😡']);
            $table->timestamps();

            // Unique constraint: المستخدم يمكنه فقط وضع رد فعل واحد من نوع معين لكل نبضة
            $table->unique(['pulse_id', 'user_id', 'reaction_type'], 'unique_user_pulse_reaction');

            // Indexes for better performance
            $table->index(['pulse_id']);
            $table->index(['user_id']);
            $table->index(['pulse_id', 'reaction_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulse_reactions');
    }
};