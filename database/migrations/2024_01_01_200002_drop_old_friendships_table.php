<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * حذف الجدول القديم بعد التأكد من نجاح الترقية
     * Drop old friendships table after confirming successful migration
     */
    public function up(): void
    {
        // التأكد من وجود البيانات في الجداول الجديدة
        $this->validateMigrationSuccess();

        // إنشاء نسخة احتياطية قبل الحذف (اختياري)
        $this->createBackupTable();

        // حذف الجدول القديم
        if (Schema::hasTable('friendships')) {
            Schema::dropIfExists('friendships');
            echo "تم حذف جدول friendships القديم بنجاح ✅\n";
        }
    }

    /**
     * التأكد من نجاح عملية الترقية
     */
    private function validateMigrationSuccess(): void
    {
        // عدد السجلات في الجدول القديم
        $oldCount = 0;
        if (Schema::hasTable('friendships')) {
            $oldCount = DB::table('friendships')->count();
        }

        // عدد السجلات في الجداول الجديدة
        $newRequestsCount = DB::table('friend_requests')->count();
        $newFriendshipsCount = DB::table('user_friendships')->count();
        $newStatsCount = DB::table('friendship_stats')->count();

        echo "📊 إحصائيات الترقية:\n";
        echo "- السجلات القديمة: {$oldCount}\n";
        echo "- طلبات الصداقة الجديدة: {$newRequestsCount}\n";
        echo "- الصداقات الجديدة: {$newFriendshipsCount}\n";
        echo "- إحصائيات الصداقة: {$newStatsCount}\n";

        // تحقق بسيط من نجاح الترقية
        if ($oldCount > 0 && ($newRequestsCount === 0 && $newFriendshipsCount === 0)) {
            throw new Exception(
                "❌ خطأ: لم يتم ترقية البيانات بشكل صحيح!\n" .
                    "يرجى تشغيل migration الترقية أولاً قبل حذف الجدول القديم."
            );
        }

        echo "✅ تم التحقق من نجاح الترقية\n";
    }

    /**
     * إنشاء نسخة احتياطية من الجدول القديم
     */
    private function createBackupTable(): void
    {
        if (Schema::hasTable('friendships')) {
            // إنشاء جدول النسخة الاحتياطية
            $backupTableName = 'friendships_backup_' . date('Y_m_d_His');

            DB::statement("CREATE TABLE {$backupTableName} AS SELECT * FROM friendships");

            echo "💾 تم إنشاء نسخة احتياطية: {$backupTableName}\n";
            echo "يمكنك حذف هذا الجدول لاحقاً إذا كان كل شيء يعمل بشكل صحيح\n";
        }
    }

    /**
     * استعادة الجدول القديم (في حالة الطوارئ)
     */
    public function down(): void
    {
        // البحث عن أحدث نسخة احتياطية
        $tables = DB::select("SHOW TABLES LIKE 'friendships_backup_%'");

        if (empty($tables)) {
            echo "❌ لا توجد نسخة احتياطية لاستعادة الجدول القديم\n";
            echo "ستحتاج لاستعادة البيانات يدوياً من الجداول الجديدة\n";
            return;
        }

        // العثور على أحدث نسخة احتياطية
        $latestBackup = null;
        $latestTime = 0;

        foreach ($tables as $table) {
            $tableName = array_values((array) $table)[0];
            $timeStr = str_replace('friendships_backup_', '', $tableName);
            $timestamp = strtotime(str_replace('_', '', $timeStr));

            if ($timestamp > $latestTime) {
                $latestTime = $timestamp;
                $latestBackup = $tableName;
            }
        }

        if ($latestBackup) {
            // استعادة الجدول من النسخة الاحتياطية
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
            });

            DB::statement("INSERT INTO friendships SELECT * FROM {$latestBackup}");

            echo "✅ تم استعادة جدول friendships من النسخة الاحتياطية: {$latestBackup}\n";
        }
    }
};
