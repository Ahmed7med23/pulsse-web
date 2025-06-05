<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Invitation;
use App\Services\NotificationService;
use Inertia\Inertia;

class InvitationController extends Controller
{
    /**
     * عرض صفحة الدعوات
     */
    public function index()
    {
        $user = Auth::user();

        // الدعوات المرسلة
        $sentInvitations = Invitation::byInviter($user->id)
            ->with('invitedUser')
            ->orderBy('sent_at', 'desc')
            ->get()
            ->map(function ($invitation) {
                return [
                    'id' => $invitation->id,
                    'phone' => $invitation->invited_phone,
                    'status' => $invitation->status,
                    'sent_at' => $invitation->sent_at->diffForHumans(),
                    'registered_at' => $invitation->registered_at?->diffForHumans(),
                    'invited_user' => $invitation->invitedUser ? [
                        'id' => $invitation->invitedUser->id,
                        'name' => $invitation->invitedUser->name,
                        'avatar' => $invitation->invitedUser->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($invitation->invitedUser->name),
                    ] : null,
                ];
            });

        // إحصائيات
        $stats = [
            'total_sent' => $sentInvitations->count(),
            'registered' => $sentInvitations->where('status', 'registered')->count(),
            'pending' => $sentInvitations->where('status', 'sent')->count(),
        ];

        return Inertia::render('invitations/InvitationsPage', [
            'sentInvitations' => $sentInvitations,
            'stats' => $stats,
        ]);
    }

    /**
     * إرسال دعوة جديدة
     */
    public function sendInvitation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^[0-9+\-\s()]+$/|min:10|max:20',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.regex' => 'رقم الهاتف غير صحيح',
            'phone.min' => 'رقم الهاتف قصير جداً',
            'phone.max' => 'رقم الهاتف طويل جداً',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $userId = Auth::id();
        $phone = $this->normalizePhoneNumber($request->phone);

        // التحقق من عدم وجود دعوة سابقة لنفس الرقم
        $existingInvitation = Invitation::byInviter($userId)
            ->byPhone($phone)
            ->where('status', 'sent')
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['phone' => 'تم إرسال دعوة لهذا الرقم مسبقاً']);
        }

        // التحقق من عدم وجود مستخدم مسجل بهذا الرقم
        $existingUser = \App\Models\User::where('phone', $phone)->first();
        if ($existingUser) {
            return back()->withErrors(['phone' => 'هذا الرقم مسجل بالفعل في المنصة']);
        }

        // إنشاء الدعوة
        $invitation = Invitation::create([
            'inviter_id' => $userId,
            'invited_phone' => $phone,
            'invitation_code' => Invitation::generateInvitationCode(),
            'sent_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الدعوة بنجاح!',
            'invitation' => [
                'id' => $invitation->id,
                'phone' => $invitation->invited_phone,
                'whatsapp_link' => $invitation->getWhatsAppLink(),
                'registration_link' => $invitation->getRegistrationLink(),
                'whatsapp_message' => $invitation->getWhatsAppMessage(),
            ],
        ]);
    }

    /**
     * معالجة التسجيل عبر الدعوة
     */
    public function handleInvitedRegistration($invitationCode, $newUserId)
    {
        $invitation = Invitation::where('invitation_code', $invitationCode)
            ->where('status', 'sent')
            ->first();

        if (!$invitation) {
            return false;
        }

        // تحديث حالة الدعوة
        $invitation->markAsRegistered($newUserId);

        // إضافة صداقة تلقائية
        $this->createFriendship($invitation->inviter_id, $newUserId);

        // إرسال إشعار للمدعي
        NotificationService::sendFriendJoinedThroughInvitation($invitation->inviter_id, $newUserId);

        return true;
    }

    /**
     * إنشاء صداقة تلقائية
     */
    private function createFriendship($inviterId, $invitedUserId)
    {
        $friendshipDate = now();

        // إنشاء العلاقة في الاتجاهين
        \Illuminate\Support\Facades\DB::table('user_friendships')->insert([
            [
                'user_id' => $inviterId,
                'friend_id' => $invitedUserId,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => false,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ],
            [
                'user_id' => $invitedUserId,
                'friend_id' => $inviterId,
                'friendship_started_at' => $friendshipDate,
                'is_blocked' => false,
                'created_at' => $friendshipDate,
                'updated_at' => $friendshipDate,
            ]
        ]);

        // إنشاء الإحصائيات
        \App\Models\FriendshipStats::create([
            'user_id' => $inviterId,
            'friend_id' => $invitedUserId,
        ]);

        \App\Models\FriendshipStats::create([
            'user_id' => $invitedUserId,
            'friend_id' => $inviterId,
        ]);
    }

    /**
     * تطبيع رقم الهاتف
     */
    private function normalizePhoneNumber($phone)
    {
        // إزالة المسافات والرموز
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // إضافة رمز الدولة إذا لم يكن موجوداً
        if (!str_starts_with($phone, '+')) {
            if (str_starts_with($phone, '0')) {
                $phone = '+966' . substr($phone, 1); // السعودية كمثال
            } else {
                $phone = '+966' . $phone;
            }
        }

        return $phone;
    }
}
