<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Pulse;
use App\Models\PulseRecipient;
use App\Models\FriendshipStats;
use App\Models\PulseReaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PulsesController extends Controller
{

    public function index()
    {
        $userId = Auth::id();

        // النبضات المرسلة إليك
        $receivedPulses = PulseRecipient::where('recipient_id', $userId)
            ->with(['pulse.sender'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // إحصائيات النبضات للـ Polling
        $pulseStats = [
            'totalSent' => Pulse::where('sender_id', $userId)->count(),
            'totalReceived' => PulseRecipient::where('recipient_id', $userId)->count(),
            'unreadCount' => PulseRecipient::where('recipient_id', $userId)
                ->whereNull('seen_at')->count(),
            'activeFriends' => DB::table('user_friendships')
                ->where('user_id', $userId)
                ->where('is_blocked', false)
                ->count(),
            'engagementRate' => $this->calculateEngagementRate($userId),
            'lastActivity' => PulseRecipient::where('recipient_id', $userId)
                ->latest('created_at')
                ->value('created_at'),
        ];

        return Inertia::render('home/HomePage', [
            'receivedPulses' => $receivedPulses,
            'pulseStats' => $pulseStats,
        ]);
    }

    /**
     * حساب معدل التفاعل
     */
    private function calculateEngagementRate($userId)
    {
        $totalSent = Pulse::where('sender_id', $userId)->count();

        if ($totalSent === 0) {
            return 0;
        }

        $totalReactions = PulseReaction::whereHas('pulse', function ($query) use ($userId) {
            $query->where('sender_id', $userId);
        })->count();

        return round(($totalReactions / $totalSent) * 100, 1);
    }

    /**
     * Send a direct pulse to a friend
     */
    public function send(Request $request)
    {
        $request->validate([
            'type' => 'required|in:direct,circle',
            'message' => 'required|string|max:255',
            'friend_id' => 'required_if:type,direct|exists:users,id',
            'circle_id' => 'required_if:type,circle|exists:circles,id',
        ]);

        if ($request->type === 'direct') {
            return $this->sendDirectPulse($request);
        } else {
            return $this->sendCirclePulse($request);
        }
    }

    /**
     * Send pulse to a specific friend
     */
    private function sendDirectPulse(Request $request)
    {
        $friend = User::find($request->friend_id);
        $userId = Auth::id();

        // Check if friendship exists in the new system using user_friendships table
        $friendship = DB::table('user_friendships')
            ->where('user_id', $userId)
            ->where('friend_id', $friend->id)
            ->where('is_blocked', false)
            ->first();

        if (!$friendship) {
            return response()->json([
                'message' => 'لا يمكنك إرسال pulse لهذا المستخدم - لستما أصدقاء'
            ], 403);
        }

        // Create the pulse
        $pulse = Pulse::create([
            'sender_id' => $userId,
            'type' => Pulse::TYPE_DIRECT,
            'message' => $request->message,
            'metadata' => [
                'direct_recipient_id' => $friend->id,
                'direct_recipient_name' => $friend->name,
            ]
        ]);

        // Add recipient
        PulseRecipient::create([
            'pulse_id' => $pulse->id,
            'recipient_id' => $friend->id,
        ]);

        // Update friendship statistics
        $stats = FriendshipStats::where('user_id', $userId)
            ->where('friend_id', $friend->id)
            ->first();

        if ($stats) {
            $stats->increment('total_pulses');
            $stats->update(['last_pulse_at' => now()]);
        }

        return response()->json([
            'message' => 'تم إرسال الـ pulse بنجاح',
            'pulse' => [
                'id' => $pulse->id,
                'type' => $pulse->type,
                'message' => $pulse->message,
                'sent_to' => $friend->name,
                'recipients_count' => 1,
                'sent_at' => $pulse->created_at->diffForHumans(),
            ]
        ]);
    }

    /**
     * Send pulse to a circle of friends
     */
    private function sendCirclePulse(Request $request)
    {
        $userId = Auth::id();
        $circleId = $request->circle_id;

        // Check if circle exists and user owns it
        $circle = DB::table('circles')
            ->where('id', $circleId)
            ->where('user_id', $userId)
            ->first();

        if (!$circle) {
            return response()->json([
                'message' => 'الدائرة غير موجودة أو لا تملك صلاحية للوصول إليها'
            ], 403);
        }

        // Get all circle members
        $circleMembers = DB::table('circle_members')
            ->join('users', 'circle_members.user_id', '=', 'users.id')
            ->where('circle_members.circle_id', $circleId)
            ->select('users.id', 'users.name')
            ->get();

        if ($circleMembers->isEmpty()) {
            return response()->json([
                'message' => 'لا يوجد أعضاء في هذه الدائرة'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create the pulse
            $pulse = Pulse::create([
                'sender_id' => $userId,
                'type' => Pulse::TYPE_CIRCLE,
                'message' => $request->message,
                'metadata' => [
                    'circle_id' => $circleId,
                    'circle_name' => $circle->name,
                    'recipients_count' => $circleMembers->count(),
                ]
            ]);

            // Add all circle members as recipients
            $recipients = [];
            foreach ($circleMembers as $member) {
                $recipients[] = [
                    'pulse_id' => $pulse->id,
                    'recipient_id' => $member->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            PulseRecipient::insert($recipients);

            // Update friendship statistics for all members
            foreach ($circleMembers as $member) {
                $stats = FriendshipStats::where('user_id', $userId)
                    ->where('friend_id', $member->id)
                    ->first();

                if ($stats) {
                    $stats->increment('total_pulses');
                    $stats->update(['last_pulse_at' => now()]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'تم إرسال النبضة إلى جميع أعضاء الدائرة بنجاح',
                'pulse' => [
                    'id' => $pulse->id,
                    'type' => $pulse->type,
                    'message' => $pulse->message,
                    'sent_to_circle' => $circle->name,
                    'recipients_count' => $circleMembers->count(),
                    'sent_at' => $pulse->created_at->diffForHumans(),
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to send circle pulse', [
                'circle_id' => $circleId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'حدث خطأ أثناء إرسال النبضة'
            ], 500);
        }
    }

    /**
     * Get user's sent pulses
     */
    public function sentPulses()
    {
        $userId = Auth::id();
        $currentUser = Auth::user();

        $pulses = Pulse::where('sender_id', $userId)
            ->with(['recipients.recipient', 'reactions'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pulse) use ($userId, $currentUser) {
                // Get reactions summary
                $reactionsSummary = $this->formatReactionsForPulse($pulse->id, $userId);

                return [
                    'id' => $pulse->id,
                    'user' => [
                        'name' => $currentUser->name,
                        'avatar' => $currentUser->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($currentUser->name),
                    ],
                    'message' => $pulse->message,
                    'timeAgo' => $pulse->created_at->diffForHumans(),
                    'reactions' => $reactionsSummary,
                    'recipients_count' => $pulse->recipients->count(),
                    'recipients' => $pulse->recipients->map(function ($recipient) {
                        return [
                            'id' => $recipient->recipient->id,
                            'name' => $recipient->recipient->name,
                            'seen' => !is_null($recipient->seen_at),
                        ];
                    }),
                ];
            });

        return response()->json($pulses);
    }

    /**
     * Get user's received pulses
     */
    public function receivedPulses()
    {
        $userId = Auth::id();

        $pulses = PulseRecipient::where('recipient_id', $userId)
            ->with(['pulse.sender', 'pulse.reactions'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($recipient) use ($userId) {
                $pulse = $recipient->pulse;

                // Get reactions summary with user's active state
                $reactionsSummary = $this->formatReactionsForPulse($pulse->id, $userId);

                return [
                    'id' => $pulse->id,
                    'user' => [
                        'name' => $pulse->sender->name,
                        'avatar' => $pulse->sender->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($pulse->sender->name),
                    ],
                    'message' => $pulse->message,
                    'timeAgo' => $pulse->created_at->diffForHumans(),
                    'reactions' => $reactionsSummary,
                    'seen' => !is_null($recipient->seen_at),
                    'seen_at' => $recipient->seen_at?->diffForHumans(),
                ];
            });

        return response()->json($pulses);
    }

    /**
     * Format reactions for a pulse in the required structure
     */
    private function formatReactionsForPulse($pulseId, $userId)
    {
        // Get all reactions for the pulse
        $reactions = PulseReaction::where('pulse_id', $pulseId)
            ->selectRaw('
                reaction_type,
                COUNT(*) as count,
                MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as user_reacted
            ', [$userId])
            ->groupBy('reaction_type')
            ->get()
            ->keyBy('reaction_type');

        // Mapping between database values and emoji icons
        $reactionMapping = [
            'pray' => '🙏',
            'sparkles' => '✨',
            'smile' => '😊',
            'heart' => '❤️',
            'thumbs_up' => '👍',
            'sad' => '😢',
            'surprised' => '😮',
            'angry' => '😡'
        ];

        $formattedReactions = [];

        foreach ($reactionMapping as $reactionType => $emoji) {
            $reactionData = $reactions->get($reactionType);

            $formattedReactions[] = [
                'type' => $reactionType,
                'icon' => $emoji,
                'active' => $reactionData ? (bool) $reactionData->user_reacted : false,
                'count' => $reactionData ? $reactionData->count : 0,
            ];
        }

        return $formattedReactions;
    }

    /**
     * Get all user's pulses (sent and received) combined
     */
    public function allPulses()
    {
        $userId = Auth::id();

        // Get received pulses
        $receivedPulses = PulseRecipient::where('recipient_id', $userId)
            ->with(['pulse.sender', 'pulse.reactions'])
            ->get()
            ->map(function ($recipient) use ($userId) {
                $pulse = $recipient->pulse;
                $reactionsSummary = $this->formatReactionsForPulse($pulse->id, $userId);

                // Get circle info if it's a circle pulse
                $circleName = null;
                if ($pulse->isCircle() && isset($pulse->metadata['circle_name'])) {
                    $circleName = $pulse->metadata['circle_name'];
                }

                return [
                    'id' => $pulse->id,
                    'type' => 'received',
                    'pulse_type' => $pulse->type, // 'direct' or 'circle'
                    'user' => [
                        'name' => $pulse->sender->name,
                        'avatar' => $pulse->sender->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($pulse->sender->name),
                    ],
                    'message' => $pulse->message,
                    'timeAgo' => $pulse->created_at->diffForHumans(),
                    'reactions' => $reactionsSummary,
                    'seen' => !is_null($recipient->seen_at),
                    'circleName' => $circleName,
                    'created_at' => $pulse->created_at,
                ];
            });

        // Get sent pulses
        $currentUser = Auth::user();
        $sentPulses = Pulse::where('sender_id', $userId)
            ->with(['recipients.recipient', 'reactions'])
            ->get()
            ->map(function ($pulse) use ($userId, $currentUser) {
                $reactionsSummary = $this->formatReactionsForPulse($pulse->id, $userId);

                // Get circle info if it's a circle pulse
                $circleName = null;
                if ($pulse->isCircle() && isset($pulse->metadata['circle_name'])) {
                    $circleName = $pulse->metadata['circle_name'];
                }

                // For direct pulses, get the recipient info from metadata for better display
                $directRecipientName = null;
                if ($pulse->isDirect() && isset($pulse->metadata['direct_recipient_name'])) {
                    $directRecipientName = $pulse->metadata['direct_recipient_name'];
                }

                return [
                    'id' => $pulse->id,
                    'type' => 'sent',
                    'pulse_type' => $pulse->type, // 'direct' or 'circle'
                    'user' => [
                        'name' => $currentUser->name,
                        'avatar' => $currentUser->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($currentUser->name),
                    ],
                    'message' => $pulse->message,
                    'timeAgo' => $pulse->created_at->diffForHumans(),
                    'reactions' => $reactionsSummary,
                    'recipients_count' => $pulse->recipients->count(),
                    'circleName' => $circleName,
                    'directRecipientName' => $directRecipientName,
                    'recipients' => $pulse->recipients->map(function ($recipient) {
                        return [
                            'id' => $recipient->recipient->id,
                            'name' => $recipient->recipient->name,
                            'seen' => !is_null($recipient->seen_at),
                        ];
                    }),
                    'created_at' => $pulse->created_at,
                ];
            });

        // Combine and sort by creation date
        $allPulses = $receivedPulses->concat($sentPulses)
            ->sortByDesc('created_at')
            ->values()
            ->map(function ($pulse) {
                unset($pulse['created_at']); // Remove the sorting field
                return $pulse;
            });

        return response()->json($allPulses);
    }

    /**
     * Toggle a reaction on a pulse
     */
    public function toggleReaction(Request $request)
    {
        $request->validate([
            'pulseId' => 'required|exists:pulses,id',
            'reactionType' => 'required|in:pray,sparkles,smile,heart,thumbs_up,sad,surprised,angry',
        ]);

        $userId = Auth::id();
        $pulseId = $request->pulseId;
        $reactionType = $request->reactionType;

        // Check if the pulse exists and user has access to it
        $pulse = Pulse::find($pulseId);

        // Check if user can react to this pulse (either sender or recipient)
        $canReact = $pulse->sender_id === $userId ||
            PulseRecipient::where('pulse_id', $pulseId)
            ->where('recipient_id', $userId)
            ->exists();

        if (!$canReact) {
            return response()->json([
                'message' => 'لا يمكنك التفاعل مع هذه النبضة'
            ], 403);
        }

        // Check if user already has any reaction on this pulse
        $existingReaction = PulseReaction::where('pulse_id', $pulseId)
            ->where('user_id', $userId)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->reaction_type === $reactionType) {
                // Same reaction - remove it
                $existingReaction->delete();
                $action = 'removed';
            } else {
                // Different reaction - update it
                $existingReaction->update(['reaction_type' => $reactionType]);
                $action = 'updated';
            }
        } else {
            // No existing reaction - create new one
            PulseReaction::create([
                'pulse_id' => $pulseId,
                'user_id' => $userId,
                'reaction_type' => $reactionType,
            ]);
            $action = 'added';
        }

        // Return updated reactions summary
        $reactionsSummary = $this->formatReactionsForPulse($pulseId, $userId);

        return response()->json([
            'message' => 'تم تحديث التفاعل بنجاح',
            'action' => $action,
            'reactions' => $reactionsSummary,
        ]);
    }

    /**
     * Get users who reacted with specific reaction type
     */
    public function getReactionUsers($pulseId, $reactionType)
    {
        // Validate reaction type
        $validReactions = ['pray', 'sparkles', 'smile', 'heart', 'thumbs_up', 'sad', 'surprised', 'angry'];
        if (!in_array($reactionType, $validReactions)) {
            return response()->json([
                'message' => 'نوع التفاعل غير صحيح'
            ], 400);
        }

        // Check if pulse exists
        $pulse = Pulse::find($pulseId);
        if (!$pulse) {
            return response()->json([
                'message' => 'النبضة غير موجودة'
            ], 404);
        }

        // Check if current user has access to see reactions
        $userId = Auth::id();
        $canView = $pulse->sender_id === $userId ||
            PulseRecipient::where('pulse_id', $pulseId)
            ->where('recipient_id', $userId)
            ->exists();

        if (!$canView) {
            return response()->json([
                'message' => 'لا يمكنك رؤية تفاعلات هذه النبضة'
            ], 403);
        }

        // Get users who reacted with this reaction type
        $users = PulseReaction::where('pulse_id', $pulseId)
            ->where('reaction_type', $reactionType)
            ->with('user:id,name,avatar_url')
            ->get()
            ->map(function ($reaction) {
                return [
                    'id' => $reaction->user->id,
                    'name' => $reaction->user->name,
                    'avatar' => $reaction->user->avatar_url ?: 'https://ui-avatars.com/api/?name=' . urlencode($reaction->user->name),
                    'reacted_at' => $reaction->created_at->diffForHumans(),
                ];
            });

        return response()->json($users);
    }

    /**
     * Mark a pulse as seen by the current user
     */
    public function markAsSeen($pulseId)
    {
        $userId = Auth::id();

        // Find the pulse recipient record for this user
        $recipient = PulseRecipient::where('pulse_id', $pulseId)
            ->where('recipient_id', $userId)
            ->whereNull('seen_at')
            ->first();

        if (!$recipient) {
            return response()->json([
                'message' => 'النبضة غير موجودة أو تم قراءتها مسبقاً'
            ], 404);
        }

        // Mark as seen
        $recipient->update([
            'seen_at' => now()
        ]);

        return response()->json([
            'message' => 'تم تحديد النبضة كمقروءة',
            'seen_at' => $recipient->seen_at->diffForHumans()
        ]);
    }
}
