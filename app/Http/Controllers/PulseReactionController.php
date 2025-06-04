<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Pulse;
use App\Models\PulseReaction;

class PulseReactionController extends Controller
{
    /**
     * Add or toggle a reaction to a pulse
     */
    public function toggleReaction(Request $request, $pulseId)
    {
        $request->validate([
            'reaction_type' => 'required|in:🙏,✨,😊,❤️,👍,😢,😮,😡',
        ]);

        $pulse = Pulse::findOrFail($pulseId);
        $userId = Auth::id();

        // Check if user already has this reaction
        $existingReaction = PulseReaction::where([
            'pulse_id' => $pulseId,
            'user_id' => $userId,
            'reaction_type' => $request->reaction_type,
        ])->first();

        if ($existingReaction) {
            // Remove existing reaction
            $existingReaction->delete();
            $action = 'removed';
        } else {
            // Add new reaction
            PulseReaction::create([
                'pulse_id' => $pulseId,
                'user_id' => $userId,
                'reaction_type' => $request->reaction_type,
            ]);
            $action = 'added';
        }

        // Get updated reactions summary
        $reactionsSummary = $this->getReactionsSummary($pulseId);

        return response()->json([
            'message' => $action === 'added' ? 'تم إضافة التفاعل' : 'تم إزالة التفاعل',
            'action' => $action,
            'reactions' => $reactionsSummary,
        ]);
    }

    /**
     * Get all reactions for a pulse
     */
    public function getPulseReactions($pulseId)
    {
        $reactions = PulseReaction::where('pulse_id', $pulseId)
            ->with('user:id,name,avatar')
            ->get()
            ->groupBy('reaction_type')
            ->map(function ($reactions, $type) {
                return [
                    'type' => $type,
                    'count' => $reactions->count(),
                    'users' => $reactions->map(function ($reaction) {
                        return [
                            'id' => $reaction->user->id,
                            'name' => $reaction->user->name,
                            'avatar' => $reaction->user->avatar,
                            'reacted_at' => $reaction->created_at->diffForHumans(),
                        ];
                    }),
                ];
            })
            ->values();

        return response()->json($reactions);
    }

    /**
     * Get reactions summary for a pulse
     */
    private function getReactionsSummary($pulseId)
    {
        $userId = Auth::id();

        $summary = PulseReaction::where('pulse_id', $pulseId)
            ->selectRaw('
                reaction_type,
                COUNT(*) as count,
                MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as user_reacted
            ', [$userId])
            ->groupBy('reaction_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [
                    $item->reaction_type => [
                        'count' => $item->count,
                        'active' => (bool) $item->user_reacted,
                    ]
                ];
            });

        // Add missing reaction types with 0 count
        $allReactionTypes = ['🙏', '✨', '😊', '❤️', '👍', '😢', '😮', '😡'];
        foreach ($allReactionTypes as $type) {
            if (!isset($summary[$type])) {
                $summary[$type] = ['count' => 0, 'active' => false];
            }
        }

        return $summary;
    }

    /**
     * Get user's reaction for a pulse
     */
    public function getUserReaction($pulseId)
    {
        $reaction = PulseReaction::where([
            'pulse_id' => $pulseId,
            'user_id' => Auth::id(),
        ])->first();

        return response()->json([
            'reaction' => $reaction ? $reaction->reaction_type : null
        ]);
    }

    /**
     * Remove all user reactions from a pulse
     */
    public function removeAllReactions($pulseId)
    {
        $deleted = PulseReaction::where([
            'pulse_id' => $pulseId,
            'user_id' => Auth::id(),
        ])->delete();

        $reactionsSummary = $this->getReactionsSummary($pulseId);

        return response()->json([
            'message' => 'تم إزالة جميع التفاعلات',
            'removed_count' => $deleted,
            'reactions' => $reactionsSummary,
        ]);
    }
}
