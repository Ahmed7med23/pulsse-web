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
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inviter_id'); // المدعي
            $table->string('invited_phone'); // رقم هاتف المدعو
            $table->enum('status', ['sent', 'registered', 'cancelled'])->default('sent'); // حالة الدعوة
            $table->string('invitation_code', 20)->unique(); // كود الدعوة الفريد
            $table->timestamp('sent_at')->nullable(); // تاريخ إرسال الدعوة
            $table->timestamp('registered_at')->nullable(); // تاريخ التسجيل (إذا انضم)
            $table->unsignedBigInteger('invited_user_id')->nullable(); // ID المستخدم المدعو (بعد التسجيل)
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('inviter_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('invited_user_id')->references('id')->on('users')->onDelete('set null');

            // Indexes for performance
            $table->index(['inviter_id', 'status']);
            $table->index(['invited_phone', 'status']);
            $table->index('invitation_code');

            // Unique constraint to prevent duplicate invitations to the same phone from the same user
            $table->unique(['inviter_id', 'invited_phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
