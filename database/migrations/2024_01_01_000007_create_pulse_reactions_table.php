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
            $table->unsignedBigInteger('pulse_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('reaction_type', [
                'pray',      // 🙏
                'sparkles',  // ✨
                'smile',     // 😊
                'heart',     // ❤️
                'thumbs_up', // 👍
                'sad',       // 😢
                'surprised', // 😮
                'angry'      // 😡
            ]);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Unique constraint - user can only react once per pulse with same reaction type
            $table->unique(['pulse_id', 'user_id', 'reaction_type'], 'unique_user_pulse_reaction');

            // Indexes
            $table->index('pulse_id', 'idx_pulse_reactions_pulse_id');
            $table->index('user_id', 'idx_pulse_reactions_user_id');
            $table->index(['pulse_id', 'reaction_type'], 'idx_pulse_reactions_pulse_reaction');

            // Foreign key constraints
            $table->foreign('pulse_id')->references('id')->on('pulses')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
