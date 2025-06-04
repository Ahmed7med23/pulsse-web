<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Pulse;
use App\Models\PulseReaction;

class PulseReactionController extends Controller
{
    /**
     * Add or update a reaction to a pulse
     */
    public function react(Request $request)
    {
        $request->validate([
            'pulse_id' => 'required|exists:pulses,id',
            'reaction_type' => 'required|in:pray,sparkles,smile,heart,thumbs_up,sad,surprised,angry'
        ]);

        $userId = Auth::id();
        $pulseId = $request->pulse_id;
        $reactionType = $request->reaction_type;

        // Check if user already reacted with this type
        $existingReaction = PulseReaction::where('pulse_id', $pulseId)
            ->where('user_id', $userId)
            ->where('reaction_type', $reactionType)
            ->first();

        if ($existingReaction) {
            // Remove the reaction if it exists (toggle off)
            $existingReaction->delete();
            $action = 'removed';
        } else {
            // Remove any other reaction by this user for this pulse (one reaction per user per pulse)
            PulseReaction::where('pulse_id', $pulseId)
                ->where('user_id', $userId)
                ->delete();

            // Add the new reaction
            PulseReaction::create([
                'pulse_id' => $pulseId,
                'user_id' => $userId,
                'reaction_type' => $reactionType
            ]);
            $action = 'added';
        }

        // Get updated reaction counts
        $reactionCounts = $this->getReactionCounts($pulseId);

        return response()->json([
            'message' => $action === 'added'
                ? 'تم إضافة رد الفعل بنجاح'
                : 'تم إزالة رد الفعل بنجاح',
            'action' => $action,
            'reaction_type' => $reactionType,
            'icon' => PulseReaction::getReactionIcon($reactionType),
            'reactions' => $reactionCounts
        ]);
    }

    /**
     * Get reaction counts for a pulse
     */
    public function getReactions(Request $request)
    {
        $request->validate([
            'pulse_id' => 'required|exists:pulses,id'
        ]);

        $pulseId = $request->pulse_id;
        $reactionCounts = $this->getReactionCounts($pulseId);

        return response()->json([
            'reactions' => $reactionCounts
        ]);
    }

    /**
     * Get formatted reaction counts for a pulse
     */
    private function getReactionCounts($pulseId)
    {
        $userId = Auth::id();

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

        $formattedReactions = [];

        foreach (PulseReaction::REACTION_TYPES as $reactionType => $emoji) {
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
     * Get users who reacted to a pulse with specific reaction
     */
    public function getReactionUsers(Request $request)
    {
        $request->validate([
            'pulse_id' => 'required|exists:pulses,id',
            'reaction_type' => 'required|in:pray,sparkles,smile,heart,thumbs_up,sad,surprised,angry'
        ]);

        $users = PulseReaction::where('pulse_id', $request->pulse_id)
            ->where('reaction_type', $request->reaction_type)
            ->with('user:id,name,avatar_url')
            ->latest()
            ->get()
            ->map(function ($reaction) {
                return [
                    'id' => $reaction->user->id,
                    'name' => $reaction->user->name,
                    'avatar' => $reaction->user->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($reaction->user->name),
                    'reacted_at' => $reaction->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'reaction_type' => $request->reaction_type,
            'icon' => PulseReaction::getReactionIcon($request->reaction_type),
            'users' => $users,
            'total_count' => $users->count()
        ]);
    }
}
