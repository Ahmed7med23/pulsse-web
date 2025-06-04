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
        Schema::table('pulse_reactions', function (Blueprint $table) {
            // Drop the old unique constraint
            $table->dropUnique('unique_user_pulse_reaction');

            // Add new unique constraint: one reaction per user per pulse
            $table->unique(['pulse_id', 'user_id'], 'unique_user_pulse_single_reaction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pulse_reactions', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('unique_user_pulse_single_reaction');

            // Restore the old constraint
            $table->unique(['pulse_id', 'user_id', 'reaction_type'], 'unique_user_pulse_reaction');
        });
    }
};
