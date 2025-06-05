<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inviter_id',
        'invited_phone',
        'status',
        'sent_at',
        'registered_at',
        'invited_user_id',
        'invitation_code',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'registered_at' => 'datetime',
    ];

    // العلاقات
    public function inviter()
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitedUser()
    {
        return $this->belongsTo(User::class, 'invited_user_id');
    }

    // Scopes
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeRegistered($query)
    {
        return $query->where('status', 'registered');
    }

    public function scopeByInviter($query, $inviterId)
    {
        return $query->where('inviter_id', $inviterId);
    }

    public function scopeByPhone($query, $phone)
    {
        return $query->where('invited_phone', $phone);
    }

    // Helper methods
    public function markAsRegistered($userId)
    {
        $this->update([
            'status' => 'registered',
            'registered_at' => now(),
            'invited_user_id' => $userId,
        ]);
    }

    public function isRegistered()
    {
        return $this->status === 'registered';
    }

    // إنشاء كود دعوة فريد
    public static function generateInvitationCode()
    {
        do {
            $code = 'INV-' . strtoupper(Str::random(8));
        } while (self::where('invitation_code', $code)->exists());

        return $code;
    }

    // إنشاء رابط الدعوة للتسجيل
    public function getRegistrationLink()
    {
        return url("/register?inv={$this->invitation_code}");
    }

    // إنشاء رسالة WhatsApp
    public function getWhatsAppMessage()
    {
        $inviterName = $this->inviter->name;
        $registrationLink = $this->getRegistrationLink();

        $message = "💙 {$inviterName} يدعوك لتجربة *نبض* - نبضة دافئة في عالم رقمي متسارع!\n\n";
        $message .= "🌟 *هي جسر يربط القلوب المشغولة بضغطة زر، تختصر المسافات وتتجاوز حواجز الوقت*\n\n";
        $message .= "✨ *منصة عصرية تحول الذكريات العابرة إلى لحظات تواصل حقيقية*\n\n";
        $message .= "🎯 *مميزات رائعة:*\n";
        $message .= "• نبضات سريعة تصل في ثوانٍ 💫\n";
        $message .= "• دوائر ذكية للعائلة والأصدقاء والزملاء 👥\n";
        $message .= "• واجهة أنيقة وسهولة فائقة في الاستخدام 🎨\n";
        $message .= "• تواصل حقيقي بدون تعقيدات 💬\n";
        $message .= "• أنت على بُعد نبضة واحدة من كل من يهمك ❤️\n\n";
        $message .= "🚀 في عالم تتزاحم فيه المواعيد، *نبض* يقدم حلاً ذكياً يجمع بين بساطة النكزة وعمق المشاعر\n\n";
        $message .= "🔗 *انضم الآن مجاناً:*\n{$registrationLink}\n\n";
        $message .= "كود الدعوة: *{$this->invitation_code}*\n\n";
        $message .= "_لأن بعض العلاقات تحتاج فقط لنبضة لتظل حية!_ 💫\n\n";
        $message .= "*pulsse app* - One Pulse Away 🌟";

        return $message;
    }

    // رابط الواتساب المباشر
    public function getWhatsAppLink()
    {
        $message = urlencode($this->getWhatsAppMessage());
        return "https://wa.me/{$this->invited_phone}?text={$message}";
    }
}
